import React from 'react';
import { Box, useTheme } from '@mui/material';

interface MapLayoutProps {
    children: React.ReactNode;
}

const MapLayout: React.FC<MapLayoutProps> = ({ children }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: theme.palette.background.default,
            }}
        >
            {/* 
        The map and overlays will be children.
        We establish a coordinate system where:
        z-index 0: Map
        z-index 100+: Floating UI
      */}
            {children}
        </Box>
    );
};

export default MapLayout;
