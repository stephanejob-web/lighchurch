import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Skeleton } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import api from '../lib/axios';

interface MonthlyData {
  month: string;
  past: number;
  future: number;
  total: number;
}

export default function EventsActivityChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgPerMonth: 0, trend: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: response } = await api.get('/admin/stats/events-monthly');

      // Transformer les données pour le graphique
      const monthsMap = new Map<string, { past: number; future: number }>();

      response.forEach((item: any) => {
        if (!monthsMap.has(item.month)) {
          monthsMap.set(item.month, { past: 0, future: 0 });
        }
        const entry = monthsMap.get(item.month)!;
        if (item.period === 'past') {
          entry.past = item.count;
        } else {
          entry.future = item.count;
        }
      });

      // Convertir en tableau pour le graphique
      const chartData: MonthlyData[] = Array.from(monthsMap.entries()).map(([month, counts]) => ({
        month: formatMonth(month),
        past: counts.past,
        future: counts.future,
        total: counts.past + counts.future
      }));

      // Calculer les statistiques
      const total = chartData.reduce((sum, item) => sum + item.total, 0);
      const avg = total / chartData.length;

      // Tendance simple: comparer derniers 3 mois vs 3 mois précédents
      const recentTotal = chartData.slice(-3).reduce((sum, item) => sum + item.total, 0);
      const previousTotal = chartData.slice(-6, -3).reduce((sum, item) => sum + item.total, 0);
      const trend = recentTotal > previousTotal ? 'up' : recentTotal < previousTotal ? 'down' : 'stable';

      setData(chartData);
      setStats({ total, avgPerMonth: Math.round(avg), trend });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (month: string): string => {
    const [year, monthNum] = month.split('-');
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${months[parseInt(monthNum) - 1]} ${year.slice(2)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="rectangular" width="100%" height={320} sx={{ mt: 3, borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                color: 'white',
                display: 'flex'
              }}
            >
              <CalendarIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Activité Événementielle
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Derniers 6 mois + 3 mois à venir
              </Typography>
            </Box>
          </Box>

          {/* Trend Indicator */}
          <Chip
            icon={<TrendingUpIcon />}
            label={
              stats.trend === 'up' ? 'En hausse' :
              stats.trend === 'down' ? 'En baisse' :
              'Stable'
            }
            color={
              stats.trend === 'up' ? 'success' :
              stats.trend === 'down' ? 'error' :
              'default'
            }
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Stats Summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Événements
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {stats.total}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Moyenne / Mois
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {stats.avgPerMonth}
            </Typography>
          </Box>
        </Box>

        {/* Chart */}
        {data.length > 0 ? (
          <BarChart
            xAxis={[{
              scaleType: 'band',
              data: data.map(d => d.month),
              categoryGapRatio: 0.3,
              barGapRatio: 0.1,
            }]}
            series={[
              {
                data: data.map(d => d.past),
                label: 'Événements passés',
                color: '#3B82F6',
                stack: 'total',
              },
              {
                data: data.map(d => d.future),
                label: 'Événements à venir',
                color: '#10B981',
                stack: 'total',
              },
            ]}
            height={320}
            margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
            slotProps={{
              legend: {
                position: { vertical: 'top', horizontal: 'center' },
              },
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              gap: 2,
            }}
          >
            <EventIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography color="text.secondary">
              Aucun événement enregistré
            </Typography>
          </Box>
        )}

        {/* Bottom Info */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'success.main',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Les barres vertes représentent les événements planifiés dans le futur
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
