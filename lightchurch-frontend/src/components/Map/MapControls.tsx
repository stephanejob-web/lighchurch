import React from 'react';
import { Box, Fab, Tooltip, CircularProgress, useMediaQuery, useTheme, Badge } from '@mui/material';
import {
    MyLocation as MyLocationIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Event as EventIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { useMap } from 'react-leaflet';

interface MapControlsProps {
    onLocate: () => void;
    isLoadingLocation: boolean;
    isGeolocated: boolean;
    mapType: 'satellite' | 'standard';
    setMapType: (type: 'satellite' | 'standard') => void;
    participationsCount: number;
    onParticipationsClick: () => void;
    onHomeClick: () => void;
    userLocation: any;
}

const MapControls: React.FC<MapControlsProps> = ({
    onLocate,
    isLoadingLocation,
    isGeolocated,
    mapType,
    setMapType,
    participationsCount,
    onParticipationsClick,
    onHomeClick,
    userLocation
}) => {
    const map = useMap();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const fabStyle = {
        bgcolor: '#FFFFFF',
        color: '#666',
        '&:hover': { bgcolor: '#F1F3F4', color: '#333' },
        width: 40,
        height: 40,
        minHeight: 40,
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: isMobile ? 120 : 24,
                right: 16,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                alignItems: 'end'
            }}
        >
            {/* Map Type Toggle */}
            <Tooltip title={mapType === 'satellite' ? 'Plan' : 'Satellite'} placement="left">
                 <Box onClick={() => setMapType(mapType === 'satellite' ? 'standard' : 'satellite')} sx={{ 
                        width: 56, height: 56, borderRadius: 2, overflow: 'hidden', border: '2px solid white', cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)', position: 'relative', bgcolor: '#fff', mb: 1,
                        transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' }
                    }}>
                        <Box component="img" 
                            src={mapType === 'satellite' ? 'https://mt0.google.com/vt/lyrs=m&x=0&y=0&z=0' : 'https://mt0.google.com/vt/lyrs=s&x=0&y=0&z=0'} 
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                         <Box sx={{ 
                            position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', 
                            color: 'white', fontSize: '0.65rem', textAlign: 'center', py: 0.5, fontWeight: 500,
                            backdropFilter: 'blur(2px)'
                        }}>
                            {mapType === 'satellite' ? 'Plan' : 'Satellite'}
                        </Box>
                    </Box>
            </Tooltip>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                
                {/* My Location */}
                {userLocation && (
                    <Tooltip title="Ma position" placement="left">
                        <span>
                            <Fab
                                sx={{
                                    ...fabStyle,
                                    color: isGeolocated ? '#1A73E8' : '#666'
                                }}
                                onClick={onLocate}
                                size="small"
                                aria-label="my location"
                            >
                                {isLoadingLocation ? <CircularProgress size={20} /> : <MyLocationIcon />}
                            </Fab>
                        </span>
                    </Tooltip>
                )}

                {/* Zoom Controls */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 0.5 }}>
                    <Tooltip title="Zoom avant" placement="left">
                        <Fab
                            sx={fabStyle}
                            onClick={() => map.zoomIn()}
                            size="small"
                            aria-label="zoom in"
                        >
                            <AddIcon />
                        </Fab>
                    </Tooltip>
                    <Tooltip title="Zoom arrière" placement="left">
                        <Fab
                            sx={fabStyle}
                            onClick={() => map.zoomOut()}
                            size="small"
                            aria-label="zoom out"
                        >
                            <RemoveIcon />
                        </Fab>
                    </Tooltip>
                </Box>

                {/* My Participations */}
                <Tooltip title="Mes participations" placement="left">
                    <Fab
                        sx={fabStyle}
                        onClick={onParticipationsClick}
                        size="small"
                        aria-label="my participations"
                    >
                        <Badge badgeContent={participationsCount} color="error" max={99} sx={{ '& .MuiBadge-badge': { right: -3, top: -3 } }}>
                            <EventIcon sx={{ color: participationsCount > 0 ? '#EA4335' : '#666' }} />
                        </Badge>
                    </Fab>
                </Tooltip>

                 {/* Home */}
                 <Tooltip title="Accueil" placement="left">
                    <Fab
                        sx={fabStyle}
                        onClick={onHomeClick}
                        size="small"
                        aria-label="home"
                    >
                        <HomeIcon />
                    </Fab>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default MapControls;
