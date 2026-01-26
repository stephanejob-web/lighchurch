import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, Paper, Button, Divider, CircularProgress, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Event as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { EventDetails } from '../../types/publicMap';
import { fetchEventDetails } from '../../services/publicMapService';
import useEventInterestWeb from '../../hooks/useEventInterestWeb';

const STORAGE_KEY = 'light_church:interested_events';

interface MyParticipationsSidebarProps {
    onEventClick: (event: EventDetails) => void;
    onClose?: () => void;
}

const MyParticipationsSidebar: React.FC<MyParticipationsSidebarProps> = ({ onEventClick }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<EventDetails[]>([]);

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
            <Box sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <EventIcon sx={{ fontSize: 48, color: '#dadce0', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Aucune participation</Typography>
                <Typography variant="body2" sx={{ color: '#5F6368', mb: 3 }}>
                    Vous n'êtes inscrit à aucun événement pour le moment.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/map')}>
                    Explorer la carte
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #E8EAED', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/map')}
                    sx={{
                        color: '#5F6368',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { bgcolor: '#F1F3F4' }
                    }}
                >
                    Retour à la carte
                </Button>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <List>
                    {events.map(ev => {
                        const startDate = new Date(ev.start_datetime);
                        const isCancelled = !!ev.cancelled_at;
                        return (
                            <React.Fragment key={ev.id}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => onEventClick(ev)}
                                        alignItems="flex-start"
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            display: 'flex',
                                            gap: 2,
                                            borderLeft: isCancelled ? '4px solid #EA4335' : 'none',
                                            pl: isCancelled ? 1.5 : 2,
                                            opacity: isCancelled ? 0.8 : 1,
                                            bgcolor: isCancelled ? '#F1F3F4' : 'transparent',
                                            '&:hover': { bgcolor: isCancelled ? '#E8EAED' : '#F8F9FA' }
                                        }}
                                    >
                                        {/* Left Content */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            {/* Badge ANNULÉ */}
                                            {isCancelled && (
                                                <Box sx={{ mb: 0.5 }}>
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
                                                    {ev.cancellation_reason && (
                                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#EA4335', fontStyle: 'italic' }}>
                                                            "{ev.cancellation_reason}"
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: isCancelled ? '#5F6368' : '#202124', lineHeight: 1.2, mb: 0.5, textDecoration: isCancelled ? 'line-through' : 'none' }}>
                                                {ev.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Typography component="span" variant="body2" color="#5F6368">
                                                    {startDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })} • {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                                <Typography component="span" variant="body2" color="#5F6368">
                                                    {ev.details?.city || ev.church?.church_name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mt: 1.5 }} onClick={(e) => e.stopPropagation()}>
                                                <ParticipationButton eventId={ev.id} />
                                            </Box>
                                        </Box>

                                        {/* Right Icon (Event Date Badge) */}
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                width: 72,
                                                height: 72,
                                                borderRadius: 2,
                                                border: '1px solid #DADCE0',
                                                bgcolor: '#FFFFFF',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}
                                        >
                                            {/* Header (Mois) */}
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: 22,
                                                    bgcolor: '#EA4335',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#FFFFFF',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.65rem',
                                                        letterSpacing: '0.5px',
                                                        lineHeight: 1
                                                    }}
                                                >
                                                    {startDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
                                                </Typography>
                                            </Box>

                                            {/* Body (Jour + Heure) */}
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    pb: 0.5
                                                }}
                                            >
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        color: '#202124',
                                                        fontWeight: 400,
                                                        fontSize: '1.5rem',
                                                        lineHeight: 1,
                                                        mt: 0.5
                                                    }}
                                                >
                                                    {startDate.getDate()}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#EA4335',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 500,
                                                        mt: 0.25
                                                    }}
                                                >
                                                    {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </ListItemButton>
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>
        </Box>
    );
};

function ParticipationButton({ eventId }: { eventId: number }) {
    const { isInterested, isPending, toggle } = useEventInterestWeb(eventId, true);

    return (
        <Button
            size="small"
            variant={isInterested ? 'outlined' : 'contained'}
            color={isInterested ? 'error' : 'primary'}
            onClick={(e) => {
                e.stopPropagation();
                toggle().catch(() => { });
            }}
            disabled={isPending}
            sx={{
                minWidth: 0,
                px: 2,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
            }}
        >
            {isPending ? '...' : (isInterested ? 'Se désinscrire' : 'Participer')}
        </Button>
    );
}

export default MyParticipationsSidebar;
