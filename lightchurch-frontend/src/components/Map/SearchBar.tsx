import React, { useState, useEffect, useRef } from 'react';
import {
    Paper,
    InputBase,
    IconButton,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Typography
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    LocationOn as LocationOnIcon
} from '@mui/icons-material';

interface AddressSuggestion {
    label: string;
    city: string;
    postcode: string;
    coordinates: [number, number]; // [longitude, latitude]
}

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onLocationSelect?: (lat: number, lng: number, label: string) => void;
}

/**
 * Barre de recherche flottante style Google Maps avec autocomplete d'adresses
 * Optimisée avec React.memo
 */
const SearchBar: React.FC<SearchBarProps> = React.memo(({
    value,
    onChange,
    onLocationSelect
}) => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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

    // Recherche d'adresses avec l'API du gouvernement français
    useEffect(() => {
        if (value.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`
                );
                const data = await response.json();

                const formattedSuggestions: AddressSuggestion[] = data.features.map((feature: any) => ({
                    label: feature.properties.label,
                    city: feature.properties.city,
                    postcode: feature.properties.postcode,
                    coordinates: feature.geometry.coordinates, // [lng, lat]
                }));

                setSuggestions(formattedSuggestions);
                setIsOpen(formattedSuggestions.length > 0);
            } catch (error) {
                console.error('Erreur API adresse:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [value]);

    const handleSelectLocation = (suggestion: AddressSuggestion) => {
        onChange(''); // Vider le champ après sélection
        setIsOpen(false);

        if (onLocationSelect) {
            // coordinates = [longitude, latitude]
            onLocationSelect(suggestion.coordinates[1], suggestion.coordinates[0], suggestion.label);
        }
    };


    return (
        <Box
            ref={wrapperRef}
            sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: { xs: 'calc(100% - 32px)', sm: 500 },
                maxWidth: 500
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <IconButton sx={{ p: 1.5, color: 'rgba(255, 255, 255, 0.7)' }} disabled>
                    <SearchIcon />
                </IconButton>

                <InputBase
                    placeholder="Rechercher une ville, adresse..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    sx={{
                        flex: 1,
                        fontSize: '0.95rem',
                        pr: 1,
                        color: 'white',
                        '& input': {
                            color: 'white',
                            '&::placeholder': {
                                color: 'rgba(255, 255, 255, 0.5)',
                                opacity: 1
                            }
                        }
                    }}
                />

                {isLoading && (
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                )}

                {value && !isLoading && (
                    <IconButton
                        size="small"
                        onClick={() => {
                            onChange('');
                            setIsOpen(false);
                        }}
                        sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.8)' }}
                    >
                        <ClearIcon fontSize="small" />
                    </IconButton>
                )}
            </Paper>

            {/* Liste des suggestions d'adresses */}
            {isOpen && suggestions.length > 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        mt: 0.5,
                        maxHeight: 300,
                        overflow: 'auto',
                        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <List disablePadding>
                        <ListItem sx={{
                            py: 0.5,
                            px: 2,
                            backgroundColor: 'rgba(0, 0, 0, 0.2)'
                        }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} fontWeight={600}>
                                📍 RECHERCHE GÉOGRAPHIQUE
                            </Typography>
                        </ListItem>
                        {suggestions.map((suggestion) => (
                            <ListItem key={`${suggestion.label}-${suggestion.postcode}`} disablePadding>
                                <ListItemButton
                                    onClick={() => handleSelectLocation(suggestion)}
                                    sx={{
                                        py: 1.5,
                                        px: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                        }
                                    }}
                                >
                                    <LocationOnIcon sx={{ mr: 1.5, color: '#3498db', fontSize: 20 }} />
                                    <ListItemText
                                        primary={suggestion.label}
                                        secondary={`${suggestion.city} • ${suggestion.postcode}`}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            fontWeight: 500,
                                            color: 'rgba(255, 255, 255, 0.95)'
                                        }}
                                        secondaryTypographyProps={{
                                            variant: 'caption',
                                            color: 'rgba(255, 255, 255, 0.6)'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
