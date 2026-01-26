import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip
} from '@mui/material';
import {
    People as UsersIcon,
    Church as ChurchIcon,
    Event as CalendarIcon,
    PersonAdd as UserPlusIcon,
    TrendingUp as TrendingUpIcon,
    ArrowForward as ArrowRightIcon,
    Schedule as CalendarClockIcon
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Link } from 'react-router-dom';
import EventsActivityChart from '../components/EventsActivityChart';

export default function DashboardHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [myEvents, setMyEvents] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            if (user?.role === 'SUPER_ADMIN') {
                try {
                    const { data } = await api.get('/admin/stats');
                    setStats(data);
                } catch (e) { console.error(e); }
            } else {
                try {
                    const { data } = await api.get('/church/my-events');
                    setMyEvents(data);
                } catch (e) { console.error(e); }
            }
            setLoading(false);
        };
        load();
    }, [user]);

    const nextEvent = myEvents
        .filter((e: any) => new Date(e.start_datetime) > new Date())
        .sort((a: any, b: any) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())[0];

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    // --- PASTOR DASHBOARD ---
    if (user?.role !== 'SUPER_ADMIN') {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* HERO SECTION */}
                <Card
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                            Bonjour, {user?.first_name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            Heureux de vous revoir. Voici ce qui se passe dans votre église aujourd'hui.
                        </Typography>
                    </CardContent>
                </Card>

                {/* STATS ROW */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex'
                                }}
                            >
                                <CalendarIcon />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Prochain Événement
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {nextEvent ? nextEvent.title : 'Aucun'}
                                </Typography>
                                {nextEvent && (
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(nextEvent.start_datetime).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: '50%',
                                    bgcolor: 'secondary.main',
                                    color: 'white',
                                    display: 'flex'
                                }}
                            >
                                <TrendingUpIcon />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Total Événements
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {myEvents.length}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* MAIN ACTIONS */}
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 2 }}>
                    Accès Rapide
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Card
                        component={Link}
                        to="/dashboard/my-church"
                        sx={{
                            textDecoration: 'none',
                            height: '100%',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 6
                            }
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <ChurchIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Mon Église
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Gérez les informations générales, les horaires de culte et les liens sociaux de votre église.
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Gérer mon église
                                </Typography>
                                <ArrowRightIcon fontSize="small" />
                            </Box>
                        </CardContent>
                    </Card>

                    <Card
                        component={Link}
                        to="/dashboard/events"
                        sx={{
                            textDecoration: 'none',
                            height: '100%',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 6
                            }
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CalendarIcon color="secondary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Mes Événements
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Planifiez vos prochains cultes, concerts ou réunions. Suivez leur statut de publication.
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Voir le calendrier
                                </Typography>
                                <ArrowRightIcon fontSize="small" />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        );
    }

    // --- ADMIN DASHBOARD ---
    if (!stats) return (
        <Box sx={{ p: 4 }}>
            <Typography>Impossible de charger les statistiques.</Typography>
        </Box>
    );

    // Trouver le nombre d'événements en cours
    const ongoingEvents = stats.charts.events_status.find((s: any) => s.name === 'En cours')?.count || 0;

    // Transform Growth Data for MUI X Charts
    const growthMonths = Array.from(new Set([
        ...stats.charts.growth.users.map((u: any) => u.month),
        ...stats.charts.growth.churches.map((c: any) => c.month)
    ])).sort();

    const usersData = growthMonths.map(month => {
        const u = stats.charts.growth.users.find((x: any) => x.month === month);
        return u ? u.count : 0;
    });

    const churchesData = growthMonths.map(month => {
        const c = stats.charts.growth.churches.find((x: any) => x.month === month);
        return c ? c.count : 0;
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography
                variant="h3"
                sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                Super Admin Dashboard
            </Typography>

            {/* KPI CARDS */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
                <KpiCard
                    icon={UsersIcon}
                    title="Total Utilisateurs"
                    value={stats.kpi.total_users}
                    trend="+12%"
                    color="primary"
                />
                <KpiCard
                    icon={UserPlusIcon}
                    title="En Attente"
                    value={stats.kpi.pending_users}
                    trend={stats.kpi.pending_users > 0 ? "Action requise" : "À jour"}
                    color="warning"
                />
                <KpiCard
                    icon={ChurchIcon}
                    title="Total Églises"
                    value={stats.kpi.total_churches}
                    trend="+5%"
                    color="secondary"
                />
                <KpiCard
                    icon={CalendarClockIcon}
                    title="En Cours"
                    value={ongoingEvents}
                    trend="Événements"
                    color="info"
                />
                <KpiCard
                    icon={CalendarIcon}
                    title="À Venir"
                    value={stats.kpi.upcoming_events}
                    trend="Événements"
                    color="success"
                />
            </Box>

            {/* CHARTS ROW 1 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <TrendingUpIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Croissance Mensuelle
                            </Typography>
                        </Box>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: growthMonths }]}
                            series={[
                                { data: usersData, label: 'Utilisateurs', color: '#3B82F6' },
                                { data: churchesData, label: 'Églises', color: '#8B5CF6' }
                            ]}
                            height={320}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <ChurchIcon color="secondary" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Répartition par Dénomination
                            </Typography>
                        </Box>
                        <PieChart
                            series={[
                                {
                                    data: stats.charts.by_denomination.map((d: any) => ({
                                        id: d.name,
                                        value: d.count,
                                        label: d.name
                                    })),
                                    innerRadius: 60,
                                    outerRadius: 100,
                                    paddingAngle: 2,
                                    cornerRadius: 4
                                }
                            ]}
                            height={320}
                        />
                    </CardContent>
                </Card>
            </Box>

            {/* CHARTS ROW 2 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <ChurchIcon color="success" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Distribution par Ville (Top 10)
                            </Typography>
                        </Box>
                        <BarChart
                            yAxis={[{ scaleType: 'band', data: stats.charts.churches_by_city.map((c: any) => c.name) }]}
                            series={[
                                {
                                    data: stats.charts.churches_by_city.map((c: any) => c.count),
                                    label: 'Églises',
                                    color: '#10B981'
                                }
                            ]}
                            layout="horizontal"
                            height={320}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CalendarIcon color="warning" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                État des Événements
                            </Typography>
                        </Box>
                        <PieChart
                            series={[
                                {
                                    data: stats.charts.events_status.map((e: any, index: number) => ({
                                        id: e.name,
                                        value: e.count,
                                        label: e.name,
                                        color: index === 0 ? '#3B82F6' : index === 1 ? '#F59E0B' : '#10B981'
                                    })),
                                    arcLabel: (item) => `${item.label}: ${item.value}`,
                                    arcLabelMinAngle: 35
                                }
                            ]}
                            height={320}
                        />
                    </CardContent>
                </Card>
            </Box>

            {/* CHARTS ROW 3 - Events Activity */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                <EventsActivityChart />
            </Box>
        </Box>
    );
}

interface KpiCardProps {
    icon: React.ElementType;
    title: string;
    value: number;
    trend: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
}

function KpiCard({ icon: Icon, title, value, trend, color }: KpiCardProps) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {value}
                        </Typography>
                        <Chip
                            label={trend}
                            size="small"
                            color={color}
                            sx={{ mt: 1, fontWeight: 600 }}
                        />
                    </Box>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: `${color}.main`,
                            color: 'white',
                            display: 'flex'
                        }}
                    >
                        <Icon fontSize="small" />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
