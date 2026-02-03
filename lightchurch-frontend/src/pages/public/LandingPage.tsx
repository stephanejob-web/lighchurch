import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Stack, IconButton, Drawer, Divider, Grid, useTheme, alpha } from '@mui/material';
import { Menu as MenuIcon, X as CloseIcon, CheckCircle2, XCircle, ArrowRight, Map, LogIn, Search, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import LiveStatCounter from '../../components/common/LiveStatCounter';
import ThemeToggle from '../../components/common/ThemeToggle';
import ParticleBackground from '../../components/landing/ParticleBackground';
import AnimatedDiscoveryMap from '../../components/animations/AnimatedDiscoveryMap';
import { fetchPlatformStats } from '../../services/publicMapService';

const MotionBox = motion(Box);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({ churches: 0, events: 0 });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchPlatformStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to load stats', error);
            }
        };
        loadStats();
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const constraints = [
        { emoji: '🔍', title: 'Information introuvable', desc: 'Sites web obsolètes, pages Facebook abandonnées, données Google incorrectes...' },
        { emoji: '⏰', title: 'Horaires jamais à jour', desc: "Impossible de savoir si l'église est ouverte, quels sont les vrais horaires des cultes." },
        { emoji: '📍', title: 'Aucune visibilité', desc: "Pas de plateforme unique pour découvrir les églises et événements autour de soi." }
    ];

    const solutions = [
        { emoji: '🏠', title: 'Carte interactive', desc: "Visualisez toutes les églises évangéliques autour de vous en un coup d'œil.", color: theme.palette.primary.main },
        { emoji: '📅', title: 'Événements en temps réel', desc: 'Cultes, concerts, conférences, retraites... Ne ratez plus aucun événement.', color: theme.palette.error.main },
        { emoji: '✅', title: 'Infos vérifiées', desc: "Horaires, adresses et contacts mis à jour directement par les responsables d'église.", color: theme.palette.success.main },
        { emoji: '🔗', title: 'Participez facilement', desc: "Indiquez votre intérêt pour un événement et partagez-le avec vos proches.", color: theme.palette.warning.main }
    ];

    const comparisonData = [
        { feature: 'Carte interactive temps réel', description: 'Localisez instantanément les églises autour de vous.', lightChurch: true, traditional: false },
        { feature: 'Données vérifiées par les responsables', description: 'Les infos sont gérées directement par les églises.', lightChurch: true, traditional: false },
        { feature: 'Gestion des événements (Agenda)', description: 'Cultes, conférences et activités mis à jour.', lightChurch: true, traditional: false },
        { feature: 'Expérience Mobile (iOS & Android)', description: 'Une application dédiée pour votre quotidien.', lightChurch: true, traditional: false },
        { feature: 'Design Moderne & Immersif', description: 'Une interface intuitive et haut de gamme.', lightChurch: true, traditional: false },
        { feature: 'Gratuit pour les utilisateurs', description: 'Accès illimité à toute la base de données.', lightChurch: true, traditional: true },
    ];

    return (
        <Box sx={{ 
            bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', overflowX: 'hidden',
            '@keyframes pulse': {
                '0%': { opacity: 1, scale: 1, boxShadow: '0 0 0 0 rgba(234, 67, 53, 0.4)' },
                '70%': { opacity: 0.7, scale: 1.1, boxShadow: '0 0 0 10px rgba(234, 67, 53, 0)' },
                '100%': { opacity: 1, scale: 1, boxShadow: '0 0 0 0 rgba(234, 67, 53, 0)' }
            }
        }}>
            {/* Header */}
            <Box
                sx={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, transition: 'all 0.3s ease',
                    bgcolor: isScrolled ? alpha(theme.palette.background.paper, 0.9) : 'transparent',
                    backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                    borderBottom: isScrolled ? `1px solid ${theme.palette.divider}` : 'none',
                    py: 2
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
                            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'text.primary', fontSize: '1.4rem' }}>Lightchurch</Typography>
                            <Box sx={{ 
                                bgcolor: theme.palette.mode === 'light' ? 'primary.light' : 'primary.main', 
                                color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.contrastText', 
                                px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 
                            }}>Pro</Box>
                        </Box>
                        <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            <Typography sx={{ cursor: 'pointer', color: 'text.secondary', fontSize: '0.95rem', transition: 'color 0.2s', '&:hover': { color: 'text.primary' } }} onClick={() => navigate('/map')}>Explorer</Typography>

                            <ThemeToggle />

                            <Button
                                onClick={() => navigate('/login')}
                                startIcon={<LogIn size={16} />}
                                sx={{
                                    color: 'text.primary',
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                Se connecter
                            </Button>

                            <Button
                                variant="contained"
                                onClick={() => navigate('/for-pastors')}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    borderRadius: 50,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                Rejoindre le réseau
                            </Button>
                        </Stack>
                        <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }} onClick={() => setMobileMenuOpen(true)}><MenuIcon /></IconButton>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box sx={{ position: 'relative', pt: { xs: 18, md: 24 }, pb: { xs: 12, md: 20 }, minHeight: '90vh', overflow: 'hidden' }}>
                <ParticleBackground />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' }, fontWeight: 800, lineHeight: 1, mb: 3, letterSpacing: '-2px' }}>
                                L'information chrétienne <br />
                                <Box component="span" sx={{ 
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>enfin centralisée.</Box>
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, color: 'text.secondary', mb: 6, maxWidth: 700, mx: 'auto', lineHeight: 1.7 }}>
                                Découvrez les églises et événements autour de vous sur une plateforme unique, moderne et ultra-rapide. Plus de données éparpillées, tout est ici.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: { xs: 6, md: 10 } }}>
                                <Button variant="contained" size="large" onClick={() => navigate('/map')} startIcon={<Map size={20} />} sx={{ bgcolor: 'primary.main', borderRadius: 50, py: { xs: 1.5, md: 2 }, px: 5, fontSize: '1.1rem', textTransform: 'none', fontWeight: 600, boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`, '&:hover': { bgcolor: 'primary.dark' } }}>
                                    Lancer l'expérience
                                </Button>
                                <Button variant="outlined" size="large" onClick={() => document.getElementById('live-discovery')?.scrollIntoView({ behavior: 'smooth' })} endIcon={<ArrowRight size={20} />} sx={{ borderColor: 'divider', color: 'text.primary', borderRadius: 50, py: { xs: 1.5, md: 2 }, px: 5, fontSize: '1.1rem', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }}>
                                    Découvrir la carte
                                </Button>
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'space-around', md: 'center' }, gap: { xs: 2, md: 10 }, flexWrap: 'wrap' }}>
                                <LiveStatCounter value={stats.churches || 10000} label="Églises indexées" delay={0.2} />
                                <LiveStatCounter value={stats.events || 39878} label="Événements actifs" delay={0.4} />
                            </Box>
                        </MotionBox>
                    </Box>
                </Container>
            </Box>

            {/* LIVE DISCOVERY Section */}
            <Box id="live-discovery" sx={{ py: { xs: 8, md: 20 }, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
                        <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'left' }, order: { xs: 2, md: 1 } }}>
                            <MotionBox
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <Box sx={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: 1, 
                                    bgcolor: alpha(theme.palette.error.main, 0.1), 
                                    color: 'error.main', 
                                    px: 2, 
                                    py: 0.5, 
                                    borderRadius: 50, 
                                    mb: 3 
                                }}>
                                    <Box sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1 }}>LIVE DISCOVERY</Typography>
                                </Box>
                                <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2.2rem', md: '3.2rem' }, lineHeight: 1.1 }}>
                                    Explorez ce qui se passe <br />
                                    <Box component="span" sx={{ color: 'primary.main' }}>autour de vous.</Box>
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem', mb: 5, lineHeight: 1.8 }}>
                                    Une carte interactive ultra-rapide pour découvrir les églises dynamiques et les événements chrétiens dans votre ville. Posez vos repères en un clic.
                                </Typography>

                                <Stack spacing={{ xs: 3, md: 4 }} sx={{ textAlign: 'left' }}>
                                    <Box sx={{ display: 'flex', gap: 2.5 }}>
                                        <Box sx={{ mt: 0.5, p: 1.5, height: 'fit-content', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                            <Search size={24} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Filtrage précis</Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', md: '0.875rem' } }}>Trouvez exactement ce que vous cherchez par types d'événements, dénominations ou services.</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2.5 }}>
                                        <Box sx={{ mt: 0.5, p: 1.5, height: 'fit-content', borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                                            <Navigation size={24} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Itinéraires et horaires</Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', md: '0.875rem' } }}>Accédez aux horaires en temps réel et lancez votre GPS directement depuis la plateforme.</Typography>
                                        </Box>
                                    </Box>
                                </Stack>

                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    onClick={() => navigate('/map')}
                                    sx={{ 
                                        mt: { xs: 4, md: 6 }, 
                                        bgcolor: 'text.primary', 
                                        color: 'background.paper', 
                                        borderRadius: 50, 
                                        py: { xs: 1.5, md: 2 }, 
                                        px: 5, 
                                        fontWeight: 700, 
                                        textTransform: 'none', 
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.8) } 
                                    }}
                                >
                                    Ouvrir la carte interactive
                                </Button>
                            </MotionBox>
                        </Grid>
                        <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                sx={{ position: 'relative' }}
                            >
                                <Box sx={{ 
                                    position: 'relative', 
                                    borderRadius: { xs: 4, md: 8 }, 
                                    overflow: 'hidden', 
                                    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.2)}`,
                                    border: { xs: '4px solid', md: '10px solid' }, 
                                    borderColor: alpha(theme.palette.divider, 0.5),
                                    aspectRatio: { xs: '1/1', md: 'auto' },
                                    height: { md: '500px' }
                                }}>
                                    <AnimatedDiscoveryMap />
                                </Box>
                                {/* Decorative elements */}
                                <Box sx={{ 
                                    position: 'absolute', 
                                    top: '-20px', 
                                    right: '-20px', 
                                    width: { xs: 100, md: 200 }, 
                                    height: { xs: 100, md: 200 }, 
                                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`, 
                                    zIndex: -1 
                                }} />
                                <Box sx={{ 
                                    position: 'absolute', 
                                    bottom: '-20px', 
                                    left: '-20px', 
                                    width: { xs: 100, md: 200 }, 
                                    height: { xs: 100, md: 200 }, 
                                    background: `radial-gradient(circle, ${alpha(theme.palette.error.main, 0.1)} 0%, transparent 70%)`, 
                                    zIndex: -1 
                                }} />
                            </MotionBox>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Constraints Section */}
            <Box sx={{ py: { xs: 8, md: 16 }, position: 'relative' }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                        <Typography sx={{ color: 'error.main', fontWeight: 600, letterSpacing: 2, mb: 2, fontSize: '0.85rem' }}>LE CONSTAT</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.2 }}>Trouver une église ne devrait pas être si compliqué.</Typography>
                        <Typography sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', fontSize: { xs: '0.95rem', md: '1rem' } }}>Vous déménagez, vous voyagez, ou vous cherchez simplement une communauté ? Aujourd'hui, c'est un parcours du combattant.</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                        {constraints.map((item, i) => (
                            <Box key={i} sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, maxWidth: 380 }}>
                                <Box sx={{ 
                                    p: { xs: 4, md: 5 }, height: '100%', bgcolor: 'background.paper', borderRadius: 4, 
                                    border: '1px solid', borderColor: 'divider', textAlign: 'center', transition: 'all 0.3s ease',
                                    boxShadow: theme.shadows[1],
                                    '&:hover': { transform: 'translateY(-5px)', borderColor: 'error.main', boxShadow: theme.shadows[3] } 
                                }}>
                                    <Typography sx={{ fontSize: { xs: '2.5rem', md: '3rem' }, mb: 3 }}>{item.emoji}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'error.main', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{item.title}</Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Solutions Section */}
            <Box id="features" sx={{ py: { xs: 8, md: 16 }, position: 'relative' }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                        <Typography sx={{ color: 'success.main', fontWeight: 600, letterSpacing: 2, mb: 2, fontSize: '0.85rem' }}>LA SOLUTION</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.2 }}>LightChurch change la donne.</Typography>
                        <Typography sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', fontSize: { xs: '0.95rem', md: '1rem' } }}>Une plateforme unique où les églises mettent à jour leurs informations, et où vous trouvez tout ce dont vous avez besoin en quelques secondes.</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                        {solutions.map((item, i) => (
                            <Box key={i} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(25% - 18px)' }, maxWidth: 300 }}>
                                <Box sx={{ 
                                    p: 4, height: '100%', bgcolor: 'background.paper', borderRadius: 4, 
                                    border: '1px solid', borderColor: 'divider', transition: 'all 0.3s ease',
                                    boxShadow: theme.shadows[1],
                                    '&:hover': { transform: 'translateY(-5px)', borderColor: 'primary.main', boxShadow: theme.shadows[3] } 
                                }}>
                                    <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: alpha(item.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, fontSize: '1.5rem', color: item.color }}>{item.emoji}</Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>{item.title}</Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Comparison Section */}
            <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: 'background.paper', position: 'relative' }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 2, mb: 2, fontSize: '0.85rem' }}>POURQUOI NOUS ?</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>Une nouvelle ère pour la visibilité chrétienne.</Typography>
                        <Typography sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>Découvrez pourquoi LightChurch est la plateforme la plus avancée pour connecter les églises et leurs communautés.</Typography>
                    </Box>

                    {/* Desktop Table */}
                    <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
                        <Box sx={{ minWidth: 600 }}>
                            <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', pb: 3, mb: 3 }}>
                                <Box sx={{ flex: 2 }} />
                                <Box sx={{ flex: 1, textAlign: 'center' }}><Typography sx={{ fontWeight: 700, color: 'primary.main' }}>LightChurch</Typography></Box>
                                <Box sx={{ flex: 1, textAlign: 'center' }}><Typography sx={{ color: 'text.disabled' }}>Annuaires traditionnels</Typography></Box>
                            </Box>
                            {comparisonData.map((row, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 3, borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                                    <Box sx={{ flex: 2 }}>
                                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{row.feature}</Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{row.description}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{row.lightChurch ? <CheckCircle2 color={theme.palette.success.main} size={24} /> : <XCircle color={theme.palette.error.main} size={24} />}</Box>
                                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{row.traditional ? <CheckCircle2 size={24} style={{ color: theme.palette.text.disabled }} /> : <XCircle size={24} style={{ color: theme.palette.text.disabled }} />}</Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Mobile Cards */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                        {comparisonData.map((row, index) => (
                            <Box key={index} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>{row.feature}</Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.5 }}>{row.description}</Typography>
                                </Box>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
                                        <Typography sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.9rem' }}>LightChurch</Typography>
                                        {row.lightChurch ? <CheckCircle2 color={theme.palette.primary.main} size={20} /> : <XCircle color={theme.palette.error.main} size={20} />}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5 }}>
                                        <Typography sx={{ color: 'text.disabled', fontSize: '0.9rem' }}>Traditionnel</Typography>
                                        {row.traditional ? <CheckCircle2 color={theme.palette.text.disabled} size={20} /> : <XCircle color={theme.palette.text.disabled} size={20} />}
                                    </Box>
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: { xs: 6, md: 12 }, position: 'relative' }}>
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ p: { xs: 4, md: 8 }, borderRadius: { xs: 4, md: 6 }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1.2 }}>Vous êtes responsable d'église ?</Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 4, maxWidth: 550, mx: 'auto', fontSize: { xs: '0.9rem', md: '1rem' } }}>Référencez gratuitement votre église sur LightChurch. Mettez à jour vos horaires, publiez vos événements, et soyez visible par des milliers de personnes.</Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button variant="contained" onClick={() => navigate('/for-pastors')} sx={{ bgcolor: 'primary.main', borderRadius: 50, py: 1.5, px: 4, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>Référencer mon église gratuitement</Button>
                            <Button variant="outlined" onClick={() => navigate('/login')} sx={{ borderColor: 'divider', color: 'text.primary', borderRadius: 50, py: 1.5, px: 4, fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: 'text.primary' } }}>J'ai déjà un compte</Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled' }}>
                <Typography variant="body2">© 2026 Lightchurch Network • France</Typography>
            </Box>

            {/* Mobile Drawer */}
            <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} PaperProps={{ sx: { bgcolor: 'background.default', color: 'text.primary', width: '100%' } }}>
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Lightchurch</Typography>
                            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Pro</Box>
                        </Box>
                        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'text.primary' }}><CloseIcon /></IconButton>
                    </Box>
                    <Stack spacing={3}>
                        <ThemeToggle />
                        <Typography variant="h5" sx={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => { navigate('/map'); setMobileMenuOpen(false); }}>Explorer</Typography>
                        <Divider />
                        <Button variant="contained" fullWidth size="large" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} sx={{ bgcolor: 'primary.main', py: 1.5, borderRadius: 50, fontWeight: 600, textTransform: 'none' }}>Rejoindre le réseau</Button>
                    </Stack>
                </Box>
            </Drawer>
        </Box>
    );
};

export default LandingPage;
