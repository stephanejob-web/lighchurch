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
} from 'lucide-react';
import { motion } from 'framer-motion';
import ParticleBackground from '../../components/landing/ParticleBackground';

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

    const constraints = [
        {
            emoji: '🔍',
            title: 'Information introuvable',
            desc: 'Sites web obsolètes, pages Facebook abandonnées, données Google incorrectes...',
        },
        {
            emoji: '⏰',
            title: 'Horaires jamais à jour',
            desc: "Impossible de savoir si l'église est ouverte, quels sont les vrais horaires des cultes.",
        },
        {
            emoji: '📍',
            title: 'Aucune visibilité',
            desc: "Pas de plateforme unique pour découvrir les églises et événements autour de soi.",
        }
    ];

    const solutions = [
        {
            emoji: '🏠',
            title: 'Carte interactive',
            desc: "Visualisez toutes les églises évangéliques autour de vous en un coup d'œil.",
            color: '#4285F4',
            bgColor: 'rgba(66, 133, 244, 0.15)'
        },
        {
            emoji: '📅',
            title: 'Événements en temps réel',
            desc: 'Cultes, concerts, conférences, retraites... Ne ratez plus aucun événement.',
            color: '#EA4335',
            bgColor: 'rgba(234, 67, 53, 0.15)'
        },
        {
            emoji: '✅',
            title: 'Infos vérifiées',
            desc: "Horaires, adresses et contacts mis à jour directement par les responsables d'église.",
            color: '#34A853',
            bgColor: 'rgba(52, 168, 83, 0.15)'
        },
        {
            emoji: '🔗',
            title: 'Participez facilement',
            desc: "Indiquez votre intérêt pour un événement et partagez-le avec vos proches.",
            color: '#FBBC05',
            bgColor: 'rgba(251, 188, 5, 0.15)'
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
                    bgcolor: isScrolled ? 'rgba(5, 5, 5, 0.9)' : 'transparent',
                    backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    py: 2
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                cursor: 'pointer' 
                            }}
                            onClick={() => navigate('/')}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    background: 'linear-gradient(90deg, #fff 0%, #aaa 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: '1.4rem'
                                }}
                            >
                                Lightchurch
                            </Typography>
                            <Box
                                sx={{
                                    bgcolor: '#4285F4',
                                    color: 'white',
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: 1,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1
                                }}
                            >
                                Pro
                            </Box>
                        </Box>

                        <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            <Typography
                                sx={{
                                    cursor: 'pointer',
                                    opacity: 0.7,
                                    fontSize: '0.95rem',
                                    '&:hover': { opacity: 1 }
                                }}
                                onClick={() => navigate('/map')}
                            >
                                Explorer
                            </Typography>
                            <Typography
                                sx={{
                                    cursor: 'pointer',
                                    opacity: 0.7,
                                    fontSize: '0.95rem',
                                    '&:hover': { opacity: 1 }
                                }}
                            >
                                Gérer ma communauté
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/login')}
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    borderRadius: 50,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    px: 3,
                                    py: 1,
                                    '&:hover': {
                                        bgcolor: 'white',
                                        color: 'black'
                                    }
                                }}
                            >
                                Rejoindre le réseau
                            </Button>
                        </Stack>

                        <IconButton
                            sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box sx={{ position: 'relative', pt: { xs: 18, md: 24 }, pb: { xs: 12, md: 20 }, minHeight: '100vh' }}>
                <ParticleBackground />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ maxWidth: 700 }}>
                        <MotionBox
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                                    fontWeight: 700,
                                    lineHeight: 1.1,
                                    mb: 3,
                                    letterSpacing: '-1px'
                                }}
                            >
                                Trouvez une église{' '}
                                <Box component="span" sx={{ color: '#4285F4' }}>
                                    près de chez vous
                                </Box>
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: { xs: '1rem', md: '1.15rem' },
                                    opacity: 0.7,
                                    mb: 5,
                                    maxWidth: 550,
                                    lineHeight: 1.7
                                }}
                            >
                                L'information sur les églises est{' '}
                                <Box component="span" sx={{ color: '#EA4335' }}>dispersée</Box>, les horaires{' '}
                                <Box component="span" sx={{ color: '#EA4335' }}>rarement à jour</Box>.
                                LightChurch centralise tout sur une carte interactive pour vous aider à trouver une communauté.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 8 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/map')}
                                    startIcon={<Search size={20} />}
                                    sx={{
                                        bgcolor: '#4285F4',
                                        borderRadius: 50,
                                        py: 1.5,
                                        px: 4,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        '&:hover': { bgcolor: '#3367D6' }
                                    }}
                                >
                                    Lancer l'expérience
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        borderRadius: 50,
                                        py: 1.5,
                                        px: 4,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'transparent'
                                        }
                                    }}
                                >
                                    Découvrir les fonctionnalités
                                </Button>
                            </Stack>

                            <Stack direction="row" spacing={8}>
                                <Box>
                                    <Typography
                                        variant="h3"
                                        sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' } }}
                                    >
                                        10000
                                    </Typography>
                                    <Typography sx={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Églises indexées
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h3"
                                        sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' } }}
                                    >
                                        39878
                                    </Typography>
                                    <Typography sx={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Événements actifs
                                    </Typography>
                                </Box>
                            </Stack>
                        </MotionBox>
                    </Box>
                </Container>
            </Box>

            {/* Le Constat Section */}
            <Box sx={{ py: { xs: 10, md: 16 }, position: 'relative' }}>
                <ParticleBackground />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            sx={{
                                color: '#EA4335',
                                fontWeight: 600,
                                letterSpacing: 2,
                                mb: 2,
                                fontSize: '0.85rem'
                            }}
                        >
                            LE CONSTAT
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                fontSize: { xs: '1.75rem', md: '2.5rem' }
                            }}
                        >
                            Trouver une église ne devrait pas être si compliqué.
                        </Typography>
                        <Typography sx={{ opacity: 0.5, maxWidth: 600, mx: 'auto' }}>
                            Vous déménagez, vous voyagez, ou vous cherchez simplement une communauté ?
                            Aujourd'hui, c'est un parcours du combattant.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                        {constraints.map((item, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: { xs: '100%', md: 'calc(33.333% - 16px)' },
                                    maxWidth: 380
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 5,
                                        height: '100%',
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 4,
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            borderColor: 'rgba(234, 67, 53, 0.3)',
                                        }
                                    }}
                                >
                                    <Typography sx={{ fontSize: '3rem', mb: 3 }}>
                                        {item.emoji}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            mb: 2,
                                            color: '#EA4335'
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography sx={{ opacity: 0.5, fontSize: '0.95rem' }}>
                                        {item.desc}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* La Solution Section */}
            <Box sx={{ py: { xs: 10, md: 16 }, position: 'relative' }}>
                <ParticleBackground />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            sx={{
                                color: '#34A853',
                                fontWeight: 600,
                                letterSpacing: 2,
                                mb: 2,
                                fontSize: '0.85rem'
                            }}
                        >
                            LA SOLUTION
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                fontSize: { xs: '1.75rem', md: '2.5rem' }
                            }}
                        >
                            LightChurch change la donne.
                        </Typography>
                        <Typography sx={{ opacity: 0.5, maxWidth: 700, mx: 'auto' }}>
                            Une plateforme unique où les églises mettent à jour leurs informations,
                            et où vous trouvez tout ce dont vous avez besoin en quelques secondes.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                        {solutions.map((item, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(25% - 18px)' },
                                    maxWidth: 300
                                }}
                            >
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
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 3,
                                            bgcolor: item.bgColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 3,
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        {item.emoji}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                                        {item.title}
                                    </Typography>
                                    <Typography sx={{ opacity: 0.5, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {item.desc}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Pastor Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
                <ParticleBackground />
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box
                        sx={{
                            p: { xs: 5, md: 8 },
                            borderRadius: 6,
                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            textAlign: 'center',
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                fontSize: { xs: '1.5rem', md: '2rem' }
                            }}
                        >
                            Vous êtes responsable d'église ?
                        </Typography>
                        <Typography sx={{ opacity: 0.5, mb: 5, maxWidth: 550, mx: 'auto' }}>
                            Référencez gratuitement votre église sur LightChurch.
                            Mettez à jour vos horaires, publiez vos événements, et
                            soyez visible par des milliers de personnes.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                onClick={() => navigate('/register')}
                                sx={{
                                    bgcolor: '#4285F4',
                                    borderRadius: 50,
                                    py: 1.5,
                                    px: 4,
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#3367D6' }
                                }}
                            >
                                Référencer mon église gratuitement
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/login')}
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    borderRadius: 50,
                                    py: 1.5,
                                    px: 4,
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    '&:hover': { borderColor: 'white' }
                                }}
                            >
                                J'ai déjà un compte
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* Mobile App Section */}
            <Box sx={{ py: { xs: 10, md: 16 }, position: 'relative' }}>
                <ParticleBackground />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <Box sx={{ width: { xs: '100%', md: '50%' }, pr: { md: 4 } }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    bgcolor: 'rgba(66, 133, 244, 0.1)',
                                    borderRadius: 50,
                                    px: 2,
                                    py: 0.5,
                                    mb: 3
                                }}
                            >
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4285F4' }} />
                                <Typography sx={{ color: '#4285F4', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 1 }}>
                                    BIENTÔT DISPONIBLE
                                </Typography>
                            </Box>

                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 3,
                                    fontSize: { xs: '1.75rem', md: '2.5rem' }
                                }}
                            >
                                Votre communauté,<br />
                                <Box component="span" sx={{ color: '#4285F4' }}>dans votre poche.</Box>
                            </Typography>

                            <Typography sx={{ opacity: 0.6, mb: 5, maxWidth: 450, lineHeight: 1.7 }}>
                                L'expérience Light Church arrive sur vos appareils mobiles.
                                Recevez des notifications en temps réel, géolocalisez les églises
                                instantanément et restez connecté à votre foi, où que vous soyez.
                            </Typography>

                            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                <Box
                                    component="a"
                                    href="#"
                                    sx={{
                                        display: 'block',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.05)' }
                                    }}
                                >
                                    <img 
                                        src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1314316800&h=6ae73b1854f3b7ba828ee54c126f3e5b" 
                                        alt="Download on the App Store" 
                                        style={{ height: 44 }}
                                    />
                                </Box>
                                <Box
                                    component="a"
                                    href="#"
                                    sx={{
                                        display: 'block',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.05)' }
                                    }}
                                >
                                    <img 
                                        src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                                        alt="Get it on Google Play" 
                                        style={{ height: 60, marginTop: -8 }}
                                    />
                                </Box>
                            </Stack>

                            <Typography sx={{ opacity: 0.3, fontSize: '0.8rem' }}>
                                * Le lancement de l'application est prévu pour le deuxième trimestre 2026.
                            </Typography>
                        </Box>

                        <Box sx={{ width: { xs: '100%', md: '45%' }, display: 'flex', justifyContent: 'center' }}>
                            {/* Phone Mockup */}
                            <Box
                                sx={{
                                    width: 280,
                                    height: 560,
                                    bgcolor: '#1a1a1a',
                                    borderRadius: '40px',
                                    border: '8px solid #333',
                                    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                {/* Notch */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 100,
                                        height: 28,
                                        bgcolor: '#333',
                                        borderBottomLeftRadius: 14,
                                        borderBottomRightRadius: 14,
                                        zIndex: 10
                                    }}
                                />

                                {/* Screen Content */}
                                <Box sx={{ height: '100%', bgcolor: '#000', position: 'relative' }}>
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    >
                                        <source src="/mobile.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    
                                    {/* Overlay Gradient for Notch visibility */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 50,
                                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
                                            zIndex: 5
                                        }}
                                    />
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    color: 'white'
                                }}
                            >
                                Lightchurch
                            </Typography>
                            <Box
                                sx={{
                                    bgcolor: '#4285F4',
                                    color: 'white',
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: 1,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}
                            >
                                Pro
                            </Box>
                        </Box>
                        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Stack spacing={3}>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => { navigate('/map'); setMobileMenuOpen(false); }}
                        >
                            Explorer
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, cursor: 'pointer' }}>
                            Gérer ma communauté
                        </Typography>
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                            sx={{
                                bgcolor: 'white',
                                color: 'black',
                                py: 1.5,
                                borderRadius: 50,
                                fontWeight: 600,
                                textTransform: 'none'
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
