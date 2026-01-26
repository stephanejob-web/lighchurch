import React, { useState } from 'react';
import { Paper, Box, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface SidebarProps {
    children: React.ReactNode;
    width?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ children, width = 400 }) => {
    const [collapsed, setCollapsed] = useState(false);
    const SIDEBAR_WIDTH = width;

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: SIDEBAR_WIDTH,
                zIndex: 1100, // Higher than map, lower than modals
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible',
                backgroundColor: '#fff',
                borderRight: '1px solid #dadce0',
                transform: collapsed ? `translateX(-${SIDEBAR_WIDTH}px)` : 'translateX(0)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
        >
            {/* Main Content (Hidden when collapsed to prevent focus/interaction) */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                visibility: collapsed ? 'hidden' : 'visible'
            }}>
                {children}
            </Box>

            {/* Google Maps Style Toggle Button */}
            <Tooltip title={collapsed ? "Développer le panneau latéral" : "Réduire le panneau latéral"} placement="right">
                <Paper
                    elevation={4}
                    onClick={() => setCollapsed(!collapsed)}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        right: -24, // Half width (48/2) outside, sticking out
                        width: 24, // Visible width
                        height: 48,
                        transform: 'translateY(-50%)',
                        bgcolor: '#FFFFFF',
                        borderRadius: '0 8px 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 1200,
                        borderLeft: '1px solid #DADCE0',
                        '&:hover': {
                            bgcolor: '#F1F3F4'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {collapsed ? <ChevronRight sx={{ fontSize: 20, color: '#5f6368' }} /> : <ChevronLeft sx={{ fontSize: 20, color: '#5f6368' }} />}
                    </Box>
                </Paper>
            </Tooltip>
        </Paper>
    );
};

export default Sidebar;
