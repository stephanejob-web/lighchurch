import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Skeleton
} from '@mui/material';
import api from '../../lib/axios';

interface Stats {
    churches: number;
    ongoingEvents: number;
    upcomingEvents: number;
}

/**
 * Composant affichant les statistiques globales (France)
 * en haut de la carte - Version compacte en une ligne
 */
const GlobalStats: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/public/stats');
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    py: 0.75,
                    px: 2,
                    backgroundColor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Skeleton variant="text" width={400} height={24} />
            </Box>
        );
    }

    if (!stats) return null;

    return (
        <Box
            sx={{
                py: 0.75,
                px: 2,
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🇫🇷 <strong>France:</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff9800', fontWeight: 600 }}>
                    {stats.ongoingEvents} 🟠
                </span>
                <span style={{ color: '#9e9e9e' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2196f3', fontWeight: 600 }}>
                    {stats.upcomingEvents} 🔵
                </span>
                <span style={{ color: '#9e9e9e' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d32f2f', fontWeight: 600 }}>
                    {stats.churches.toLocaleString('fr-FR')} ⛪
                </span>
            </Typography>
        </Box>
    );
};

export default GlobalStats;
