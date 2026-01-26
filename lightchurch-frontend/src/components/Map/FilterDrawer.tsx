import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Stack,
    Button
} from '@mui/material';
import {
    Close as CloseIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import type { MapFilters } from '../../types/publicMap';

interface FilterDrawerProps {
    open: boolean;
    onClose: () => void;
    filters: MapFilters;
    onFiltersChange: (filters: Partial<MapFilters>) => void;
    denominations: Array<{ id: number; name: string }>;
}

/**
 * Drawer de filtres avancés style Google Maps
 */
const FilterDrawer: React.FC<FilterDrawerProps> = React.memo(({
    open,
    onClose,
    filters,
    onFiltersChange,
    denominations
}) => {
    const handleRadiusChange = (_event: Event, newValue: number | number[]) => {
        onFiltersChange({ radius: newValue as number });
    };

    const handleDenominationChange = (event: any) => {
        const value = event.target.value;
        onFiltersChange({
            denominationId: value === 'all' ? null : parseInt(value)
        });
    };

    const handleReset = () => {
        onFiltersChange({
            radius: 50,
            denominationId: null,
            showChurches: true,
            showEvents: true,
            search: ''
        });
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: '100%', sm: 400 },
                    p: 0
                }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* En-tête */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FilterIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Filtres
                        </Typography>
                    </Stack>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Contenu des filtres */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                    <Stack spacing={4}>
                        {/* Filtre: Dénomination */}
                        <FormControl fullWidth>
                            <InputLabel id="denomination-label">
                                Dénomination
                            </InputLabel>
                            <Select
                                labelId="denomination-label"
                                id="denomination-select"
                                value={filters.denominationId?.toString() || 'all'}
                                label="Dénomination"
                                onChange={handleDenominationChange}
                            >
                                <MenuItem value="all">
                                    <em>Toutes les dénominations</em>
                                </MenuItem>
                                {denominations.map((denom) => (
                                    <MenuItem key={denom.id} value={denom.id.toString()}>
                                        {denom.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider />

                        {/* Filtre: Rayon de recherche */}
                        <Box>
                            <Typography gutterBottom fontWeight={600}>
                                Rayon de recherche
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Afficher les résultats dans un rayon de {filters.radius} km
                            </Typography>
                            <Box sx={{ px: 1, mt: 2 }}>
                                <Slider
                                    value={filters.radius}
                                    onChange={handleRadiusChange}
                                    min={1}
                                    max={1000}
                                    step={1}
                                    marks={[
                                        { value: 1, label: '1 km' },
                                        { value: 50, label: '50 km' },
                                        { value: 100, label: '100 km' },
                                        { value: 500, label: '500 km' },
                                        { value: 1000, label: '1000 km' }
                                    ]}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(value) => `${value} km`}
                                />
                            </Box>
                        </Box>

                        <Divider />

                        {/* Info sur les résultats */}
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: 'action.hover',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                <strong>Astuce:</strong> Déplacez la carte pour charger automatiquement les églises et événements de la zone visible.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Footer avec bouton Reset */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider'
                    }}
                >
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleReset}
                        sx={{ borderRadius: 2 }}
                    >
                        Réinitialiser les filtres
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
});

FilterDrawer.displayName = 'FilterDrawer';

export default FilterDrawer;
