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
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 1100,
                pointerEvents: 'none', // Allow clicks to pass through empty space around the card
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start', // Align to top
                p: 2, // Margins from edge
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: SIDEBAR_WIDTH,
                    maxHeight: '100%',
                    pointerEvents: 'auto', // Re-enable pointer events for the card itself
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    transform: collapsed ? `translateX(-${SIDEBAR_WIDTH + 20}px)` : 'translateX(0)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    position: 'relative' // For the toggle button absolute positioning
                }}
            >
                {/* Main Content */}
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    {children}
                </Box>
            </Paper>

            {/* Google Maps Style Toggle Button - Independent of text selection/overflow issues */}
            <Tooltip title={collapsed ? "Développer le panneau latéral" : "Réduire le panneau latéral"} placement="right">
                <Paper
                    elevation={4}
                    onClick={() => setCollapsed(!collapsed)}
                    sx={{
                        position: 'absolute',
                        top: 24, // Align with top of the card roughly (approx 16px margin + 8px down?)
                        // actually usually centered vertically on the side or at the top side.
                        // Let's attach it to the side of the container "Box" but moving with the transform?
                        // If I put it outside the Paper, I need to manage its transform manually.
                        // Let's keep it simpler for now: attach to the Paper as before, but ensure it sticks out.
                        
                        // Revised approach: Place it relative to the wrapper Box but animate it.
                        left: collapsed ? 0 : SIDEBAR_WIDTH + 16, // 16px padding
                        transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        
                        width: 24,
                        height: 48,
                        mt: 2, // margin top relative to container
                        pointerEvents: 'auto',
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
        </Box>
    );
};

export default Sidebar;
