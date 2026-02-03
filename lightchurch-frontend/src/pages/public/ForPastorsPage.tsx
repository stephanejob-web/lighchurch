import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Stack,
    IconButton,
    Grid,
    useTheme,
    alpha
} from '@mui/material';
import {
    ChevronLeft,
    MessageSquare,
    Handshake,
    Calendar,
    Target,
    Users,
    BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import ParticleBackground from '../../components/landing/ParticleBackground';
import InteractiveChurchNetwork from '../../components/animations/InteractiveChurchNetwork';

const MotionBox = motion(Box);

const ForPastorsPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            icon: <MessageSquare size={24} />,
            title: "Communication Directe",
            desc: "Échangez directement avec d'autres pasteurs, partagez des informations et coordonnez vos actions localement ou nationalement."
        },
        {
            icon: <Handshake size={24} />,
            title: "Collaboration Inter-Églises",
            desc: "Organisez des événements communs : cultes régionaux, évangélisations, formations ou conférences pastorales."
        },
        {
            icon: <Calendar size={24} />,
            title: "Événements Partagés",
            desc: "Créez des événements visibles par toutes les églises du réseau. Invitez d'autres communautés à co-organiser."
        },
        {
            icon: <Target size={24} />,
            title: "Actions Communes",
            desc: "Lancez des initiatives nationales : journées de prière, campagnes d'évangélisation ou collectes solidaires."
        },
        {
            icon: <Users size={24} />,
            title: "Annuaire des Responsables",
            desc: "Accédez à l'annuaire des pasteurs. Trouvez facilement un contact dans une autre région ou dénomination."
        },
        {
            icon: <BookOpen size={24} />,
            title: "Partage de Ressources",
            desc: "Partagez vos bonnes pratiques, supports de formation et ressources avec l'ensemble du réseau."
        }
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
            <ParticleBackground />

            {/* Header */}
            <Box sx={{ position: 'relative', zIndex: 10, py: 3 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton
                            onClick={() => navigate('/')}
                            sx={{ color: 'text.primary', bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
                        >
                            <ChevronLeft />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Lightchurch</Typography>
                            <Box sx={{ 
                                bgcolor: theme.palette.mode === 'light' ? 'primary.light' : 'primary.main', 
                                color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.contrastText', 
                                px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' 
                            }}>PRO</Box>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: { xs: 8, md: 12 }, pb: 8 }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <MotionBox
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 50, px: 2, py: 0.5, mb: 3 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                <Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 1 }}>RÉSEAU PASTORAL</Typography>
                            </Box>

                            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' }, fontWeight: 800, lineHeight: 1.1, mb: 3 }}>
                                Un Réseau National pour <br />
                                <Box component="span" sx={{
                                    background: theme.palette.mode === 'light' 
                                        ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.dark} 100%)`
                                        : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    Connecter les Églises
                                </Box>
                            </Typography>

                            <Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, color: 'text.secondary', mb: 5, lineHeight: 1.6, maxWidth: 600 }}>
                                LightChurch crée un pont entre les pasteurs, les responsables et les églises de toute la France pour favoriser l'unité, la collaboration et l'action commune.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/register')}
                                    sx={{ 
                                        bgcolor: 'primary.main', 
                                        borderRadius: 50, 
                                        px: 4, 
                                        py: { xs: 1.5, md: 2 }, 
                                        textTransform: 'none', 
                                        fontWeight: 700, 
                                        fontSize: '1.1rem', 
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': { bgcolor: 'primary.dark' } 
                                    }}
                                >
                                    Référencer mon église gratuitement
                                </Button>
                            </Stack>
                        </MotionBox>
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center', height: 500, position: 'relative' }}>
                        <MotionBox
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            sx={{ width: '100%', height: '100%' }}
                        >
                            <InteractiveChurchNetwork />
                        </MotionBox>
                    </Grid>
                </Grid>
            </Container>

            {/* Features Grid */}
            <Box sx={{ py: 12, position: 'relative', zIndex: 10, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 700, mb: 8, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                        Conçu pour les Responsables
                    </Typography>
                    <Grid container spacing={3}>
                        {features.map((f, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <MotionBox
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        bgcolor: 'background.paper',
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: theme.shadows[1],
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            borderColor: 'primary.main',
                                            boxShadow: theme.shadows[3]
                                        }
                                    }}
                                >
                                    <Box sx={{ color: 'primary.main', mb: 2 }}>{f.icon}</Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>{f.title}</Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</Typography>
                                </MotionBox>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Final CTA */}
            <Box sx={{ py: 12, position: 'relative', zIndex: 10 }}>
                <Container maxWidth="md">
                    <Box sx={{
                        textAlign: 'center',
                        p: { xs: 6, md: 8 },
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: theme.shadows[4]
                    }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                            Prêt à nous rejoindre ?
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 6, fontSize: '1.1rem', maxWidth: 600, mx: 'auto' }}>
                            Donnez à votre église la visibilité qu'elle mérite et connectez-vous avec d'autres responsables passionnés par l'unité du corps du Christ.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/register')}
                                sx={{ bgcolor: 'primary.main', borderRadius: 50, px: 6, py: 2, fontWeight: 700, fontSize: '1.1rem', textTransform: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                                Commencer maintenant
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{ borderColor: 'divider', color: 'text.primary', borderRadius: 50, px: 6, py: 2, fontWeight: 600, fontSize: '1.1rem', textTransform: 'none', '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }}
                            >
                                J'ai déjà un compte
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled', position: 'relative', zIndex: 10 }}>
                <Typography variant="body2">© 2026 Lightchurch Network • France</Typography>
            </Box>
        </Box>
    );
};

export default ForPastorsPage;
