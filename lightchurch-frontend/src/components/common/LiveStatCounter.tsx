import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { motion, useSpring, useTransform } from 'framer-motion';

interface LiveStatCounterProps {
    value: number;
    label: string;
    delay?: number;
    withIncrement?: boolean; // If true, simulates random new data coming in
}

const LiveStatCounter: React.FC<LiveStatCounterProps> = ({ value, label, delay = 0, withIncrement = false }) => {
    const theme = useTheme();
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, 
                    lineHeight: 1,
                    letterSpacing: '-0.5px'
                }}>
                    <motion.span>{displayValue}</motion.span>
                </Typography>
                
                {/* Live Badge */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5, 
                    bgcolor: alpha(theme.palette.error.main, 0.1), 
                    border: '1px solid',
                    borderColor: alpha(theme.palette.error.main, 0.2),
                    borderRadius: 1.5, 
                    px: 1, 
                    py: 0.4, 
                }}>
                    <MotionBox
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        sx={{
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            bgcolor: 'error.main',
                            boxShadow: `0 0 5px ${theme.palette.error.main}` 
                        }}
                    />
                    <Typography sx={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        color: 'error.main', 
                        letterSpacing: 0.5,
                        lineHeight: 1
                    }}>
                        LIVE
                    </Typography>
                </Box>
            </Box>
            <Typography sx={{ 
                color: 'text.secondary', 
                fontSize: { xs: '0.7rem', md: '0.75rem' }, 
                textTransform: 'uppercase', 
                letterSpacing: 1, 
                mt: 1,
                fontWeight: 600
            }}>
                {label}
            </Typography>
        </Box>
    );
};

const MotionBox = motion(Box);

export default LiveStatCounter;
