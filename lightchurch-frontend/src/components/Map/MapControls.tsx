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
import { motion } from 'framer-motion';

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
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        color: '#3C4043',
        '&:hover': { bgcolor: '#F8F9FA', color: '#1A73E8' },
        width: 42,
        height: 42,
        minHeight: 42,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
    };

    return (
        <>
            {/* 1. TOP RIGHT: Map Type Toggle (like Google Maps iOS) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: isMobile ? 120 : 80, // Under search bar chips
                    right: 16,
                    zIndex: isMobile ? 3000 : 1000,
                }}
            >
                <Tooltip title={mapType === 'satellite' ? 'Plan' : 'Satellite'} placement="left">
                    <Box 
                        onClick={() => setMapType(mapType === 'satellite' ? 'standard' : 'satellite')} 
                        sx={{ 
                            width: isMobile ? 48 : 56, 
                            height: isMobile ? 48 : 56, 
                            borderRadius: '50%', // Circular on mobile/iOS
                            overflow: 'hidden', 
                            border: '3px solid white', 
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                            position: 'relative', 
                            bgcolor: '#fff',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': { transform: 'scale(1.08)', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' },
                            '&:active': { transform: 'scale(0.95)' }
                        }}
                    >
                        <Box component="img" 
                            src={mapType === 'satellite' ? 'https://mt0.google.com/vt/lyrs=m&x=0&y=0&z=0' : 'https://mt0.google.com/vt/lyrs=s&x=0&y=0&z=0'} 
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        {!isMobile && (
                            <Box sx={{ 
                                position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', 
                                color: 'white', fontSize: '0.65rem', textAlign: 'center', py: 0.5, fontWeight: 500,
                                backdropFilter: 'blur(2px)'
                            }}>
                                {mapType === 'satellite' ? 'Plan' : 'Satellite'}
                            </Box>
                        )}
                    </Box>
                </Tooltip>
            </Box>

            {/* 2. MIDDLE RIGHT: Tools (Above BottomSheet middle position) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: isMobile ? '35%' : 'auto', // Higher on mobile to avoid sheet
                    bottom: isMobile ? 'auto' : 24,
                    right: 16,
                    zIndex: isMobile ? 3000 : 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    alignItems: 'end'
                }}
            >
                {/* My Location */}
                {userLocation && (
                    <Tooltip title="Ma position" placement="left">
                        <span>
                            <Fab
                                sx={{
                                    ...fabStyle,
                                    color: isGeolocated ? '#1A73E8' : '#3C4043'
                                }}
                                onClick={onLocate}
                                size="small"
                                aria-label="my location"
                            >
                                {isLoadingLocation ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
                            </Fab>
                        </span>
                    </Tooltip>
                )}

                {/* Vertical Stack (Zoom + Participations + Home) */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 3, 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden'
                    }}
                >
                    <Tooltip title="Zoom avant" placement="left">
                        <Fab
                            sx={{ 
                                ...fabStyle, 
                                boxShadow: 'none', 
                                border: 'none', 
                                bgcolor: 'transparent',
                                backdropFilter: 'none',
                                borderRadius: 0 
                            }}
                            onClick={() => map.zoomIn()}
                            size="small"
                            aria-label="zoom in"
                        >
                            <AddIcon />
                        </Fab>
                    </Tooltip>
                    
                    <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.06)', mx: 1 }} />
                    
                    <Tooltip title="Zoom arrière" placement="left">
                        <Fab
                            sx={{ 
                                ...fabStyle, 
                                boxShadow: 'none', 
                                border: 'none', 
                                bgcolor: 'transparent',
                                backdropFilter: 'none',
                                borderRadius: 0 
                            }}
                            onClick={() => map.zoomOut()}
                            size="small"
                            aria-label="zoom out"
                        >
                            <RemoveIcon />
                        </Fab>
                    </Tooltip>

                    <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.06)', mx: 1 }} />

                    <Tooltip title="Mes participations" placement="left">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <Fab
                                sx={{ 
                                    ...fabStyle, 
                                    boxShadow: 'none', 
                                    border: 'none', 
                                    bgcolor: 'transparent',
                                    backdropFilter: 'none',
                                    borderRadius: 0 
                                }}
                                onClick={onParticipationsClick}
                                size="small"
                                aria-label="my participations"
                            >
                                <Badge badgeContent={participationsCount} color="error" max={99} sx={{ '& .MuiBadge-badge': { right: -2, top: -2, scale: '0.8' } }}>
                                    <EventIcon sx={{ color: participationsCount > 0 ? '#EA4335' : '#3C4043' }} />
                                </Badge>
                            </Fab>
                        </motion.div>
                    </Tooltip>

                    <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.06)', mx: 1 }} />

                    <Tooltip title="Accueil" placement="left">
                        <Fab
                            sx={{ 
                                ...fabStyle, 
                                boxShadow: 'none', 
                                border: 'none', 
                                bgcolor: 'transparent',
                                backdropFilter: 'none',
                                borderRadius: 0 
                            }}
                            onClick={onHomeClick}
                            size="small"
                            aria-label="home"
                        >
                            <HomeIcon />
                        </Fab>
                    </Tooltip>
                </Box>
            </Box>
        </>
    );
};

export default MapControls;
