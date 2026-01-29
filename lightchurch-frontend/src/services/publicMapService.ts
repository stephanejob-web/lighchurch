import api from '../lib/axios';
import type {
    Church,
    ChurchDetails,
    Event,
    EventDetails,
    Denomination,
    ApiResponse
} from '../types/publicMap';

/**
 * Service pour l'API publique de la carte
 * Gestion complète des erreurs et types strict TypeScript
 */

interface FetchChurchesParams {
    // Bounding box (prioritaire)
    north?: number;
    south?: number;
    east?: number;
    west?: number;
    // Distance radius (fallback)
    latitude?: number;
    longitude?: number;
    radius?: number;
    // Point de référence pour calcul de distance
    userLat?: number;
    userLng?: number;
    // Autres filtres
    denominationId?: number;
    search?: string;
    limit?: number;
    offset?: number;
}

interface FetchEventsParams {
    // Bounding box (prioritaire)
    north?: number;
    south?: number;
    east?: number;
    west?: number;
    // Distance radius (fallback)
    latitude?: number;
    longitude?: number;
    radius?: number;
    // Point de référence pour calcul de distance
    userLat?: number;
    userLng?: number;
    // Autres filtres
    search?: string;
    limit?: number;
    offset?: number;
}

/**
 * Récupère les clusters pré-calculés côté serveur
 * ULTRA-RAPIDE pour les vues à faible zoom
 */
export interface ServerCluster {
    id: string;
    lat: number;
    lng: number;
    count: number;
    sampleName: string;
    sampleId: number | null;
}

export const fetchServerClusters = async (params: {
    north?: number;
    south?: number;
    east?: number;
    west?: number;
    zoom?: number;
}): Promise<{ churchClusters: ServerCluster[]; eventClusters: ServerCluster[] }> => {
    try {
        const { data } = await api.get<{
            success: boolean;
            churchClusters: ServerCluster[];
            eventClusters: ServerCluster[];
        }>('/public/clusters', {
            params: {
                north: params.north,
                south: params.south,
                east: params.east,
                west: params.west,
                zoom: params.zoom
            }
        });

        if (!data.success) {
            throw new Error('Erreur lors du chargement des clusters');
        }

        return {
            churchClusters: data.churchClusters || [],
            eventClusters: data.eventClusters || []
        };
    } catch (error: any) {
        console.error('Error fetching clusters:', error);
        return { churchClusters: [], eventClusters: [] };
    }
};

/**
 * Récupère uniquement les données minimales des églises pour l'affichage sur la carte
 * OPTIMISATION: ~70-80% de réduction des données vs fetchChurches
 * @throws Error si la requête échoue
 */
export const fetchChurchesMarkers = async (
    params: FetchChurchesParams
): Promise<Church[]> => {
    try {
        const { data } = await api.get<ApiResponse<Church[]>>('/public/churches/markers', {
            params: {
                north: params.north,
                south: params.south,
                east: params.east,
                west: params.west,
                latitude: params.latitude,
                longitude: params.longitude,
                radius: params.radius || 50,
                denomination_id: params.denominationId,
                limit: params.limit || 500
            }
        });

        if (!data.success || !data.churches) {
            throw new Error(data.message || 'Erreur lors du chargement des marqueurs');
        }

        return data.churches;
    } catch (error: any) {
        console.error('Error fetching church markers:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Impossible de charger les marqueurs d\'églises'
        );
    }
};

/**
 * Récupère uniquement les données minimales des événements pour l'affichage sur la carte
 * OPTIMISATION: ~70-80% de réduction des données vs fetchEvents
 * @throws Error si la requête échoue
 */
export const fetchEventsMarkers = async (
    params: FetchEventsParams
): Promise<Event[]> => {
    try {
        const { data } = await api.get<ApiResponse<Event[]>>('/public/events/markers', {
            params: {
                north: params.north,
                south: params.south,
                east: params.east,
                west: params.west,
                latitude: params.latitude,
                longitude: params.longitude,
                radius: params.radius || 50,
                limit: params.limit || 500
            }
        });

        if (!data.success || !data.events) {
            throw new Error(data.message || 'Erreur lors du chargement des marqueurs');
        }

        return data.events;
    } catch (error: any) {
        console.error('Error fetching event markers:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Impossible de charger les marqueurs d\'événements'
        );
    }
};

/**
 * Récupère à la fois les marqueurs d'églises et d'événements (optimisé)
 * Utilise les endpoints /markers pour des performances maximales
 */
export const fetchChurchesAndEventsMarkers = async (
    params: FetchChurchesParams & FetchEventsParams
): Promise<{ churches: Church[]; events: Event[] }> => {
    try {
        const [churches, events] = await Promise.all([
            fetchChurchesMarkers(params),
            fetchEventsMarkers(params)
        ]);

        return { churches, events };
    } catch (error: any) {
        console.error('Error fetching markers:', error);
        throw error;
    }
};

/**
 * Interface pour les résultats paginés
 */
export interface PaginatedResult<T> {
    data: T[];
    hasMore: boolean;
    total?: number;
}

/**
 * Récupère les églises de manière paginée pour le ResultsPanel
 * @returns Les églises avec indication s'il y en a plus
 */
export const fetchChurchesPaginated = async (
    params: FetchChurchesParams
): Promise<PaginatedResult<Church>> => {
    try {
        const limit = params.limit || 20;
        const { data } = await api.get<ApiResponse<Church[]> & { total?: number }>('/public/churches/markers', {
            params: {
                north: params.north,
                south: params.south,
                east: params.east,
                west: params.west,
                latitude: params.latitude,
                longitude: params.longitude,
                radius: params.radius || 50,
                denomination_id: params.denominationId,
                search: params.search,
                limit: limit,
                offset: params.offset || 0
            }
        });

        if (!data.success || !data.churches) {
            throw new Error(data.message || 'Erreur lors du chargement des églises');
        }

        return {
            data: data.churches,
            hasMore: data.churches.length === limit,
            total: data.total
        };
    } catch (error: any) {
        console.error('Error fetching churches paginated:', error);
        throw error;
    }
};

/**
 * Récupère les événements de manière paginée pour le ResultsPanel
 * @returns Les événements avec indication s'il y en a plus
 */
export const fetchEventsPaginated = async (
    params: FetchEventsParams
): Promise<PaginatedResult<Event>> => {
    try {
        const limit = params.limit || 20;
        const { data } = await api.get<ApiResponse<Event[]> & { total?: number }>('/public/events/markers', {
            params: {
                north: params.north,
                south: params.south,
                east: params.east,
                west: params.west,
                latitude: params.latitude,
                longitude: params.longitude,
                radius: params.radius || 50,
                search: params.search,
                limit: limit,
                offset: params.offset || 0
            }
        });

        if (!data.success || !data.events) {
            throw new Error(data.message || 'Erreur lors du chargement des événements');
        }

        return {
            data: data.events,
            hasMore: data.events.length === limit,
            total: data.total
        };
    } catch (error: any) {
        console.error('Error fetching events paginated:', error);
        throw error;
    }
};

/**
 * Récupère la liste des églises avec filtres optionnels
 * @throws Error si la requête échoue
 */
export const fetchChurches = async (
    params: FetchChurchesParams
): Promise<Church[]> => {
    try {
        const { data } = await api.get<ApiResponse<Church[]>>('/public/churches', {
            params: {
                // Bounding box
                north: params.north,
                south: params.south,
                east: params.east,
                west: params.west,
                // Distance radius
                latitude: params.latitude,
                longitude: params.longitude,
                radius: params.radius || 50,
                // Point de référence pour distance
                userLat: params.userLat,
                userLng: params.userLng,
                // Autres filtres
                denomination_id: params.denominationId,
                search: params.search,
                limit: params.limit || 300
            }
        });

        if (!data.success || !data.churches) {
            throw new Error(data.message || 'Erreur lors du chargement des églises');
        }

        return data.churches;
    } catch (error: any) {
        console.error('Error fetching churches:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Impossible de charger les églises'
        );
    }
};

/**
 * Récupère les détails complets d'une église
 * @throws Error si l'église n'existe pas ou si la requête échoue
 */
export const fetchChurchDetails = async (id: number): Promise<ChurchDetails> => {
    try {
        const { data } = await api.get<ApiResponse<ChurchDetails>>(
            `/public/churches/${id}`
        );

        if (!data.success || !data.church) {
            throw new Error(data.message || 'Église non trouvée');
        }

        return data.church;
    } catch (error: any) {
        console.error('Error fetching church details:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Impossible de charger les détails de l\'église'
        );
    }
};

/**
 * Récupère la liste des événements avec filtres optionnels
 * @throws Error si la requête échoue
 */
export const fetchEvents = async (
    params: FetchEventsParams
): Promise<Event[]> => {
    try {
        const { data } = await api.get<ApiResponse<Event[]>>('/public/events', {
            params: {
                // Bounding box
                north: params.north,
                south: params.south,
                east: params.east,
                west: params.west,
                // Distance radius
                latitude: params.latitude,
                longitude: params.longitude,
                radius: params.radius || 50,
                // Point de référence pour distance
                userLat: params.userLat,
                userLng: params.userLng,
                // Autres filtres
                search: params.search,
                limit: params.limit || 300
            }
        });

        if (!data.success || !data.events) {
            throw new Error(data.message || 'Erreur lors du chargement des événements');
        }

        return data.events;
    } catch (error: any) {
        console.error('Error fetching events:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Impossible de charger les événements'
        );
    }
};

/**
 * Récupère les détails complets d'un événement
 * @throws Error si l'événement n'existe pas ou si la requête échoue
 */
export const fetchEventDetails = async (id: number): Promise<EventDetails> => {
    try {
        const { data } = await api.get<ApiResponse<EventDetails>>(
            `/public/events/${id}`
        );

        if (!data.success || !data.event) {
            throw new Error(data.message || 'Événement non trouvé');
        }

        return data.event;
    } catch (error: any) {
        console.error('Error fetching event details:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Impossible de charger les détails de l\'événement'
        );
    }
};

/**
 * Récupère la liste de toutes les dénominations pour les filtres
 * @throws Error si la requête échoue
 */
export const fetchDenominations = async (): Promise<Denomination[]> => {
    try {
        const { data } = await api.get<ApiResponse<Denomination[]>>(
            '/public/denominations'
        );

        if (!data.success || !data.denominations) {
            throw new Error(data.message || 'Erreur lors du chargement des dénominations');
        }

        return data.denominations;
    } catch (error: any) {
        console.error('Error fetching denominations:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Impossible de charger les dénominations'
        );
    }
};

/**
 * Récupère les statistiques globales de la plateforme
 */
export const fetchPlatformStats = async (): Promise<{ churches: number; events: number }> => {
    try {
        const { data } = await api.get<ApiResponse<{ churches: number; events: number }>>(
            '/public/stats'
        );

        if (!data.success || !data.stats) {
            // Fallback silencieux en cas d'erreur API spécifique
            return { churches: 500, events: 1200 };
        }

        return data.stats;
    } catch (error) {
        console.error('Error fetching stats, using fallback:', error);
        return { churches: 500, events: 1200 }; // Valeurs par défaut "Social Proof"
    }
};

/**
 * Utilitaire : Récupère à la fois les églises et les événements
 * Optimisation: Appels parallèles avec Promise.all
 */
export const fetchChurchesAndEvents = async (
    params: FetchChurchesParams & FetchEventsParams
): Promise<{ churches: Church[]; events: Event[] }> => {
    try {
        const [churches, events] = await Promise.all([
            fetchChurches(params),
            fetchEvents(params)
        ]);

        return { churches, events };
    } catch (error: any) {
        console.error('Error fetching churches and events:', error);
        throw error;
    }
};

/**
 * Utilitaire : Formate la distance pour l'affichage
 */
export const formatDistance = (distanceKm: number | null | undefined): string => {
    if (distanceKm == null) return '';

    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }

    return `${distanceKm.toFixed(1)} km`;
};

/**
 * Utilitaire : Obtient la géolocalisation de l'utilisateur
 * @returns Promise avec les coordonnées ou null si refusé/indisponible
 */
export const getUserLocation = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported');
            resolve(null);
            return;
        }

        const timeoutId = setTimeout(() => {
            console.warn('Geolocation timeout after 10s');
            resolve(null);
        }, 10000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                resolve(position);
            },
            (error) => {
                clearTimeout(timeoutId);
                console.warn('Geolocation error:', error.message);
                resolve(null);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // Cache 5 minutes
            }
        );
    });
};
