import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Navigation, Map } from 'lucide-react';

const MotionBox = motion(Box);

const AnimatedDiscoveryMap: React.FC = () => {
    return (
        <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '500px', 
            bgcolor: '#0f1218', 
            borderRadius: 6, 
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,0.5)'
        }}>
            {/* 1. Map Background (Abstract Grid) */}
            <MapBackground />

            {/* 2. Radar Scan Effect */}
            <RadarEffect />

            {/* 3. Pins Container */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {/* Randomly generated pins positions for demo */}
                <Pin x={30} y={40} type="church" delay={0.5} name="Église de Paris" />
                <Pin x={70} y={20} type="church" delay={0.8} name="Centre Évangélique" />
                <Pin x={20} y={70} type="church" delay={1.2} name="Lyon Centre" />
                <Pin x={80} y={60} type="church" delay={1.5} name="Église de la Rade" />
                
                {/* Event Pin (The Target) */}
                <Pin x={60} y={45} type="event" delay={1.0} name="Worship Night" isTarget />
            </Box>

            {/* 4. Overlay Content */}
            <Box sx={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 2 }}>
                <LegendItem color="#4285F4" label="Églises" />
                <LegendItem color="#EA4335" label="Événements" />
            </Box>

            {/* 5. Simulated Cursor Interaction */}
            <SimulatedCursor targetX={60} targetY={45} />
        </Box>
    );
};

// ---------------- Sub Components ----------------

const MapBackground = () => (
    <Box sx={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Abstract Roads */}
            <path d="M 0 200 Q 300 150 600 300 T 1000 200" stroke="white" strokeWidth="2" fill="none" />
            <path d="M 200 0 Q 250 300 100 600" stroke="white" strokeWidth="1" fill="none" />
            <path d="M 600 0 Q 550 300 800 600" stroke="white" strokeWidth="1" fill="none" />
        </svg>
    </Box>
);

const RadarEffect = () => (
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <MotionBox
            animate={{ scale: [0, 5], opacity: [0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
            sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: '1px solid rgba(66, 133, 244, 0.5)',
                bgcolor: 'rgba(66, 133, 244, 0.1)'
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
                border: '1px solid rgba(66, 133, 244, 0.3)'
            }}
        />
    </Box>
);

const Pin = ({ x, y, type, delay }: { x: number, y: number, type: 'church' | 'event', delay: number, name?: string, isTarget?: boolean }) => {
    const color = type === 'church' ? '#4285F4' : '#EA4335';
    
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
            {/* Pulse for Events */}
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
            
            <MapPin size={24} color={color} fill={color} />
        </MotionBox>
    );
};

const SimulatedCursor = ({ targetX, targetY }: { targetX: number, targetY: number }) => {

    return (
        <>
            <MotionBox
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ 
                    x: [`10%`, `${targetX}%`], 
                    y: [`90%`, `${targetY}%`],
                    opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                    duration: 6, 
                    ease: "easeInOut",
                    times: [0, 0.4, 0.8, 1],
                    repeat: Infinity,
                    repeatDelay: 2
                }}
                sx={{
                    position: 'absolute',
                    top: 0, left: 0,
                    zIndex: 20
                }}
            >
                <Navigation 
                    size={24} 
                    color="white" 
                    fill="white" 
                    style={{ transform: 'rotate(-45deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} 
                />
            </MotionBox>

            {/* Event Card Pop-up */}
            <AnimatePresence>
                <MotionBox
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ 
                        opacity: [0, 0, 1, 1, 0], 
                        y: [10, 10, -10, -10, 10],
                        scale: [0.9, 0.9, 1, 1, 0.9]
                    }}
                    transition={{ 
                        duration: 6,
                        times: [0, 0.4, 0.45, 0.8, 1],
                        repeat: Infinity,
                        repeatDelay: 2
                    }}
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

const EventCard = () => (
    <Paper sx={{ 
        p: 2, 
        bgcolor: 'rgba(20, 24, 33, 0.9)', 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        minWidth: 220,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(234, 67, 53, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} color="#EA4335" />
            </Box>
            <Box>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>Worship Night</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>CE Lyon Centre</Typography>
            </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Clock size={12} color="#EA4335" />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Ce soir • 20:00</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Map size={12} color="#4285F4" />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>1.2 km • Itinéraire</Typography>
        </Box>
    </Paper>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.05)', px: 1.5, py: 0.5, borderRadius: 4 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 5px ${color}` }} />
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>{label}</Typography>
    </Box>
);

export default AnimatedDiscoveryMap;
