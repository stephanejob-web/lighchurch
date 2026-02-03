import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useSpring, useTransform } from 'framer-motion';

interface LiveStatCounterProps {
    value: number;
    label: string;
    delay?: number;
    withIncrement?: boolean; // If true, simulates random new data coming in
}

const LiveStatCounter: React.FC<LiveStatCounterProps> = ({ value, label, delay = 0, withIncrement = false }) => {
    // Current display value state (for the increment effect)
    const [targetValue, setTargetValue] = useState(value);

    // Spring animation for smooth counting
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const displayValue = useTransform(spring, (current) => Math.floor(current).toLocaleString('fr-FR'));

    useEffect(() => {
        // Initial animation
        const timeout = setTimeout(() => {
            spring.set(targetValue);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [spring, targetValue, delay]);

    // Simulate "Live" updates
    useEffect(() => {
        if (!withIncrement) return;

        const interval = setInterval(() => {
            // Randomly add 1 every 5-15 seconds
            if (Math.random() > 0.7) {
                setTargetValue(prev => {
                    const newValue = prev + 1;
                    spring.set(newValue);
                    return newValue;
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [withIncrement, spring]);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1, display: 'flex' }}>
                    <motion.span>{displayValue}</motion.span>
                </Typography>
                
                {/* Live Badge */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5, 
                    bgcolor: 'rgba(234, 67, 53, 0.1)', 
                    border: '1px solid rgba(234, 67, 53, 0.3)',
                    borderRadius: 1, 
                    px: 0.8, 
                    py: 0.2, 
                    ml: 1.5,
                    height: 'fit-content',
                    mt: 1
                }}>
                    <MotionBox
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        sx={{
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            bgcolor: '#EA4335',
                            boxShadow: '0 0 5px #EA4335' 
                        }}
                    />
                    <Typography sx={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 700, 
                        color: '#EA4335', 
                        letterSpacing: 0.5,
                        lineHeight: 1
                    }}>
                        LIVE
                    </Typography>
                </Box>
            </Box>
            <Typography sx={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, mt: 0.5 }}>
                {label}
            </Typography>
        </Box>
    );
};

const MotionBox = motion(Box);

export default LiveStatCounter;
