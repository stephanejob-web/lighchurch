import React from 'react';
import { Box, Typography, Container, Grid, Stack, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { Bell, Smartphone, Zap } from 'lucide-react';

const MotionBox = motion(Box);

const MobileAppShowcase: React.FC = () => {
    const theme = useTheme();

    const appFeatures = [
        { icon: <Zap size={20} />, title: "Performance Native", desc: "Une expérience fluide et ultra-réactive sur iOS et Android." },
        { icon: <Bell size={20} />, title: "Notifications Live", desc: "Soyez prévenu instantanément des nouveaux événements autour de vous." },
        { icon: <Smartphone size={20} />, title: "Mode Hors-ligne", desc: "Consultez les informations de vos églises favorites même sans réseau." }
    ];

    return (
        <Box 
            id="mobile-app"
            sx={{ 
                py: { xs: 12, md: 24 }, 
                position: 'relative', 
                overflow: 'hidden',
                bgcolor: 'background.default'
            }}
        >
            {/* Background Glow */}
            <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '100%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <MotionBox
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Box sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 1.5, 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: 'primary.main', 
                                px: 2, 
                                py: 0.8, 
                                borderRadius: 10, 
                                mb: 4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.2)
                            }}>
                                <Smartphone size={16} />
                                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1 }}>MOBILE APP</Typography>
                            </Box>

                            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1 }}>
                                La carte dans votre poche. <br />
                                <Box component="span" sx={{ 
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>Disponible en 2026.</Box>
                            </Typography>

                            <Typography sx={{ color: 'text.secondary', fontSize: '1.2rem', mb: 6, lineHeight: 1.8 }}>
                                Nous préparons une expérience mobile révolutionnaire pour vous accompagner au quotidien. Ne manquez plus aucun événement, où que vous soyez.
                            </Typography>

                            <Stack spacing={4} sx={{ mb: 6 }}>
                                {appFeatures.map((feature, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 3 }}>
                                        <Box sx={{ 
                                            p: 1.5, 
                                            borderRadius: 3, 
                                            bgcolor: 'background.paper', 
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: 'fit-content'
                                        }}>
                                            {feature.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{feature.title}</Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{feature.desc}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>

                            <Box sx={{ 
                                p: 3, 
                                borderRadius: 4, 
                                bgcolor: alpha(theme.palette.background.paper, 0.5), 
                                border: '1px dashed',
                                borderColor: 'divider',
                                display: 'inline-block'
                            }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
                                    🚀 Lancement prévu : <Box component="span" sx={{ color: 'primary.main' }}>Courant Semestre 2026</Box>
                                </Typography>
                            </Box>
                        </MotionBox>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <MotionBox
                            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            sx={{ position: 'relative', perspective: '1000px' }}
                        >
                            {/* Animated Mockup */}
                            <MotionBox
                                animate={{ 
                                    y: [0, -20, 0],
                                    rotate: [0, 1, 0, -1, 0]
                                }}
                                transition={{ 
                                    duration: 6, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                                sx={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.5))' 
                                }}
                            >
                                <Box 
                                    component="img" 
                                    src="/assets/iphone_mockup.png" 
                                    alt="LightChurch Mobile App" 
                                    sx={{ 
                                        width: '100%', 
                                        maxWidth: 450, 
                                        height: 'auto',
                                        borderRadius: '40px'
                                    }} 
                                />
                            </MotionBox>

                            {/* Floating Decorative Elements */}
                            <MotionBox
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                sx={{ 
                                    position: 'absolute', 
                                    top: '10%', 
                                    right: '-5%', 
                                    bgcolor: 'background.paper', 
                                    p: 2, 
                                    borderRadius: 3, 
                                    boxShadow: theme.shadows[10],
                                    display: { xs: 'none', sm: 'block' },
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>🔔 Nouveau Culte</Typography>
                            </MotionBox>

                            <MotionBox
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                sx={{ 
                                    position: 'absolute', 
                                    bottom: '15%', 
                                    left: '-5%', 
                                    bgcolor: 'background.paper', 
                                    p: 2, 
                                    borderRadius: 3, 
                                    boxShadow: theme.shadows[10],
                                    display: { xs: 'none', sm: 'block' },
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>📍 12 églises à proximité</Typography>
                            </MotionBox>
                        </MotionBox>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default MobileAppShowcase;
