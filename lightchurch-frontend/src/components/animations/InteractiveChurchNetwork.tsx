import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Church, UserRound, Zap } from 'lucide-react';

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

            {/* Rotating Network Container - Churches (Inner Orbit) */}
            <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                }}
            >
                <ChurchArm angle={0} churchName="Paris" delay={0} />
                <ChurchArm angle={120} churchName="Lyon" delay={2} />
                <ChurchArm angle={240} churchName="Toulon" delay={4} />
            </MotionBox>

            {/* Rotating Network Container - Users (Outer Orbit) */}
            <MotionBox
                animate={{ rotate: -360 }} // Counter-rotate relative to churches for dynamic effect
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
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
                {/* Distributed Users */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <UserArm key={i} angle={angle} delay={i * 1.5} />
                ))}
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

interface ChurchArmProps {
    angle: number;
    churchName: string;
    delay: number;
}

const ChurchArm: React.FC<ChurchArmProps> = ({ angle, churchName, delay }) => {
    const radius = 160; // Inner orbit

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
                background: 'linear-gradient(90deg, transparent 0%, rgba(66, 133, 244, 0.2) 20%, rgba(66, 133, 244, 0.4) 100%)',
                transformOrigin: 'left center'
            }} />

            {/* Data Particle: Church -> Center (INWARD) */}
            <DataParticle pathWidth={radius} delay={delay} direction="in" />

            {/* Church Node */}
            <Box sx={{ position: 'absolute', left: radius, transform: 'translate(-50%, -50%)' }}>
                <CounterRotator>
                    <ChurchNode name={churchName} />
                </CounterRotator>
            </Box>
        </Box>
    );
};

const UserArm: React.FC<{ angle: number, delay: number }> = ({ angle, delay }) => {
    const radius = 240; // Outer orbit

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
            {/* Connection Line: Center -> User */}
            <Box sx={{
                position: 'absolute',
                left: 0,
                width: radius,
                height: 1,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%)',
                transformOrigin: 'left center'
            }} />

            {/* Data Particle: Center -> User (OUTWARD) */}
            <DataParticle pathWidth={radius} delay={delay} direction="out" color="#34A853" />

            {/* User Node */}
            <Box sx={{ position: 'absolute', left: radius, transform: 'translate(-50%, -50%)' }}>
                <CounterRotator reverseDirection>
                    <UserNode />
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

const UserNode = () => (
    <Box sx={{ 
        width: 40, 
        height: 40, 
        bgcolor: '#1a1d24', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid rgba(66, 133, 244, 0.4)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        position: 'relative'
    }}>
        <UserRound size={18} color="white" />
        {/* Active Dot */}
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, bgcolor: '#34A853', borderRadius: '50%', border: '2px solid #1a1d24' }} />
    </Box>
);

// Helper to keep content upright while parent rotates
const CounterRotator = ({ children, offsetAngle = 0, reverseDirection = false }: { children: React.ReactNode, offsetAngle?: number, reverseDirection?: boolean }) => {
    // If parent rotates 360, we rotate -360. If parent rotates -360, we rotate 360.
    const rotateTo = reverseDirection ? 360 : -360;

    return (
        <MotionBox
            animate={{ rotate: rotateTo }}
            transition={{ duration: reverseDirection ? 100 : 80, repeat: Infinity, ease: "linear" }}
            style={{ rotate: -offsetAngle }} 
        >
            {children}
        </MotionBox>
    );
};

const DataParticle = ({ pathWidth, delay, direction = "out", color = "#4285F4" }: { pathWidth: number, delay: number, direction?: "in" | "out", color?: string }) => {
    // Direction out: 0 -> pathWidth
    // Direction in: pathWidth -> 0
    
    const sequence = direction === "out" 
        ? [0, pathWidth]
        : [pathWidth, 0];

    return (
        <MotionBox
            animate={{ 
                x: sequence,
                opacity: [0, 1, 1, 0]
            }}
            transition={{ 
                duration: 2.5, 
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
                background: `linear-gradient(90deg, transparent, ${color})`,
                filter: `drop-shadow(0 0 4px ${color})`,
                transform: direction === "in" ? 'rotate(180deg)' : 'none' // Flip visual tail for inward inputs
            }}
        />
    );
};

export default InteractiveChurchNetwork;
