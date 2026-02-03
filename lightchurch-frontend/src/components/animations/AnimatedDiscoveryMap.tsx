import React from 'react';
import { Box, Typography, Paper, useTheme, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Navigation, Map } from 'lucide-react';

const MotionBox = motion(Box);

const AnimatedDiscoveryMap: React.FC = () => {
    const theme = useTheme();
    const targetX = 60;
    const targetY = 45;

    return (
        <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '500px', 
            bgcolor: 'background.paper', 
            borderRadius: 6, 
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: theme.shadows[4]
        }}>
            {/* 1. Map Background (Abstract Grid) */}
            <MapBackground />

            {/* 2. Radar Scan Effect */}
            <RadarEffect />

            {/* 3. Pins Container */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <Pin x={30} y={40} type="church" delay={0.5} name="Église de Paris" />
                <Pin x={70} y={20} type="church" delay={0.8} name="Centre Évangélique" />
                <Pin x={20} y={70} type="church" delay={1.2} name="Lyon Centre" />
                <Pin x={80} y={60} type="church" delay={1.5} name="Église de la Rade" />
                <Pin x={60} y={45} type="event" delay={1.0} name="Worship Night" isTarget />
            </Box>

            {/* 4. Overlay Content */}
            <Box sx={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 2 }}>
                <LegendItem color={theme.palette.primary.main} label="Églises" />
                <LegendItem color={theme.palette.error.main} label="Événements" />
            </Box>

            {/* 5. Simulated Cursor Interaction */}
            {/* 6. Route Line Animation */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 15, pointerEvents: 'none' }}>
                <MotionPath
                    d={`M ${0.1 * 1000} ${0.9 * 500} Q ${300} ${400} ${targetX / 100 * 1000} ${targetY / 100 * 500}`}
                    fill="none"
                    stroke={theme.palette.primary.main}
                    strokeWidth="3"
                    strokeDasharray="10 10"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                        pathLength: [0, 1, 1, 0],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{ 
                        duration: 6, 
                        times: [0, 0.4, 0.8, 1],
                        repeat: Infinity,
                        repeatDelay: 2
                    }}
                />
            </svg>
            <SimulatedCursor targetX={targetX} targetY={targetY} />
        </Box>
    );
};

const MotionPath = motion.path;

// ---------------- Sub Components ----------------

const MapBackground = () => {
    const theme = useTheme();
    return (
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1 }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme.palette.text.primary} strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path d="M 0 200 Q 300 150 600 300 T 1000 200" stroke={theme.palette.text.primary} strokeWidth="2" fill="none" />
                <path d="M 200 0 Q 250 300 100 600" stroke={theme.palette.text.primary} strokeWidth="1" fill="none" />
                <path d="M 600 0 Q 550 300 800 600" stroke={theme.palette.text.primary} strokeWidth="1" fill="none" />
            </svg>
        </Box>
    );
};

const RadarEffect = () => {
    const theme = useTheme();
    return (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <MotionBox
                animate={{ scale: [0, 5], opacity: [0.5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}
            />
            <MotionBox
                animate={{ scale: [0, 5], opacity: [0.3, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1, ease: "easeOut" }}
                sx={{
                    position: 'absolute', top: 0, left: 0,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                }}
            />
        </Box>
    );
};

const Pin = ({ x, y, type, delay }: { x: number, y: number, type: 'church' | 'event', delay: number, name?: string, isTarget?: boolean }) => {
    const theme = useTheme();
    const color = type === 'church' ? theme.palette.primary.main : theme.palette.error.main;
    
    return (
        <MotionBox
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, duration: 0.5, type: 'spring' }}
            sx={{
                position: 'absolute',
                top: `${y}%`,
                left: `${x}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer'
            }}
        >
            {type === 'event' && (
                <MotionBox
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    sx={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        borderRadius: '50%',
                        bgcolor: color,
                        zIndex: -1
                    }}
                />
            )}
            <MapPin size={24} color={color} fill={alpha(color, 0.4)} />
        </MotionBox>
    );
};

const SimulatedCursor = ({ targetX, targetY }: { targetX: number, targetY: number }) => {
    const theme = useTheme();
    return (
        <>
            <MotionBox
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ 
                    x: [`10%`, `${targetX}%`], 
                    y: [`90%`, `${targetY}%`],
                    opacity: [0, 1, 1, 0]
                }}
                transition={{ duration: 6, ease: "easeInOut", times: [0, 0.4, 0.8, 1], repeat: Infinity, repeatDelay: 2 }}
                sx={{ position: 'absolute', top: 0, left: 0, zIndex: 20 }}
            >
                <Navigation 
                    size={24} 
                    color={theme.palette.primary.main} 
                    fill={theme.palette.primary.main} 
                    style={{ transform: 'rotate(-45deg)', filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.common.black, 0.2)})` }} 
                />
            </MotionBox>

            <AnimatePresence>
                <MotionBox
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ 
                        opacity: [0, 0, 1, 1, 0], 
                        y: [10, 10, -10, -10, 10],
                        scale: [0.9, 0.9, 1, 1, 0.9]
                    }}
                    transition={{ duration: 6, times: [0, 0.4, 0.45, 0.8, 1], repeat: Infinity, repeatDelay: 2 }}
                    sx={{
                        position: 'absolute',
                        top: `${targetY}%`,
                        left: `${targetX}%`,
                        transform: 'translate(-50%, -120%)',
                        zIndex: 30
                    }}
                >
                    <EventCard />
                </MotionBox>
            </AnimatePresence>
        </>
    );
};

const EventCard = () => {
    const theme = useTheme();
    return (
        <Paper sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.background.paper, 0.9), 
            backdropFilter: 'blur(10px)', 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            minWidth: 220,
            boxShadow: theme.shadows[10]
        }}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} color={theme.palette.error.main} />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700 }}>Worship Night</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>CE Lyon Centre</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Clock size={12} color={theme.palette.error.main} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Ce soir • 20:00</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Map size={12} color={theme.palette.primary.main} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>1.2 km • Itinéraire</Typography>
            </Box>
        </Paper>
    );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: alpha(theme.palette.text.primary, 0.05), px: 1.5, py: 0.5, borderRadius: 4 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 5px ${color}` }} />
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>{label}</Typography>
        </Box>
    );
};

export default AnimatedDiscoveryMap;
