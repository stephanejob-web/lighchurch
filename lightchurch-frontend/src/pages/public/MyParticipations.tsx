import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, List, ListItem, Button, Divider, CircularProgress, IconButton, AppBar, Toolbar, useMediaQuery, useTheme, Fab, Chip, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Map as MapIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { EventDetails } from '../../types/publicMap';
import { fetchEventDetails } from '../../services/publicMapService';
import useEventInterestWeb from '../../hooks/useEventInterestWeb';
import DetailDrawer from '../../components/ui/DetailDrawer';

const STORAGE_KEY = 'light_church:interested_events';

export default function MyParticipations() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<EventDetails[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadLocal = useCallback(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [] as number[];
            const obj = JSON.parse(raw) as Record<string, number>;
            return Object.keys(obj).map(k => Number(k)).filter(Boolean);
        } catch {
            return [] as number[];
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const ids = loadLocal();
                if (ids.length === 0) {
                    if (mounted) setEvents([]);
                    return;
                }

                const promises = ids.map(id => fetchEventDetails(id).catch(() => null));
                const results = await Promise.all(promises);
                const good = results.filter(Boolean) as EventDetails[];
                if (mounted) setEvents(good);
            } catch (err) {
                console.error('Erreur chargement participations', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [loadLocal]);

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!events || events.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">Aucune participation</Typography>
                <Typography variant="body2" sx={{ color: '#5F6368', mt: 1 }}>Vous n'êtes inscrit à aucun événement pour le moment.</Typography>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={() => navigate('/map')}>Voir la carte</Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header with back button */}
            <AppBar position="static" elevation={1}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/map')}
                        aria-label="Retour à la carte"
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Mes participations
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Content */}
            <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
            <List>
                {events.map(ev => {
                    const now = new Date();
                    const endDate = ev.end_datetime ? new Date(ev.end_datetime) : null;
                    const isCompleted = !!(endDate && now > endDate);
                    const isCancelled = !!ev.cancelled_at;

                    return (
                        <React.Fragment key={ev.id}>
                            <ListItem
                                sx={{
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile ? 'stretch' : 'center',
                                    py: 2,
                                    gap: isMobile ? 2 : 0,
                                    opacity: (isCompleted || isCancelled) ? 0.6 : 1,
                                    bgcolor: isCancelled ? '#FEF7F7' : (isCompleted ? '#F8F9FA' : 'transparent'),
                                    borderLeft: isCancelled ? '4px solid #EA4335' : 'none',
                                    pl: isCancelled ? 1.5 : 2
                                }}
                                secondaryAction={!isMobile ? (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" variant="outlined" onClick={async () => {
                                            setDetailLoading(true);
                                            try {
                                                const details = await fetchEventDetails(ev.id);
                                                setSelectedEvent(details);
                                                setDrawerOpen(true);
                                            } catch (e) {
                                                console.error('Failed to load event details', e);
                                            } finally {
                                                setDetailLoading(false);
                                            }
                                        }}>Détails</Button>
                                        <ParticipationButton eventId={ev.id} isCompleted={isCompleted} />
                                    </Box>
                                ) : undefined}
                            >
                                <Box sx={{ flex: 1, pr: isMobile ? 0 : 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                textDecoration: isCancelled ? 'line-through' : 'none',
                                                color: isCancelled ? '#5F6368' : 'inherit'
                                            }}
                                        >
                                            {ev.title}
                                        </Typography>
                                        {isCancelled && (
                                            <Chip
                                                label="ANNULÉ"
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    bgcolor: '#EA4335',
                                                    color: '#FFFFFF',
                                                    letterSpacing: '0.5px'
                                                }}
                                            />
                                        )}
                                        {isCompleted && !isCancelled && (
                                            <Chip
                                                label="TERMINÉ"
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    bgcolor: '#5F6368',
                                                    color: '#FFFFFF'
                                                }}
                                            />
                                        )}
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        {ev.details?.city ? `${ev.details.city} • ${new Date(ev.start_datetime).toLocaleString('fr-FR')}` : new Date(ev.start_datetime).toLocaleString('fr-FR')}
                                    </Typography>
                                </Box>
                                {isMobile && (
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                        <Button
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            onClick={async () => {
                                                setDetailLoading(true);
                                                try {
                                                    const details = await fetchEventDetails(ev.id);
                                                    setSelectedEvent(details);
                                                    setDrawerOpen(true);
                                                } catch (e) {
                                                    console.error('Failed to load event details', e);
                                                } finally {
                                                    setDetailLoading(false);
                                                }
                                            }}
                                        >
                                            Détails
                                        </Button>
                                        <ParticipationButton eventId={ev.id} fullWidth isCompleted={isCompleted} />
                                    </Box>
                                )}
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    );
                })}
            </List>
            </Box>
            <DetailDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setSelectedEvent(null); }}
                loading={detailLoading}
                data={selectedEvent}
                type="event"
            />

            {/* FAB - Floating Action Button pour retourner à la carte */}
            <Fab
                variant={isMobile ? 'circular' : 'extended'}
                color="primary"
                onClick={() => navigate('/map')}
                sx={{
                    position: 'fixed',
                    bottom: isMobile ? 16 : 24,
                    right: isMobile ? 16 : 24,
                    bgcolor: '#1A73E8',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                        bgcolor: '#1565C0',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <MapIcon sx={{ mr: isMobile ? 0 : 1 }} />
                {!isMobile && 'Carte'}
            </Fab>
        </Box>
    );
}

function ParticipationButton({ eventId, fullWidth, isCompleted }: { eventId: number; fullWidth?: boolean; isCompleted?: boolean }) {
    const { isInterested, isPending, toggle } = useEventInterestWeb(eventId, true);

    const getButtonText = () => {
        if (isPending) return '...';
        if (isCompleted) {
            return isInterested ? 'Retirer de ma liste' : 'Je participe';
        }
        return isInterested ? 'Ne plus participer' : 'Je participe';
    };

    return (
        <Button
            fullWidth={fullWidth}
            size="small"
            variant={isInterested ? 'contained' : 'outlined'}
            onClick={() => toggle().catch(() => {})}
            disabled={isPending}
            sx={isCompleted ? {
                bgcolor: isInterested ? '#757575' : undefined,
                borderColor: '#757575',
                color: isInterested ? '#FFFFFF' : '#757575',
                '&:hover': {
                    bgcolor: isInterested ? '#616161' : undefined,
                    borderColor: '#616161'
                }
            } : undefined}
        >
            {getButtonText()}
        </Button>
    );
}
