import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Church, Zap } from 'lucide-react';

const MotionBox = motion(Box);

const InteractiveChurchNetwork: React.FC = () => {
    return (
        <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'visible'
        }}>
            {/* Background Radial Glow */}
            <Box sx={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(66, 133, 244, 0.08) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Rotating Network Container */}
            {/* The whole satellite system rotates around the center */}
            <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                }}
            >
                {/* 3 Satellite Arms */}
                <NetworkArm angle={0} churchName="ADD Paris" delay={0} />
                <NetworkArm angle={120} churchName="ADD Lyon" delay={2} />
                <NetworkArm angle={240} churchName="ADD Toulon" delay={4} />
            </MotionBox>

            {/* Central Hub (Static on top of rotation) */}
            <CentralHub />
        </Box>
    );
};

const CentralHub = () => {
    return (
        <Box sx={{ position: 'relative', zIndex: 10 }}>
            {/* Pulsing Rings */}
            {[0, 1].map((i) => (
                <MotionBox
                    key={i}
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 1.5, ease: "easeOut" }}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid rgba(66, 133, 244, 0.3)',
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            ))}

            <MotionBox
                animate={{ 
                    boxShadow: [
                        '0 0 20px rgba(66, 133, 244, 0.3)',
                        '0 0 50px rgba(66, 133, 244, 0.6)',
                        '0 0 20px rgba(66, 133, 244, 0.3)'
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#050505',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #4285F4',
                    zIndex: 20
                }}
            >
                <Zap size={40} color="#4285F4" fill="#4285F4" style={{ filter: 'drop-shadow(0 0 10px rgba(66,133,244,0.5))' }} />
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800, mt: 1, letterSpacing: 1 }}>LIGHTCHURCH</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>HUB CENTRAL</Typography>
            </MotionBox>
        </Box>
    );
};

interface NetworkArmProps {
    angle: number;
    churchName: string;
    delay: number;
}

const NetworkArm: React.FC<NetworkArmProps> = ({ angle, churchName, delay }) => {
    const radius = 180; // Distance from center to Church

    return (
        <Box
            sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                transform: `rotate(${angle}deg)`,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {/* Connection Line: Center -> Church */}
            <Box sx={{
                position: 'absolute',
                left: 0,
                width: radius,
                height: 2,
                background: 'linear-gradient(90deg, transparent 0%, rgba(66, 133, 244, 0.2) 20%, rgba(66, 133, 244, 0.2) 100%)',
                transformOrigin: 'left center'
            }} />

            {/* Data Particle: Center -> Church */}
            <DataParticle pathWidth={radius} delay={delay} />

            {/* Church Node */}
            <Box sx={{ position: 'absolute', left: radius, transform: 'translate(-50%, -50%)' }}>
                <CounterRotator>
                    <ChurchNode name={churchName} />
                </CounterRotator>
            </Box>
        </Box>
    );
};

const ChurchNode = ({ name }: { name: string }) => (
    <Box sx={{ position: 'relative', textAlign: 'center' }}>
         <MotionBox
            whileHover={{ scale: 1.1 }}
            sx={{
                width: 60,
                height: 60,
                bgcolor: '#0f1218',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                margin: '0 auto'
            }}
        >
            <Church size={24} color="white" />
        </MotionBox>
        <Typography sx={{ 
            color: 'white', 
            fontWeight: 700, 
            mt: 1, 
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            bgcolor: 'rgba(0,0,0,0.6)',
            px: 1,
            borderRadius: 4,
            fontSize: '0.85rem'
        }}>
            {name}
        </Typography>
    </Box>
);

// Helper to keep content upright while parent rotates
const CounterRotator = ({ children, offsetAngle = 0 }: { children: React.ReactNode, offsetAngle?: number }) => {
    return (
        <MotionBox
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            style={{ rotate: -offsetAngle }} // Static offset adjustment
        >
            {children}
        </MotionBox>
    );
};

const DataParticle = ({ pathWidth, delay }: { pathWidth: number, delay: number }) => {
    return (
        <MotionBox
            animate={{ 
                x: [0, pathWidth],
                opacity: [0, 1, 1, 0]
            }}
            transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: delay,
                ease: "linear",
                repeatDelay: 2
            }}
            sx={{
                position: 'absolute',
                top: -3,
                left: 0,
                width: 20,
                height: 6,
                borderRadius: 4,
                background: 'linear-gradient(90deg, transparent, #4285F4)',
                filter: 'drop-shadow(0 0 4px #4285F4)'
            }}
        />
    );
};

export default InteractiveChurchNetwork;
