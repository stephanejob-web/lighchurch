import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Stack,
    IconButton,
    Drawer,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    X as CloseIcon,
    Search,
    MapPin,
    Calendar,
    ShieldCheck,
    Smartphone,
    Share2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import lightChurchLogo from '../../assets/light-church.png';

const MotionBox = motion(Box);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Search size={28} />,
            title: 'Information introuvable',
            desc: 'Sites web obsolètes, pages Facebook abandonnées, données Google incorrectes...',
            color: '#EA4335'
        },
        {
            icon: <Calendar size={28} />,
            title: 'Horaires jamais à jour',
            desc: 'Impossible de savoir si l\'église est ouverte, quels sont les vrais horaires des cultes.',
            color: '#EA4335'
        },
        {
            icon: <MapPin size={28} />,
            title: 'Aucune visibilité',
            desc: 'Pas de plateforme unique pour découvrir les églises et événements autour de soi.',
            color: '#EA4335'
        }
    ];

    const solutions = [
        {
            icon: <Box sx={{ p: 1, bgcolor: 'rgba(66, 133, 244, 0.1)', borderRadius: 2, display: 'flex' }}><MapPin size={24} color="#4285F4" /></Box>,
            title: 'Carte interactive',
            desc: 'Visualisez toutes les églises évangéliques autour de vous en un coup d\'œil.'
        },
        {
            icon: <Box sx={{ p: 1, bgcolor: 'rgba(234, 67, 53, 0.1)', borderRadius: 2, display: 'flex' }}><Calendar size={24} color="#EA4335" /></Box>,
            title: 'Événements en temps réel',
            desc: 'Cultes, concerts, conférences, retraites... Ne ratez plus aucun événement.'
        },
        {
            icon: <Box sx={{ p: 1, bgcolor: 'rgba(52, 168, 83, 0.1)', borderRadius: 2, display: 'flex' }}><ShieldCheck size={24} color="#34A853" /></Box>,
            title: 'Infos vérifiées',
            desc: 'Horaires, adresses et contacts mis à jour directement par les responsables d\'église.'
        },
        {
            icon: <Box sx={{ p: 1, bgcolor: 'rgba(251, 188, 5, 0.1)', borderRadius: 2, display: 'flex' }}><Share2 size={24} color="#FBBC05" /></Box>,
            title: 'Participez facilement',
            desc: 'Indiquez votre intérêt pour un événement et partagez-le avec vos proches.'
        }
    ];

    return (
        <Box sx={{ bgcolor: '#050505', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Header */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    transition: 'all 0.3s ease',
                    bgcolor: isScrolled ? 'rgba(5, 5, 5, 0.8)' : 'transparent',
                    backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    py: 2
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <img src={lightChurchLogo} alt="Light Church" style={{ height: 40 }} />
                        </Box>

                        <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            <Typography sx={{ cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }} onClick={() => navigate('/map')}>Explorer</Typography>
                            <Typography sx={{ cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }}>Gérer ma communauté</Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/login')}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'black',
                                    borderRadius: 50,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    '&:hover': { bgcolor: '#f0f0f0' }
                                }}
                            >
                                Rejoindre le réseau
                            </Button>
                        </Stack>

                        <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }} onClick={() => setMobileMenuOpen(true)}>
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box sx={{ position: 'relative', pt: { xs: 20, md: 30 }, pb: { xs: 15, md: 25 }, overflow: 'hidden' }}>
                {/* Particle-like background effect */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 50%, rgba(66, 133, 244, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(234, 67, 53, 0.1) 0%, transparent 40%), radial-gradient(circle at 40% 80%, rgba(52, 168, 83, 0.1) 0%, transparent 40%)',
                        zIndex: 0
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        <Box sx={{ width: { xs: '100%', md: '58%' } }}>
                            <MotionBox
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontSize: { xs: '3rem', md: '5.5rem' },
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        mb: 4,
                                        letterSpacing: '-2px'
                                    }}
                                >
                                    Trouve une église <br />
                                    <Box component="span" sx={{ color: '#4285F4' }}>près de chez vous</Box>
                                </Typography>
                                <Typography sx={{ fontSize: '1.25rem', opacity: 0.7, mb: 6, maxWidth: 500 }}>
                                    L'information sur les églises est <Box component="span" sx={{ color: '#EA4335' }}>dispersée</Box>, les horaires <Box component="span" sx={{ color: '#EA4335' }}>rarement à jour</Box>. LightChurch centralise tout sur une carte interactive pour vous aider à trouver une communauté.
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/map')}
                                        startIcon={<Search size={20} />}
                                        sx={{
                                            bgcolor: '#4285F4',
                                            borderRadius: 3,
                                            py: 2,
                                            px: 4,
                                            fontSize: '1.1rem',
                                            textTransform: 'none',
                                            boxShadow: '0 8px 30px rgba(66, 133, 244, 0.4)'
                                        }}
                                    >
                                        Lancer l'expérience
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            borderRadius: 3,
                                            py: 2,
                                            px: 4,
                                            fontSize: '1.1rem',
                                            textTransform: 'none',
                                            '&:hover': { borderColor: 'white' }
                                        }}
                                    >
                                        Découvrir les fonctionnalités
                                    </Button>
                                </Stack>

                                <Stack direction="row" spacing={6} sx={{ mt: 10 }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={800}>10000</Typography>
                                        <Typography sx={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>Églises indexées</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h3" fontWeight={800}>39878</Typography>
                                        <Typography sx={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>Événements actifs</Typography>
                                    </Box>
                                </Stack>
                            </MotionBox>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Constraints Section */}
            <Box sx={{ py: 20, bgcolor: '#000' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography sx={{ color: '#EA4335', fontWeight: 700, letterSpacing: 2, mb: 2 }}>LE CONSTAT</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>Trouver une église ne devrait pas être si compliqué.</Typography>
                        <Typography sx={{ opacity: 0.6, maxWidth: 600, mx: 'auto' }}>
                            Vous déménagez, vous voyagez, ou vous cherchez simplement une communauté ? Aujourd'hui, c'est un parcours du combattant.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {features.map((f, i) => (
                            <Box key={i} sx={{ width: { xs: '100%', md: 'calc(33.333% - 22px)' } }}>
                                <Box
                                    sx={{
                                        p: 6,
                                        height: '100%',
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 6,
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            borderColor: 'rgba(234, 67, 53, 0.3)',
                                            bgcolor: 'rgba(234, 67, 53, 0.02)'
                                        }
                                    }}
                                >
                                    <Box sx={{ color: f.color, mb: 4, display: 'flex', justifyContent: 'center' }}>
                                        {f.icon}
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{f.title}</Typography>
                                    <Typography sx={{ opacity: 0.5 }}>{f.desc}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Solution Section */}
            <Box sx={{ py: 20 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 12 }}>
                        <Typography sx={{ color: '#34A853', fontWeight: 700, letterSpacing: 2, mb: 2 }}>LA SOLUTION</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>LightChurch change la donne.</Typography>
                        <Typography sx={{ opacity: 0.6, maxWidth: 700, mx: 'auto' }}>
                            Une plateforme unique où les églises mettent à jour leurs informations, et où vous trouvez tout ce dont vous avez besoin en quelques secondes.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {solutions.map((s, i) => (
                            <Box key={i} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
                                <Box
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        bgcolor: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: 4,
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            transform: 'translateY(-5px)'
                                        }
                                    }}
                                >
                                    <Box sx={{ mb: 3 }}>
                                        {s.icon}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>{s.title}</Typography>
                                    <Typography sx={{ opacity: 0.5, fontSize: '0.9rem' }}>{s.desc}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Pastor Section */}
            <Box sx={{ py: 15 }}>
                <Container maxWidth="md">
                    <Box
                        sx={{
                            p: { xs: 6, md: 10 },
                            borderRadius: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'radial-gradient(circle at center, rgba(66, 133, 244, 0.1), transparent 70%)',
                                zIndex: 0
                            }}
                        />

                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>Vous êtes responsable d'église ?</Typography>
                            <Typography sx={{ opacity: 0.6, mb: 6, maxWidth: 600, mx: 'auto' }}>
                                Référencez gratuitement votre église sur LightChurch. Mettez à jour vos horaires, publiez vos événements, et soyez visible par des milliers de personnes.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/register')}
                                    sx={{
                                        bgcolor: '#4285F4',
                                        borderRadius: 4,
                                        py: 2,
                                        px: 4,
                                        fontWeight: 700,
                                        textTransform: 'none'
                                    }}
                                >
                                    Référencer mon église gratuitement
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        borderRadius: 4,
                                        py: 2,
                                        px: 4,
                                    }}
                                >
                                    J'ai déjà un compte
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Mobile App Showcase */}
            <Box sx={{ py: 20, position: 'relative' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 32px)' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4285F4', mb: 3 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4285F4' }} />
                                <Typography sx={{ fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontSize: '0.8rem' }}>BIENTÔT DISPONIBLE</Typography>
                            </Box>
                            <Typography variant="h2" sx={{ fontWeight: 800, mb: 4 }}>Votre communauté, <br /> <Box component="span" sx={{ color: '#4285F4' }}>dans votre poche.</Box></Typography>
                            <Typography sx={{ opacity: 0.6, mb: 8, maxWidth: 500, fontSize: '1.1rem' }}>
                                L'expérience LightChurch arrive sur vos appareils mobiles. Recevez des notifications en temps réel, géolocalisez les églises instantanément et restez connecté à votre foi, où que vous soyez.
                            </Typography>

                            <Stack direction="row" spacing={2}>
                                <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 2, px: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid rgba(255, 255, 255, 0.05)', opacity: 0.5 }}>
                                    <Smartphone size={24} />
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', opacity: 0.5 }}>Download on the</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>App Store</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 2, px: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid rgba(255, 255, 255, 0.05)', opacity: 0.5 }}>
                                    <Smartphone size={24} />
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', opacity: 0.5 }}>Get it on</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>Google Play</Typography>
                                    </Box>
                                </Box>
                            </Stack>
                            <Typography sx={{ mt: 4, opacity: 0.3, fontSize: '0.8rem' }}>* Le lancement de l'application est prévu pour le deuxième trimestre 2026.</Typography>
                        </Box>

                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 32px)' } }}>
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        width: 300,
                                        height: 600,
                                        bgcolor: '#111',
                                        borderRadius: 10,
                                        border: '8px solid #222',
                                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    <Box sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 30, bgcolor: '#222', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, zIndex: 10 }} />
                                    <Box sx={{ p: 2, pt: 6 }}>
                                        <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, p: 2, mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Search size={14} color="rgba(255,255,255,0.4)" />
                                                <Box sx={{ width: '80%', height: 4, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }} />
                                            </Box>
                                            <Box sx={{ height: 200, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <MapPin size={40} color="rgba(66, 133, 244, 0.3)" />
                                            </Box>
                                            <Box sx={{ width: '60%', height: 10, bgcolor: 'rgba(66, 133, 244, 0.2)', borderRadius: 2, mb: 1 }} />
                                            <Box sx={{ width: '40%', height: 6, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                PaperProps={{
                    sx: { bgcolor: '#050505', color: 'white', width: '100%' }
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
                        <img src={lightChurchLogo} alt="Light Church" style={{ height: 32 }} />
                        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Stack spacing={4}>
                        <Typography variant="h4" sx={{ fontWeight: 700, cursor: 'pointer' }} onClick={() => { navigate('/map'); setMobileMenuOpen(false); }}>Explorer</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, cursor: 'pointer' }}>Gérer ma communauté</Typography>
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                            sx={{
                                bgcolor: 'white',
                                color: 'black',
                                py: 2,
                                borderRadius: 4,
                                fontWeight: 700
                            }}
                        >
                            Rejoindre le réseau
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </Box>
    );
};

export default LandingPage;
