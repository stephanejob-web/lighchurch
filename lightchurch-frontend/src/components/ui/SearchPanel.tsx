import React, { useState, useEffect, useRef } from 'react';
import { Paper, InputBase, IconButton, Divider, Box, Chip, Stack, List, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import { Search, CalendarMonth, Church, List as ListIcon, LocationOn, Clear } from '@mui/icons-material';
import { searchCities } from '../../services/geoService';

interface SearchPanelProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: { churches: boolean; events: boolean }) => void;
    onToggleList: () => void;
    onLocationSelect?: (lat: number, lng: number, label: string) => void;
    hideFilters?: boolean;
}

const SearchPanel: React.FC<SearchPanelProps & { embedded?: boolean }> = ({ onSearch, onFilterChange, onToggleList, onLocationSelect, embedded = false, hideFilters = false }) => {
    const [query, setQuery] = useState('');
    const [showChurches, setShowChurches] = useState(true);
    const [showEvents, setShowEvents] = useState(true);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close autocomplete on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsAutocompleteOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // City Search Effect
    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            setIsAutocompleteOpen(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await searchCities(query);
                setSuggestions(results);
                setIsAutocompleteOpen(results.length > 0);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleToggleChurches = () => {
        const newState = !showChurches;
        setShowChurches(newState);
        onFilterChange({ churches: newState, events: showEvents });
    };

    const handleToggleEvents = () => {
        const newState = !showEvents;
        setShowEvents(newState);
        onFilterChange({ churches: showChurches, events: newState });
    };

    const handleSelectLocation = (suggestion: any) => {
        setQuery(suggestion.label); // Optional: keep full text or clear
        setIsAutocompleteOpen(false);
        if (onLocationSelect) {
            onLocationSelect(suggestion.latitude, suggestion.longitude, suggestion.label);
        }
    };

    return (
        <Box
            ref={wrapperRef}
            sx={embedded ? {
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: '100%',
                bgcolor: '#fff',
                zIndex: 2000,
                flexShrink: 0,
                borderBottom: '1px solid #f0f0f0',
                position: 'relative'
            } : {
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: { xs: 'calc(100% - 32px)', sm: 360 },
            }}
        >
            {/* Search Bar */}
            <Paper
                component="form"
                elevation={embedded ? 0 : 1}
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 8, // Google Maps Desktop style (rounded rect, not full pill in sidebar)
                    // Google Maps search bar is more rounded. Let's try 8px (2) or 24px (pill) if we want "Google" style. 
                    // But in sidebar it's usually a rectangle with rounded corners.

                    boxShadow: embedded ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
                    border: embedded ? '1px solid #dadce0' : 'none',
                    position: 'relative',
                    bgcolor: '#fff',
                    transition: 'box-shadow 0.2s',
                    '&:hover': embedded ? {
                        boxShadow: '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                    } : {}
                }}
                onSubmit={(e) => { e.preventDefault(); onSearch(query); setIsAutocompleteOpen(false); }}
            >
                <IconButton sx={{ p: '10px' }} aria-label="menu">
                    {embedded ? <Search sx={{ color: '#5F6368' }} /> : <Search sx={{ color: '#5F6368' }} />}
                </IconButton>
                <InputBase
                    sx={{
                        ml: 1,
                        flex: 1,
                        color: '#202124',
                        '& .MuiInputBase-input::placeholder': {
                            color: '#5F6368',
                            opacity: 1
                        }
                    }}
                    placeholder="Rechercher une ville..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setIsAutocompleteOpen(true); }}
                />

                {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}

                {query && (
                    <IconButton size="small" onClick={() => { setQuery(''); setSuggestions([]); }} sx={{ p: '10px' }}>
                        <Clear />
                    </IconButton>
                )}

                {!embedded && (
                    <>
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                        {/* List Toggle Button */}
                        <IconButton
                            color="primary"
                            sx={{ p: '10px' }}
                            aria-label="toggle list"
                            onClick={onToggleList}
                        >
                            <ListIcon />
                        </IconButton>
                    </>
                )}
            </Paper>

            {/* Autocomplete Dropdown */}
            {isAutocompleteOpen && suggestions.length > 0 && (
                <Paper
                    elevation={3}
                    sx={{
                        mt: 0.5,
                        maxHeight: 300,
                        overflow: 'auto',
                        borderRadius: 2,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        bgcolor: '#FFFFFF', // Explicit white
                        position: embedded ? 'absolute' : 'static',
                        top: embedded ? '100%' : 'auto',
                        width: '100%',
                        zIndex: 2100
                    }}
                >
                    <List disablePadding>
                        {suggestions.map((suggestion, index) => (
                            <ListItemButton
                                key={index}
                                onClick={() => handleSelectLocation(suggestion)}
                                divider={index < suggestions.length - 1}
                                sx={{
                                    '&:hover': { bgcolor: '#F1F3F4' }
                                }}
                            >
                                <LocationOn sx={{ mr: 2, color: '#5F6368' }} />
                                <ListItemText
                                    primary={suggestion.label}
                                    secondary={suggestion.context}
                                    primaryTypographyProps={{ color: '#202124', fontWeight: 400 }}
                                    secondaryTypographyProps={{ color: '#70757A' }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Filter Chips - Only show in SearchPanel if NOT embedded and NOT hidden
               Actually, in Google Maps, filters are often under the search box.
               Let's keep them here but style them fittingly.
            */}
            {!embedded && !hideFilters && (
                <Stack 
                    direction="row" 
                    spacing={1}
                    sx={{
                        mt: 0.5,
                        overflowX: 'auto',
                        pb: 0.5, // Space for scrollbar if any (though hidden)
                        px: 0.5, // Padding for box shadow visibility
                        // Hide scrollbar
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        '-ms-overflow-style': 'none',
                        width: '100%',
                        flexShrink: 0
                    }}
                >
                    <Chip
                        icon={<Church />}
                        label="Églises"
                        clickable
                        color={showChurches ? 'primary' : 'default'}
                        variant={showChurches ? 'filled' : 'outlined'}
                        onClick={handleToggleChurches}
                        sx={{
                            backgroundColor: showChurches ? '#4285F4' : '#FFFFFF',
                            color: showChurches ? '#FFFFFF' : '#3C4043',
                            fontWeight: 500,
                            borderColor: showChurches ? 'transparent' : '#DADCE0',
                            boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                            flexShrink: 0,
                            '&:hover': {
                                backgroundColor: showChurches ? '#3367D6' : '#F8F9FA',
                            }
                        }}
                    />
                    <Chip
                        icon={<CalendarMonth />}
                        label="Événements"
                        clickable
                        color={showEvents ? 'secondary' : 'default'}
                        variant={showEvents ? 'filled' : 'outlined'}
                        onClick={handleToggleEvents}
                        sx={{
                            backgroundColor: showEvents ? '#EA4335' : '#FFFFFF',
                            color: showEvents ? '#FFFFFF' : '#3C4043',
                            fontWeight: 500,
                            borderColor: showEvents ? 'transparent' : '#DADCE0',
                            boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                            flexShrink: 0,
                            '&:hover': {
                                backgroundColor: showEvents ? '#C5221F' : '#F8F9FA',
                            }
                        }}
                    />
                </Stack>
            )}
        </Box>
    );
};

export default SearchPanel;
