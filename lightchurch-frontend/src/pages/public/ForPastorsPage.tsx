import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Stack,
    IconButton,
    Grid
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

const MotionBox = motion(Box);

const ForPastorsPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let particles: Particle[] = [];
        const particleCount = 60;
        const connectionDistance = 200;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(66, 133, 244, 0.4)';
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach((p, i) => {
                p.update();
                p.draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(66, 133, 244, ${0.15 * (1 - dist / connectionDistance)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener('resize', handleResize);
        init();
        animate();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Scroll to top on mount
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
        <Box sx={{ bgcolor: '#050505', color: 'white', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
            {/* Background Animation */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    opacity: 0.6
                }}
            />

            {/* Gradient Overlay */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(5, 5, 5, 0.4) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}
            />

            {/* Header */}
            <Box sx={{ position: 'relative', zIndex: 10, py: 3 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton 
                            onClick={() => navigate('/')}
                            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <ChevronLeft />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Lightchurch</Typography>
                            <Box sx={{ bgcolor: '#4285F4', color: 'white', px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.65rem', fontWeight: 700 }}>PRO</Box>
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
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(66, 133, 244, 0.1)', borderRadius: 50, px: 2, py: 0.5, mb: 3 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4285F4' }} />
                                <Typography sx={{ color: '#4285F4', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 1 }}>RÉSEAU PASTORAL</Typography>
                            </Box>
                            
                            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 800, lineHeight: 1.1, mb: 3 }}>
                                Un Réseau National pour <br />
                                <Box component="span" sx={{ 
                                    background: 'linear-gradient(90deg, #4285F4 0%, #34A853 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    Connecter les Églises
                                </Box>
                            </Typography>
                            
                            <Typography sx={{ fontSize: '1.2rem', opacity: 0.7, mb: 5, lineHeight: 1.6, maxWidth: 600 }}>
                                LightChurch crée un pont entre les pasteurs, les responsables et les églises de toute la France pour favoriser l'unité, la collaboration et l'action commune.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/register')}
                                    sx={{ bgcolor: '#4285F4', borderRadius: 50, px: 4, py: 2, textTransform: 'none', fontWeight: 600, fontSize: '1.1rem', '&:hover': { bgcolor: '#3367D6' } }}
                                >
                                    Référencer mon église gratuitement
                                </Button>
                            </Stack>
                        </MotionBox>
                    </Grid>
                    
                    <Grid item xs={12} md={5}>
                        <MotionBox
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            sx={{ position: 'relative' }}
                        >
                            <Box sx={{ 
                                position: 'relative', 
                                width: '100%', 
                                aspectRatio: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {/* Central Hub Visual */}
                                <Box sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    bgcolor: 'rgba(66, 133, 244, 0.2)', 
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(66, 133, 244, 0.4)',
                                    boxShadow: '0 0 50px rgba(66, 133, 244, 0.3)',
                                    zIndex: 2
                                }}>
                                    <Typography variant="h4">🌐</Typography>
                                </Box>
                                
                                {/* Orbiting Nodes */}
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <MotionBox
                                        key={i}
                                        animate={{ 
                                            rotate: 360,
                                        }}
                                        transition={{ 
                                            duration: 20 + i * 5, 
                                            repeat: Infinity, 
                                            ease: "linear" 
                                        }}
                                        sx={{ 
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Box sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            bgcolor: 'rgba(255,255,255,0.05)', 
                                            borderRadius: '50%',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transform: `translate(${Math.cos(i * 60 * Math.PI / 180) * 150}px, ${Math.sin(i * 60 * Math.PI / 180) * 150}px)`,
                                            fontSize: '1.2rem'
                                        }}>
                                            ⛪
                                        </Box>
                                    </MotionBox>
                                ))}
                                
                                {/* Connection Lines (SVG) */}
                                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <line 
                                            key={i}
                                            x1="50%" y1="50%" 
                                            x2={`${50 + Math.cos(i * 60 * Math.PI / 180) * 35}%`} 
                                            y2={`${50 + Math.sin(i * 60 * Math.PI / 180) * 35}%`}
                                            stroke="rgba(66, 133, 244, 0.2)"
                                            strokeWidth="1"
                                        />
                                    ))}
                                </svg>
                            </Box>
                        </MotionBox>
                    </Grid>
                </Grid>
            </Container>

            {/* Features Grid */}
            <Box sx={{ py: 12, position: 'relative', zIndex: 10, bgcolor: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 4,
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.06)',
                                            transform: 'translateY(-5px)',
                                            borderColor: 'rgba(66, 133, 244, 0.3)'
                                        }
                                    }}
                                >
                                    <Box sx={{ color: '#4285F4', mb: 2 }}>{f.icon}</Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>{f.title}</Typography>
                                    <Typography sx={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</Typography>
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
                        background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.1) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                            Prêt à nous rejoindre ?
                        </Typography>
                        <Typography sx={{ opacity: 0.7, mb: 6, fontSize: '1.1rem', maxWidth: 600, mx: 'auto' }}>
                            Donnez à votre église la visibilité qu'elle mérite et connectez-vous avec d'autres responsables passionnés par l'unité du corps du Christ.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/register')}
                                sx={{ bgcolor: '#4285F4', borderRadius: 50, px: 6, py: 2, fontWeight: 700, fontSize: '1.1rem', textTransform: 'none', '&:hover': { bgcolor: '#3367D6' } }}
                            >
                                Commencer maintenant
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', borderRadius: 50, px: 6, py: 2, fontWeight: 600, fontSize: '1.1rem', textTransform: 'none', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
                            >
                                J'ai déjà un compte
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 6, textAlign: 'center', opacity: 0.3, position: 'relative', zIndex: 10 }}>
                <Typography variant="body2">© 2026 Lightchurch Network • France</Typography>
            </Box>
        </Box>
    );
};

export default ForPastorsPage;
