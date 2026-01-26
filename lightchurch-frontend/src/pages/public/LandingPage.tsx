import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Stack,
    IconButton,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from '@mui/material';
import { motion } from 'framer-motion';
import lightChurchLogo from '../../assets/light-church.png';
import {
    Church,
    Calendar,
    MapPin,
    Smartphone,
    ArrowRight,
    Apple,
    PlayCircle,
    Menu as MenuIcon,
    X as CloseIcon,
    Star,
    CheckCircle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MotionBox = motion(Box);
const MotionCard = motion(Card);

import { fetchPlatformStats } from '../../services/publicMapService';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [stats, setStats] = React.useState({ churches: 500, events: 1200 });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    React.useEffect(() => {
        const loadStats = async () => {
            const realStats = await fetchPlatformStats();
            // On ne met à jour que si les chiffres sont significatifs (plus que le dummy content)
            // ou si on veut vraiment la vérité brute. Ici je prends le max pour éviter de montrer "3 églises".
            // MAIS la demande est "le vrai nombre". Donc on respecte.
            // Si c'est 0, ça sera 0.
            setStats(realStats);
        };
        loadStats();
    }, []);

    const features = [
        {
            icon: <Church size={32} />,
            title: 'Trouvez des églises',
            description: 'Découvrez les églises près de chez vous grâce à notre carte interactive avec géolocalisation.',
            color: '#1A73E8',
            bgcolor: '#E8F0FE'
        },
        {
            icon: <Calendar size={32} />,
            title: 'Événements à proximité',
            description: 'Ne manquez aucun événement : cultes, conférences, concerts et activités communautaires.',
            color: '#EA4335',
            bgcolor: '#FCE8E6'
        },
        {
            icon: <MapPin size={32} />,
            title: 'Géolocalisation précise',
            description: 'Localisez instantanément les églises et événements autour de vous avec calcul de distance.',
            color: '#34A853',
            bgcolor: '#E6F4EA'
        },
        {
            icon: <Smartphone size={32} />,
            title: 'Application mobile',
            description: 'Téléchargez notre app iOS et Android pour recevoir des notifications et rester connecté.',
            color: '#FBBC04',
            bgcolor: '#FEF7E0'
        },
    ];

    return (
        <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Header / Navbar */}
            <Box
                component="nav"
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    backdropFilter: 'blur(12px)',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 1.5,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img src={lightChurchLogo} alt="Light Church" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
                            </Box>
                        </Box>
                        {!isMobile ? (
                            <Stack direction="row" spacing={1}>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/map')}
                                    sx={{ color: '#5F6368', fontWeight: 500, textTransform: 'none', '&:hover': { color: '#1A73E8', bgcolor: 'transparent' } }}
                                >
                                    Explorer la carte
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/login')}
                                    sx={{ color: '#5F6368', fontWeight: 500, textTransform: 'none', '&:hover': { color: '#1A73E8', bgcolor: 'transparent' } }}
                                >
                                    Espace Responsable
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/register')}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: 'none',
                                        bgcolor: '#1A73E8',
                                        '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' }
                                    }}
                                >
                                    Ajouter mon église
                                </Button>
                            </Stack>
                        ) : (
                            <IconButton
                                color="default"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Menu"
                            >
                                <MenuIcon size={24} color="#5F6368" />
                            </IconButton>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Mobile Menu Drawer */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                PaperProps={{
                    sx: {
                        width: 280,
                        bgcolor: '#FFFFFF',
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F3F4' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img src={lightChurchLogo} alt="Light Church" style={{ height: 32 }} />
                    </Box>
                    <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
                        <CloseIcon size={20} color="#5F6368" />
                    </IconButton>
                </Box>
                <List sx={{ pt: 2 }}>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate('/map');
                                setMobileMenuOpen(false);
                            }}
                            sx={{ py: 1.5 }}
                        >
                            <ListItemText
                                primary="Explorer la carte"
                                primaryTypographyProps={{ fontWeight: 500, color: '#202124' }}
                            />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate('/login');
                                setMobileMenuOpen(false);
                            }}
                            sx={{ py: 1.5 }}
                        >
                            <ListItemText
                                primary="Espace Responsable"
                                primaryTypographyProps={{ fontWeight: 500, color: '#202124' }}
                            />
                        </ListItemButton>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate('/register');
                                setMobileMenuOpen(false);
                            }}
                            sx={{ py: 1.5, bgcolor: '#E8F0FE', mx: 1, borderRadius: 1, '&:hover': { bgcolor: '#D2E3FC' } }}
                        >
                            <ListItemText
                                primary="Ajouter mon église"
                                primaryTypographyProps={{ fontWeight: 600, color: '#1A73E8' }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>

            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: '90vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)',
                    pt: { xs: 16, md: 20 },
                    overflow: 'hidden',
                }}
            >
                {/* Soft Decoration */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: '50%',
                        height: '80%',
                        background: 'radial-gradient(circle, rgba(26,115,232,0.08) 0%, rgba(255,255,255,0) 70%)',
                        zIndex: 0,
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <Box sx={{ width: { xs: '100%', md: '50%' }, flexGrow: { md: 1 } }}>
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontSize: { xs: '2.5rem', md: '3.75rem', lg: '4.5rem' },
                                        fontWeight: 800,
                                        lineHeight: 1.1,
                                        mb: 3,
                                        color: '#202124',
                                        letterSpacing: '-1.5px'
                                    }}
                                >
                                    Églises et Événements <br />
                                    <Box component="span" sx={{ color: '#1A73E8' }}>Évangéliques Près de Vous</Box>
                                </Typography>

                                {/* Social Proof */}
                                <Stack direction="row" spacing={3} sx={{ mb: 4, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ bgcolor: '#E8F0FE', p: 0.5, borderRadius: '50%' }}>
                                            <CheckCircle size={16} color="#1A73E8" />
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={600} color="#5F6368">
                                            +{stats.churches} Églises
                                        </Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ bgcolor: '#FCE8E6', p: 0.5, borderRadius: '50%' }}>
                                            <CheckCircle size={16} color="#EA4335" />
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={600} color="#5F6368">
                                            +{stats.events} Événements
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 5,
                                        color: '#5F6368',
                                        lineHeight: 1.6,
                                        fontWeight: 400,
                                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                                    }}
                                >
                                    La plateforme de référence pour trouver des églises évangéliques locales et découvrir les événements près de vous.
                                </Typography>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    sx={{ mb: 6 }}
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/map')}
                                        endIcon={<ArrowRight size={20} />}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            bgcolor: '#1A73E8',
                                            borderRadius: 2,
                                            boxShadow: '0 4px 12px rgba(26,115,232,0.2)',
                                            '&:hover': {
                                                bgcolor: '#1557B0',
                                                boxShadow: '0 6px 16px rgba(26,115,232,0.3)',
                                            },
                                        }}
                                    >
                                        Explorer la carte
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<Smartphone size={20} />}
                                        onClick={() => {
                                            document.getElementById('mobile-app')?.scrollIntoView({
                                                behavior: 'smooth',
                                            });
                                        }}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderColor: '#DADCE0',
                                            color: '#5F6368',
                                            borderRadius: 2,
                                            '&:hover': {
                                                borderColor: '#202124',
                                                bgcolor: 'transparent',
                                                color: '#202124'
                                            },
                                        }}
                                    >
                                        L'application mobile
                                    </Button>
                                </Stack>
                            </MotionBox>
                        </Box>

                        <Box sx={{ width: { xs: '100%', md: '50%' }, flexGrow: { md: 1 } }}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: { xs: 350, md: 550 },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {/* Mockup Placeholder - Replacing abstract with something cleaner */}
                                    <Box
                                        sx={{
                                            width: '90%',
                                            height: '90%',
                                            borderRadius: 4,
                                            background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F3F4 100%)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                            border: '1px solid #FFFFFF'
                                        }}
                                    >
                                        {/* Mockup Top Bar */}
                                        <Box sx={{ height: 40, borderBottom: '1px solid #F1F3F4', display: 'flex', alignItems: 'center', px: 2, gap: 1 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF5F57' }} />
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28C840' }} />
                                        </Box>
                                        {/* Mockup Content - Map-like UI */}
                                        <Box sx={{ flex: 1, position: 'relative', bgcolor: '#E8EAED' }}>
                                            <MapContainer
                                                center={[48.8566, 2.3522]}
                                                zoom={13}
                                                style={{ height: '100%', width: '100%' }}
                                                zoomControl={false}
                                                dragging={false}
                                                scrollWheelZoom={false}
                                                doubleClickZoom={false}
                                                touchZoom={false}
                                                attributionControl={false}
                                            >
                                                <TileLayer
                                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                                />
                                                <Marker position={[48.8566, 2.3522]} />
                                                <Marker position={[48.8606, 2.3376]} />
                                                <Marker position={[48.8530, 2.3499]} />
                                            </MapContainer>

                                            {/* Floating Search Result Card */}
                                            <MotionBox
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.8, duration: 0.5 }}
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 40,
                                                    left: { xs: 20, md: -20 },
                                                    right: { xs: 20, md: 'auto' },
                                                    width: { xs: 'auto', md: 280 },
                                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter: 'blur(10px)',
                                                    p: 2,
                                                    borderRadius: 3,
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                                                    border: '1px solid rgba(255,255,255,0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}
                                            >
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 2,
                                                    bgcolor: '#E8F0FE',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Church color="#1A73E8" size={24} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={700} color="#202124">
                                                        Église Évangélique
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Star size={12} fill="#FBBC04" color="#FBBC04" />
                                                        <Typography variant="caption" fontWeight={600} color="#202124">4.9</Typography>
                                                        <Typography variant="caption" color="#5F6368">• À 200m</Typography>
                                                    </Box>
                                                </Box>
                                            </MotionBox>

                                            {/* Overlay to prevent interaction and add subtle gradient */}
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                pointerEvents: 'none',
                                                background: 'linear-gradient(to bottom, rgba(255,255,255,0) 80%, rgba(255,255,255,0.8) 100%)',
                                                zIndex: 1000
                                            }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </MotionBox>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: 12, bgcolor: '#F8F9FA' }}>
                <Container maxWidth="lg">
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography
                                variant="overline"
                                sx={{ color: '#1A73E8', fontWeight: 700, letterSpacing: 1.2 }}
                            >
                                FONCTIONNALITÉS
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2rem', md: '2.5rem' },
                                    fontWeight: 700,
                                    color: '#202124',
                                    mt: 1,
                                    mb: 2,
                                }}
                            >
                                Tout pour votre vie d'église
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#5F6368',
                                    maxWidth: 600,
                                    mx: 'auto',
                                    fontSize: '1.1rem',
                                    fontWeight: 400
                                }}
                            >
                                Une suite d'outils complète conçue pour connecter les croyants et dynamiser les communautés évangéliques.
                            </Typography>
                        </Box>
                    </MotionBox>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {features.map((feature, index) => (
                            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }} key={index}>
                                <MotionCard
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    sx={{
                                        height: '100%',
                                        bgcolor: '#FFFFFF',
                                        borderRadius: 3,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        border: '1px solid rgba(0,0,0,0.03)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                            borderColor: 'rgba(26,115,232,0.1)',
                                            '&::before': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: feature.bgcolor,
                                                color: feature.color,
                                                mb: 3,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight={700} color="#202124" mb={1.5}>
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: '#5F6368', lineHeight: 1.7, flex: 1 }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </MotionCard>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Mobile App Section */}
            <Box
                id="mobile-app"
                sx={{
                    py: 12,
                    bgcolor: '#FFFFFF',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <Box sx={{ width: { xs: '100%', md: '50%' }, flexGrow: { md: 1 }, order: { xs: 2, md: 1 } }}>
                            <MotionBox
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontSize: { xs: '2rem', md: '3rem' },
                                        fontWeight: 800,
                                        mb: 3,
                                        color: '#202124',
                                        letterSpacing: '-1px'
                                    }}
                                >
                                    Emportez Light Church<br />partout avec vous
                                </Typography>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#5F6368',
                                        mb: 5,
                                        lineHeight: 1.7,
                                        fontSize: '1.1rem',
                                        fontWeight: 400
                                    }}
                                >
                                    L'expérience complète dans votre poche. Géolocalisation, notifications
                                    et accès hors-ligne pour rester connecté à votre foi où que vous soyez.
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<Apple size={24} />}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            borderColor: '#DADCE0',
                                            color: '#202124',
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            bgcolor: 'transparent',
                                            '&:hover': {
                                                bgcolor: '#F8F9FA',
                                                borderColor: '#202124'
                                            }
                                        }}
                                    >
                                        <Box sx={{ textAlign: 'left', ml: 1 }}>
                                            <Typography variant="caption" display="block" sx={{ lineHeight: 1, color: '#5F6368' }}>Disponible sur</Typography>
                                            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1 }}>App Store</Typography>
                                        </Box>
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<PlayCircle size={24} />}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            borderColor: '#DADCE0',
                                            color: '#202124',
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            bgcolor: 'transparent',
                                            '&:hover': {
                                                bgcolor: '#F8F9FA',
                                                borderColor: '#202124'
                                            }
                                        }}
                                    >
                                        <Box sx={{ textAlign: 'left', ml: 1 }}>
                                            <Typography variant="caption" display="block" sx={{ lineHeight: 1, color: '#5F6368' }}>Disponible sur</Typography>
                                            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1 }}>Google Play</Typography>
                                        </Box>
                                    </Button>
                                </Stack>
                            </MotionBox>
                        </Box>

                        <Box sx={{ width: { xs: '100%', md: '40%' }, order: { xs: 1, md: 2 } }}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                                sx={{ display: 'flex', justifyContent: 'center' }}
                            >
                                {/* Video Container without Mockup Frame */}
                                <Box
                                    sx={{
                                        width: 300,
                                        height: 600,
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        boxShadow: '0 24px 60px -12px rgba(0,0,0,0.15)',
                                        mx: 'auto'
                                    }}
                                >
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                    >
                                        <source src="/mobile.mp4" type="video/mp4" />
                                        Votre navigateur ne supporte pas la vidéo.
                                    </video>
                                </Box>
                            </MotionBox>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: 10, bgcolor: '#F8F9FA' }}>
                <Container maxWidth="md">
                    <Box
                        sx={{
                            textAlign: 'center',
                            bgcolor: '#1A73E8',
                            borderRadius: 4,
                            p: { xs: 4, md: 8 },
                            color: 'white',
                            boxShadow: '0 20px 40px -10px rgba(26,115,232,0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Abstract BG */}
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)', pointerEvents: 'none' }} />

                        <Typography variant="h3" fontWeight={700} mb={2} sx={{ position: 'relative' }}>
                            Prêt à commencer ?
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 600, mx: 'auto', fontWeight: 400, position: 'relative' }}>
                            Trouvez votre communauté évangélique Light Church aujourd'hui. C'est gratuit et ouvert à tous.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/map')}
                            sx={{
                                bgcolor: 'white',
                                color: '#1A73E8',
                                py: 1.5,
                                px: 5,
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    bgcolor: '#F1F3F4',
                                }
                            }}
                        >
                            Explorer maintenant
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 8,
                    bgcolor: '#202124',
                    color: '#9AA0A6'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, mb: 8 }}>
                        <Box sx={{ width: { xs: '100%', md: '30%' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={lightChurchLogo} alt="Light Church" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                                Connecter les églises évangéliques, les événements et les croyants pour une communauté plus forte et unie.
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} color="white" mb={2} textTransform="uppercase" letterSpacing={1}>
                                    Navigation
                                </Typography>
                                <Stack spacing={1.5}>
                                    <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/map')}>Carte</Box>
                                    <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/login')}>Espace Responsable</Box>
                                    <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/register')}>Ajouter mon église</Box>
                                </Stack>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} color="white" mb={2} textTransform="uppercase" letterSpacing={1}>
                                    Ressources
                                </Typography>
                                <Stack spacing={1.5}>
                                    <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Blog</Box>
                                    <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Aide</Box>
                                    <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Pour les Pasteurs</Box>
                                </Stack>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} color="white" mb={2} textTransform="uppercase" letterSpacing={1}>
                                    Légal
                                </Typography>
                                <Stack spacing={1.5}>
                                    <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Confidentialité</Box>
                                    <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Conditions générales</Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 4 }} />

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">
                            © 2026 Light Church. Tous droits réservés.
                        </Typography>
                        <Stack direction="row" spacing={3}>
                            {/* Social icons placeholders could go here */}
                            <Typography variant="body2">Fait avec passion.</Typography>
                        </Stack>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
