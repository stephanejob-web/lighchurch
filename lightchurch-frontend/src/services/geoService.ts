import axios from 'axios';

interface CitySuggestion {
    label: string;
    score: number;
    id: string;
    type: string;
    name: string;
    postcode: string;
    citycode: string;
    x: number;
    y: number;
    city: string;
    context: string;
    importance: number;
    street: string;
    latitude: number;
    longitude: number;
    label_short?: string;
}

interface GeoApiResponse {
    features: {
        type: string;
        geometry: {
            type: string;
            coordinates: [number, number];
        };
        properties: CitySuggestion;
    }[];
}

interface NominatimResponse {
    lat: string;
    lon: string;
    display_name: string;
    address?: {
        road?: string;
        house_number?: string;
        postcode?: string;
        city?: string;
        town?: string;
        village?: string;
    };
}

// API 1 : data.gouv.fr (France uniquement, rapide)
const geocodeWithDataGouv = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    try {
        const response = await axios.get<GeoApiResponse>(`https://api-adresse.data.gouv.fr/search/`, {
            params: {
                q: address,
                limit: 1,
                autocomplete: 0
            },
            timeout: 10000 // 5 secondes max
        });

        const feature = response.data.features[0];
        if (!feature) return null;

        return {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0]
        };
    } catch (error) {
        console.warn('data.gouv.fr unavailable, trying fallback...', error);
        return null;
    }
};

// API 2 : Nominatim OpenStreetMap (International, gratuit)
const geocodeWithNominatim = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    try {
        const response = await axios.get<NominatimResponse[]>(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: address,
                format: 'json',
                limit: 1,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'LightChurch/1.0' // Nominatim require un User-Agent
            },
            timeout: 10000
        });

        const result = response.data[0];
        if (!result) return null;

        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
        };
    } catch (error) {
        console.warn('Nominatim unavailable:', error);
        return null;
    }
};

export const searchCities = async (query: string): Promise<CitySuggestion[]> => {
    if (!query || query.length < 3) return [];

    try {
        const response = await axios.get<GeoApiResponse>(`https://api-adresse.data.gouv.fr/search/`, {
            params: {
                q: query,
                type: 'municipality', // Limit to cities
                limit: 5,
                autocomplete: 1
            },
            timeout: 10000 // 5 secondes max
        });

        return response.data.features.map(feature => ({
            ...feature.properties,
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            label: `${feature.properties.city} (${feature.properties.postcode})`
        }));
    } catch (error) {
        console.error('Error searching cities:', error);
        return [];
    }
};

/**
 * Géocode une adresse avec système de fallback automatique
 * 1. Essaye data.gouv.fr (France, rapide)
 * 2. Si échec, essaye Nominatim (International, gratuit)
 * 3. Si tout échoue, retourne null
 */
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!address || address.trim().length === 0) return null;

    // Tentative 1 : data.gouv.fr
    const dataGouvResult = await geocodeWithDataGouv(address);
    if (dataGouvResult) {
        return dataGouvResult;
    }

    // Tentative 2 : Nominatim (fallback)
    const nominatimResult = await geocodeWithNominatim(address);
    if (nominatimResult) {
        return nominatimResult;
    }

    // Échec total
    console.error('❌ Toutes les APIs de géocodage ont échoué');
    return null;
};

/**
 * Géocode avec fallback et retourne aussi le statut de l'API utilisée
 */
export const geocodeAddressWithStatus = async (address: string): Promise<{
    coordinates: { latitude: number; longitude: number } | null;
    apiUsed: 'data.gouv.fr' | 'nominatim' | 'failed';
}> => {
    if (!address || address.trim().length === 0) {
        return { coordinates: null, apiUsed: 'failed' };
    }

    // Tentative 1
    const dataGouvResult = await geocodeWithDataGouv(address);
    if (dataGouvResult) {
        return { coordinates: dataGouvResult, apiUsed: 'data.gouv.fr' };
    }

    // Tentative 2
    const nominatimResult = await geocodeWithNominatim(address);
    if (nominatimResult) {
        return { coordinates: nominatimResult, apiUsed: 'nominatim' };
    }

    return { coordinates: null, apiUsed: 'failed' };
};
