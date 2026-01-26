import { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    InputAdornment,
    Button,
    Alert
} from '@mui/material';
import {
    LocationOn as LocationOnIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import ManualAddressInput from './ManualAddressInput';

interface AddressSuggestion {
    label: string;
    city: string;
    postcode: string;
    name: string;
    street: string;
    housenumber?: string;
    coordinates: [number, number]; // [longitude, latitude]
}

interface AddressData {
    street_number: string;
    street_name: string;
    postal_code: string;
    city: string;
    latitude: number;
    longitude: number;
    full_address: string;
}

interface AddressAutocompleteProps {
    onAddressSelect: (address: AddressData) => void;
    defaultValue?: string;
    error?: string;
}

export default function AddressAutocomplete({
    onAddressSelect,
    defaultValue = '',
    error
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [manualMode, setManualMode] = useState(false);
    const [apiError, setApiError] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fermer la liste quand on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recherche avec fallback automatique (data.gouv.fr → Nominatim)
    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Tentative 1 : API française (data.gouv.fr)
                let response = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
                    { signal: AbortSignal.timeout(5000) }
                );

                if (!response.ok) throw new Error('data.gouv.fr unavailable');

                const data = await response.json();

                if (data.features && data.features.length > 0) {
                    const formattedSuggestions: AddressSuggestion[] = data.features.map((feature: any) => ({
                        label: feature.properties.label,
                        city: feature.properties.city,
                        postcode: feature.properties.postcode,
                        name: feature.properties.name,
                        street: feature.properties.street || feature.properties.name,
                        housenumber: feature.properties.housenumber,
                        coordinates: feature.geometry.coordinates, // [lng, lat]
                    }));

                    setSuggestions(formattedSuggestions);
                    setIsOpen(true);
                    setIsLoading(false);
                    return;
                }

                // Si aucun résultat de data.gouv.fr, essayer Nominatim
                console.warn('data.gouv.fr returned no results, trying Nominatim...');
                throw new Error('No results from data.gouv.fr');

            } catch (error) {
                // Tentative 2 : Nominatim (fallback international)
                console.warn('Trying Nominatim as fallback...', error);
                try {
                    const nominatimResponse = await fetch(
                        `https://nominatim.openstreetmap.org/search?` +
                        `q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
                        {
                            headers: { 'User-Agent': 'LightChurch/1.0' },
                            signal: AbortSignal.timeout(5000)
                        }
                    );

                    const nominatimData = await nominatimResponse.json();

                    const formattedSuggestions: AddressSuggestion[] = nominatimData.map((place: any) => ({
                        label: place.display_name,
                        city: place.address?.city || place.address?.town || place.address?.village || '',
                        postcode: place.address?.postcode || '',
                        name: place.address?.road || place.display_name,
                        street: place.address?.road || '',
                        housenumber: place.address?.house_number,
                        coordinates: [parseFloat(place.lon), parseFloat(place.lat)], // [lng, lat]
                    }));

                    setSuggestions(formattedSuggestions);
                    setIsOpen(true);
                } catch (nominatimError) {
                    console.error('Toutes les APIs de géocodage ont échoué:', nominatimError);
                    setSuggestions([]);
                    setApiError(true); // Marquer qu'il y a eu une erreur
                }
            } finally {
                setIsLoading(false);
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelectAddress = (suggestion: AddressSuggestion) => {
        const addressData: AddressData = {
            street_number: suggestion.housenumber || '',
            street_name: suggestion.street,
            postal_code: suggestion.postcode,
            city: suggestion.city,
            longitude: suggestion.coordinates[0],
            latitude: suggestion.coordinates[1],
            full_address: suggestion.label,
        };

        setQuery(suggestion.label);
        setIsOpen(false);
        onAddressSelect(addressData);
    };

    // Si mode manuel activé
    if (manualMode) {
        return (
            <Box>
                <Button
                    onClick={() => setManualMode(false)}
                    startIcon={<SearchIcon />}
                    sx={{ mb: 2 }}
                >
                    Retour à la recherche automatique
                </Button>
                <ManualAddressInput onAddressSelect={onAddressSelect} />
            </Box>
        );
    }

    return (
        <Box ref={wrapperRef} sx={{ position: 'relative' }}>
            {/* Alerte si les APIs ne fonctionnent pas */}
            {apiError && (
                <Alert
                    severity="warning"
                    icon={<WarningIcon />}
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => setManualMode(true)}
                        >
                            Saisir manuellement
                        </Button>
                    }
                >
                    Les services d'adresses sont temporairement indisponibles
                </Alert>
            )}

            <TextField
                fullWidth
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        Rechercher une adresse
                        <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
                    </Box>
                }
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setApiError(false); // Réinitialiser l'erreur lors d'une nouvelle saisie
                }}
                placeholder="Ex: 10 Rue de la Paix, Paris"
                error={!!error}
                helperText={error || "💡 Tapez au moins 3 caractères pour rechercher une adresse"}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                    endAdornment: isLoading ? (
                        <InputAdornment position="end">
                            <CircularProgress size={20} />
                        </InputAdornment>
                    ) : null,
                }}
            />

            {/* Bouton pour basculer en mode manuel */}
            {!apiError && (
                <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setManualMode(true)}
                    sx={{ mt: 1 }}
                >
                    Saisir manuellement
                </Button>
            )}

            {/* Liste des suggestions */}
            {isOpen && suggestions.length > 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        position: 'absolute',
                        zIndex: 1300,
                        width: '100%',
                        mt: 0.5,
                        maxHeight: 300,
                        overflow: 'auto'
                    }}
                >
                    <List disablePadding>
                        {suggestions.map((suggestion, index) => (
                            <ListItem key={`${suggestion.label}-${suggestion.postcode}-${index}`} disablePadding>
                                <ListItemButton onClick={() => handleSelectAddress(suggestion)}>
                                    <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <ListItemText
                                        primary={suggestion.label}
                                        secondary={`${suggestion.city} • ${suggestion.postcode}`}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Message si aucun résultat */}
            {isOpen && !isLoading && query.length >= 3 && suggestions.length === 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        position: 'absolute',
                        zIndex: 1300,
                        width: '100%',
                        mt: 0.5,
                        p: 2,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Aucune adresse trouvée
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        Vérifiez l'orthographe ou essayez une autre adresse
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}
