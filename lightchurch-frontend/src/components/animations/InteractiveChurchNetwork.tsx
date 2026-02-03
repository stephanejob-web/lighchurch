import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { Church, UserRound, Zap } from 'lucide-react';

const MotionBox = motion(Box);

const InteractiveChurchNetwork: React.FC = () => {
    const theme = useTheme();
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
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
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
                animate={{ rotate: -360 }}
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
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <UserArm key={i} angle={angle} delay={i * 1.5} />
                ))}
            </MotionBox>

            {/* Central Hub */}
            <CentralHub />
        </Box>
    );
};

const CentralHub = () => {
    const theme = useTheme();
    return (
        <Box sx={{ position: 'relative', zIndex: 10 }}>
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
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            ))}

            <MotionBox
                animate={{ 
                    boxShadow: [
                        `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        `0 0 50px ${alpha(theme.palette.primary.main, 0.6)}`,
                        `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'background.paper',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `3px solid ${theme.palette.primary.main}`,
                    zIndex: 20
                }}
            >
                <Zap size={40} color={theme.palette.primary.main} fill={theme.palette.primary.main} style={{ filter: `drop-shadow(0 0 10px ${alpha(theme.palette.primary.main, 0.5)})` }} />
                <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 800, mt: 1, letterSpacing: 1 }}>LIGHTCHURCH</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>HUB CENTRAL</Typography>
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
    const theme = useTheme();
    const radius = 160;
    return (
        <Box sx={{ position: 'absolute', width: 0, height: 0, transform: `rotate(${angle}deg)`, display: 'flex', alignItems: 'center' }}>
            <Box sx={{
                position: 'absolute',
                left: 0,
                width: radius,
                height: 2,
                background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 20%, ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
                transformOrigin: 'left center'
            }} />
            <DataParticle pathWidth={radius} delay={delay} direction="in" />
            <Box sx={{ position: 'absolute', left: radius, transform: 'translate(-50%, -50%)' }}>
                <CounterRotator>
                    <ChurchNode name={churchName} />
                </CounterRotator>
            </Box>
        </Box>
    );
};

const UserArm: React.FC<{ angle: number, delay: number }> = ({ angle, delay }) => {
    const theme = useTheme();
    const radius = 240;
    return (
        <Box sx={{ position: 'absolute', width: 0, height: 0, transform: `rotate(${angle}deg)`, display: 'flex', alignItems: 'center' }}>
            <Box sx={{
                position: 'absolute',
                left: 0,
                width: radius,
                height: 1,
                background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.text.primary, 0.1)} 100%)`,
                transformOrigin: 'left center'
            }} />
            <DataParticle pathWidth={radius} delay={delay} direction="out" color={theme.palette.success.main} />
            <Box sx={{ position: 'absolute', left: radius, transform: 'translate(-50%, -50%)' }}>
                <CounterRotator reverseDirection>
                    <UserNode />
                </CounterRotator>
            </Box>
        </Box>
    );
};

const ChurchNode = ({ name }: { name: string }) => {
    const theme = useTheme();
    return (
        <Box sx={{ position: 'relative', textAlign: 'center' }}>
            <MotionBox
                whileHover={{ scale: 1.1 }}
                sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.shadows[4],
                    margin: '0 auto'
                }}
            >
                <Church size={24} color={theme.palette.text.primary} />
            </MotionBox>
            <Typography sx={{ 
                color: 'text.primary', 
                fontWeight: 700, 
                mt: 1, 
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(4px)',
                px: 1,
                borderRadius: 4,
                fontSize: '0.85rem'
            }}>
                {name}
            </Typography>
        </Box>
    );
};

const UserNode = () => {
    const theme = useTheme();
    return (
        <Box sx={{ 
            width: 40, height: 40, bgcolor: 'background.paper', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.4),
            boxShadow: theme.shadows[2], position: 'relative'
        }}>
            <UserRound size={18} color={theme.palette.text.secondary} />
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%', border: '2px solid', borderColor: 'background.paper' }} />
        </Box>
    );
};

const CounterRotator = ({ children, offsetAngle = 0, reverseDirection = false }: { children: React.ReactNode, offsetAngle?: number, reverseDirection?: boolean }) => {
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
    const sequence = direction === "out" ? [0, pathWidth] : [pathWidth, 0];
    return (
        <MotionBox
            animate={{ x: sequence, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: delay, ease: "linear", repeatDelay: 2 }}
            sx={{
                position: 'absolute', top: -3, left: 0, width: 20, height: 6, borderRadius: 4,
                background: `linear-gradient(90deg, transparent, ${color})`,
                filter: `drop-shadow(0 0 4px ${color})`,
                transform: direction === "in" ? 'rotate(180deg)' : 'none'
            }}
        />
    );
};

export default InteractiveChurchNetwork;
