import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Stack, IconButton, Drawer, Divider, Grid } from '@mui/material';
import { Menu as MenuIcon, X as CloseIcon, CheckCircle2, XCircle, ArrowRight, Map, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import ParticleBackground from '../../components/landing/ParticleBackground';
import InteractiveChurchNetwork from '../../components/animations/InteractiveChurchNetwork';
import AnimatedDiscoveryMap from '../../components/animations/AnimatedDiscoveryMap';

const MotionBox = motion(Box);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        { emoji: '🏠', title: 'Carte interactive', desc: "Visualisez toutes les églises évangéliques autour de vous en un coup d'œil.", color: '#4285F4', bgColor: 'rgba(66, 133, 244, 0.15)' },
        { emoji: '📅', title: 'Événements en temps réel', desc: 'Cultes, concerts, conférences, retraites... Ne ratez plus aucun événement.', color: '#EA4335', bgColor: 'rgba(234, 67, 53, 0.15)' },
        { emoji: '✅', title: 'Infos vérifiées', desc: "Horaires, adresses et contacts mis à jour directement par les responsables d'église.", color: '#34A853', bgColor: 'rgba(52, 168, 83, 0.15)' },
        { emoji: '🔗', title: 'Participez facilement', desc: "Indiquez votre intérêt pour un événement et partagez-le avec vos proches.", color: '#FBBC05', bgColor: 'rgba(251, 188, 5, 0.15)' }
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
        <Box sx={{ bgcolor: '#050505', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
            <Box
                sx={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, transition: 'all 0.3s ease',
                    bgcolor: isScrolled ? 'rgba(5, 5, 5, 0.9)' : 'transparent',
                    backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    py: 2
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
                            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.4rem' }}>Lightchurch</Typography>
                            <Box sx={{ bgcolor: '#4285F4', color: 'white', px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Pro</Box>
                        </Box>
                        <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            <Typography sx={{ cursor: 'pointer', opacity: 0.7, fontSize: '0.95rem', transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }} onClick={() => navigate('/map')}>Explorer</Typography>

                            <Button 
                                onClick={() => navigate('/login')}
                                startIcon={<LogIn size={16} />}
                                sx={{ 
                                    color: 'white', 
                                    textTransform: 'none', 
                                    fontSize: '0.95rem', 
                                    opacity: 0.8,
                                    '&:hover': { opacity: 1, bgcolor: 'transparent' } 
                                }}
                            >
                                Se connecter
                            </Button>

                            <Button 
                                variant="contained" 
                                onClick={() => navigate('/for-pastors')} 
                                sx={{ 
                                    bgcolor: 'white', 
                                    color: 'black', 
                                    borderRadius: 50, 
                                    textTransform: 'none', 
                                    fontWeight: 600, 
                                    px: 3, 
                                    py: 1, 
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
                                }}
                            >
                                Rejoindre le réseau
                            </Button>
                        </Stack>
                        <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }} onClick={() => setMobileMenuOpen(true)}><MenuIcon /></IconButton>
                    </Box>
                </Container>
            </Box>
            <Box sx={{ position: 'relative', pt: { xs: 18, md: 24 }, pb: { xs: 12, md: 20 }, minHeight: '100vh' }}>
                <ParticleBackground />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' }, fontWeight: 700, lineHeight: 1.1, mb: 3, letterSpacing: '-1px' }}>Trouvez une église <Box component="span" sx={{ color: '#4285F4' }}>près de chez vous</Box></Typography>
                                <Typography sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, opacity: 0.7, mb: 5, maxWidth: 550, lineHeight: 1.7 }}>L'information sur les églises est <Box component="span" sx={{ color: '#EA4335' }}>dispersée</Box>, les horaires <Box component="span" sx={{ color: '#EA4335' }}>rarement à jour</Box>. LightChurch centralise tout sur une carte interactive pour vous aider à trouver une communauté.</Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 8 }}>
                                    <Button variant="contained" size="large" onClick={() => navigate('/map')} startIcon={<Map size={20} />} sx={{ bgcolor: '#4285F4', borderRadius: 50, py: 1.5, px: 4, fontSize: '1rem', textTransform: 'none', fontWeight: 500, '&:hover': { bgcolor: '#3367D6' } }}>Lancer l'expérience</Button>
                                    <Button variant="outlined" size="large" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} endIcon={<ArrowRight size={20} />} sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white', borderRadius: 50, py: 1.5, px: 4, fontSize: '1rem', textTransform: 'none', fontWeight: 500, transition: 'all 0.3s ease', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)', transform: 'translateX(5px)' } }}>Découvrir les fonctionnalités</Button>
                                </Stack>
                                <Stack direction="row" spacing={8}>
                                    <Box><Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' } }}>10000</Typography><Typography sx={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Églises indexées</Typography></Box>
                                    <Box><Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' } }}>39878</Typography><Typography sx={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Événements actifs</Typography></Box>
                                </Stack>
                            </MotionBox>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                sx={{ height: 500, position: 'relative' }}
                            >
                                <InteractiveChurchNetwork />
                            </MotionBox>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Box sx={{ py: { xs: 10, md: 16 }, position: 'relative' }}><ParticleBackground /><Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}><Box sx={{ textAlign: 'center', mb: 8 }}><Typography sx={{ color: '#EA4335', fontWeight: 600, letterSpacing: 2, mb: 2, fontSize: '0.85rem' }}>LE CONSTAT</Typography><Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>Trouver une église ne devrait pas être si compliqué.</Typography><Typography sx={{ opacity: 0.5, maxWidth: 600, mx: 'auto' }}>Vous déménagez, vous voyagez, ou vous cherchez simplement une communauté ? Aujourd'hui, c'est un parcours du combattant.</Typography></Box><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>{constraints.map((item, i) => (<Box key={i} sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, maxWidth: 380 }}><Box sx={{ p: 5, height: '100%', bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', borderColor: 'rgba(234, 67, 53, 0.3)' } }}><Typography sx={{ fontSize: '3rem', mb: 3 }}>{item.emoji}</Typography><Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#EA4335' }}>{item.title}</Typography><Typography sx={{ opacity: 0.5, fontSize: '0.95rem' }}>{item.desc}</Typography></Box></Box>))}</Box></Container></Box>
            <Box sx={{ py: { xs: 10, md: 16 }, position: 'relative', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={8} alignItems="center">
                        <Grid item xs={12} md={5}>
                             <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(52, 168, 83, 0.1)', borderRadius: 50, px: 2, py: 0.5, mb: 3 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34A853' }} />
                                <Typography sx={{ color: '#34A853', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 1 }}>LIVE DISCOVERY</Typography>
                            </Box>
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                                Explorez ce qui se passe <Box component="span" sx={{ color: '#34A853' }}>autour de vous.</Box>
                            </Typography>
                            <Typography sx={{ opacity: 0.7, mb: 4, lineHeight: 1.7, fontSize: '1.1rem' }}>
                                Une carte interactive ultra-rapide pour découvrir les églises dynamiques et les événements chrétiens dans votre ville.
                            </Typography>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(66, 133, 244, 0.1)' }}><CheckCircle2 size={20} color="#4285F4" /></Box>
                                    <Typography sx={{ fontWeight: 500 }}>Filtrage précis par types d'événements</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(66, 133, 244, 0.1)' }}><CheckCircle2 size={20} color="#4285F4" /></Box>
                                    <Typography sx={{ fontWeight: 500 }}>Itinéraires et horaires en temps réel</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <AnimatedDiscoveryMap />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box id="features" sx={{ py: { xs: 10, md: 16 }, position: 'relative' }}><ParticleBackground /><Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}><Box sx={{ textAlign: 'center', mb: 8 }}><Typography sx={{ color: '#34A853', fontWeight: 600, letterSpacing: 2, mb: 2, fontSize: '0.85rem' }}>LA SOLUTION</Typography><Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>LightChurch change la donne.</Typography><Typography sx={{ opacity: 0.5, maxWidth: 700, mx: 'auto' }}>Une plateforme unique où les églises mettent à jour leurs informations, et où vous trouvez tout ce dont vous avez besoin en quelques secondes.</Typography></Box><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>{solutions.map((item, i) => (<Box key={i} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(25% - 18px)' }, maxWidth: 300 }}><Box sx={{ p: 4, height: '100%', bgcolor: 'rgba(255, 255, 255, 0.02)', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', transform: 'translateY(-5px)' } }}><Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: item.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, fontSize: '1.5rem' }}>{item.emoji}</Box><Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>{item.title}</Typography><Typography sx={{ opacity: 0.5, fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography></Box></Box>))}</Box></Container></Box>
            <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: 'rgba(255, 255, 255, 0.02)', position: 'relative' }}><ParticleBackground /><Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}><Box sx={{ textAlign: 'center', mb: 10 }}><Typography sx={{ color: '#4285F4', fontWeight: 600, letterSpacing: 2, mb: 2, fontSize: '0.85rem' }}>POURQUOI NOUS ?</Typography><Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>Une nouvelle ère pour la visibilité chrétienne.</Typography><Typography sx={{ opacity: 0.5, maxWidth: 600, mx: 'auto' }}>Découvrez pourquoi LightChurch est la plateforme la plus avancée pour connecter les églises et leurs communautés.</Typography></Box>
            
            {/* Desktop Table Layout */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
                <Box sx={{ minWidth: 600 }}>
                    <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 3, mb: 3 }}>
                        <Box sx={{ flex: 2 }} />
                        <Box sx={{ flex: 1, textAlign: 'center' }}><Typography sx={{ fontWeight: 700, color: '#4285F4' }}>LightChurch</Typography></Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}><Typography sx={{ opacity: 0.4 }}>Annuaires traditionnels</Typography></Box>
                    </Box>
                    {comparisonData.map((row, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                            <Box sx={{ flex: 2 }}><Typography sx={{ fontWeight: 600, mb: 0.5 }}>{row.feature}</Typography><Typography sx={{ opacity: 0.4, fontSize: '0.85rem' }}>{row.description}</Typography></Box>
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{row.lightChurch ? <CheckCircle2 color="#34A853" size={24} /> : <XCircle color="#EA4335" size={24} />}</Box>
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{row.traditional ? <CheckCircle2 color="rgba(255,255,255,0.2)" size={24} /> : <XCircle color="rgba(255,255,255,0.2)" size={24} />}</Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Mobile Card Layout */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                {comparisonData.map((row, index) => (
                    <Box key={index} sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>{row.feature}</Typography>
                            <Typography sx={{ opacity: 0.5, fontSize: '0.9rem', lineHeight: 1.5 }}>{row.description}</Typography>
                        </Box>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(66, 133, 244, 0.1)', borderRadius: 2, border: '1px solid rgba(66, 133, 244, 0.2)' }}>
                                <Typography sx={{ fontWeight: 600, color: '#4285F4', fontSize: '0.9rem' }}>LightChurch</Typography>
                                {row.lightChurch ? <CheckCircle2 color="#4285F4" size={20} /> : <XCircle color="#EA4335" size={20} />}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5 }}>
                                <Typography sx={{ opacity: 0.4, fontSize: '0.9rem' }}>Traditionnel</Typography>
                                {row.traditional ? <CheckCircle2 color="rgba(255,255,255,0.2)" size={20} /> : <XCircle color="rgba(255,255,255,0.2)" size={20} />}
                            </Box>
                        </Stack>
                    </Box>
                ))}
            </Box>

            </Container></Box>
            <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}><ParticleBackground /><Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}><Box sx={{ p: { xs: 5, md: 8 }, borderRadius: 6, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}><Typography variant="h3" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.5rem', md: '2rem' } }}>Vous êtes responsable d'église ?</Typography><Typography sx={{ opacity: 0.5, mb: 5, maxWidth: 550, mx: 'auto' }}>Référencez gratuitement votre église sur LightChurch. Mettez à jour vos horaires, publiez vos événements, et soyez visible par des milliers de personnes.</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center"><Button variant="contained" onClick={() => navigate('/for-pastors')} sx={{ bgcolor: '#4285F4', borderRadius: 50, py: 1.5, px: 4, fontWeight: 500, textTransform: 'none', '&:hover': { bgcolor: '#3367D6' } }}>Référencer mon église gratuitement</Button><Button variant="outlined" onClick={() => navigate('/login')} sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white', borderRadius: 50, py: 1.5, px: 4, fontWeight: 500, textTransform: 'none', '&:hover': { borderColor: 'white' } }}>J'ai déjà un compte</Button></Stack></Box></Container></Box>
            <Box sx={{ py: { xs: 10, md: 16 }, position: 'relative' }}><ParticleBackground /><Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}><Box sx={{ width: { xs: '100%', md: '50%' }, pr: { md: 4 } }}><Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(66, 133, 244, 0.1)', borderRadius: 50, px: 2, py: 0.5, mb: 3 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4285F4' }} /><Typography sx={{ color: '#4285F4', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 1 }}>BIENTÔT DISPONIBLE</Typography></Box><Typography variant="h2" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>Votre communauté,<br /><Box component="span" sx={{ color: '#4285F4' }}>dans votre poche.</Box></Typography><Typography sx={{ opacity: 0.6, mb: 5, maxWidth: 450, lineHeight: 1.7 }}>L'expérience Light Church arrive sur vos appareils mobiles. Recevez des notifications en temps réel, géolocalisez les églises instantanément et restez connecté à votre foi, où que vous soyez.</Typography><Stack direction="row" spacing={2} sx={{ mb: 3 }}><Box sx={{ opacity: 0.8 }}><img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1314316800&h=6ae73b1854f3b7ba828ee54c126f3e5b" alt="App Store" style={{ height: 44 }} /></Box><Box sx={{ opacity: 0.8 }}><img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Google Play" style={{ height: 60, marginTop: -8 }} /></Box></Stack><Typography sx={{ opacity: 0.3, fontSize: '0.8rem' }}>* Le lancement de l'application est prévu pour le deuxième trimestre 2026.</Typography></Box>
            <Box sx={{ width: { xs: '100%', md: '45%' }, display: 'flex', justifyContent: 'center' }}><Box sx={{ position: 'relative' }}><Box sx={{ position: 'absolute', left: -10, top: 100, width: 3, height: 25, bgcolor: '#1a1a1a', borderRadius: '2px 0 0 2px' }} /><Box sx={{ position: 'absolute', left: -10, top: 140, width: 3, height: 45, bgcolor: '#1a1a1a', borderRadius: '2px 0 0 2px' }} /><Box sx={{ position: 'absolute', left: -10, top: 200, width: 3, height: 45, bgcolor: '#1a1a1a', borderRadius: '2px 0 0 2px' }} /><Box sx={{ position: 'absolute', right: -10, top: 150, width: 3, height: 70, bgcolor: '#1a1a1a', borderRadius: '0 2px 2px 0' }} /><Box sx={{ width: 280, height: 560, p: '10px', bgcolor: '#080808', borderRadius: '48px', boxShadow: '0 0 0 2px #1a1a1a, 0 40px 100px rgba(0,0,0,0.8), 0 0 80px rgba(66, 133, 244, 0.15)', position: 'relative' }}><Box sx={{ width: '100%', height: '100%', bgcolor: '#000', borderRadius: '38px', overflow: 'hidden', position: 'relative' }}><Box sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 90, height: 26, bgcolor: '#000', borderRadius: '20px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', background: 'radial-gradient(circle, #1a1a1a 0%, #000 100%)', opacity: 0.5 }} /></Box><Box sx={{ height: '100%', bgcolor: '#000', position: 'relative' }}><video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}><source src="/mobile.mp4" type="video/mp4" /></video><Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 45%, rgba(255,255,255,0.05) 55%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} /></Box></Box></Box></Box></Box></Box></Container></Box>
            <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} PaperProps={{ sx: { bgcolor: '#050505', color: 'white', width: '100%' } }}><Box sx={{ p: 3 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'white' }}>Lightchurch</Typography><Box sx={{ bgcolor: '#4285F4', color: 'white', px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Pro</Box></Box><IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton></Box><Stack spacing={3}><Typography variant="h5" sx={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => { navigate('/map'); setMobileMenuOpen(false); }}>Explorer</Typography><Typography variant="h5" sx={{ fontWeight: 600, cursor: 'pointer' }}>Gérer ma communauté</Typography><Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} /><Button variant="contained" fullWidth size="large" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} sx={{ bgcolor: 'white', color: 'black', py: 1.5, borderRadius: 50, fontWeight: 600, textTransform: 'none' }}>Rejoindre le réseau</Button></Stack></Box></Drawer>
        </Box>
    );
};

export default LandingPage;
