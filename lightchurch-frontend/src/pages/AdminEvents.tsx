import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    Grid,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/Loader';

interface Event {
    id: number;
    title: string;
    start_datetime: string;
    end_datetime: string;
    status?: string;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
    church_name: string;
    first_name: string;
    last_name: string;
}

export default function AdminEvents() {
    const navigate = useNavigate();
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Pagination State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // ✅ Métadonnées de pagination depuis le backend
    const [paginationMeta, setPaginationMeta] = useState({
        total: 0,
        totalPages: 1
    });

    /**
     * Calcule le statut dynamique d'un événement basé sur les dates
     */
    const calculateEventStatus = useCallback((event: Event): string => {
        // Si l'événement est annulé, retourner CANCELLED
        if (event.cancelled_at) {
            return 'CANCELLED';
        }

        const now = new Date();
        const startDate = new Date(event.start_datetime);
        const endDate = new Date(event.end_datetime);

        // Si la date de fin est passée
        if (now > endDate) {
            return 'COMPLETED';
        }

        // Si l'événement est en cours (entre start et end)
        if (now >= startDate && now <= endDate) {
            return 'ONGOING';
        }

        // Si l'événement est à venir
        if (now < startDate) {
            return 'UPCOMING';
        }

        return 'UPCOMING';
    }, []);

    /**
     * ✅ OPTIMISÉ: Récupère les événements avec filtrage et pagination BACKEND
     */
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/events', {
                params: {
                    page,
                    limit: itemsPerPage,
                    search,
                    status: statusFilter // ✅ Filtrage backend par statut
                }
            });

            // Handle both legacy array format and new paginated format
            let eventsList: Event[] = [];
            let total = 0;
            let totalPages = 1;

            if (Array.isArray(data)) {
                // Legacy format (pas de pagination)
                eventsList = data;
                total = data.length;
                totalPages = Math.ceil(total / itemsPerPage);
            } else {
                // New paginated format
                eventsList = data.data || [];
                total = data.meta?.total || 0;
                totalPages = data.meta?.totalPages || 1;
            }

            // ✅ Le statut est DÉJÀ calculé côté backend via enrichEventsWithStatus()
            // Enrichir à nouveau côté frontend pour garantir la cohérence (double sécurité)
            const enrichedEvents = eventsList.map(event => ({
                ...event,
                status: event.status || calculateEventStatus(event) // Utiliser backend si dispo, sinon calculer
            }));

            setAllEvents(enrichedEvents);
            setPaginationMeta({ total, totalPages }); // ✅ Stocker les métadonnées de pagination
        } catch (err) {
            console.error('Erreur lors du chargement des événements:', err);
            setAllEvents([]);
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, search, statusFilter, calculateEventStatus]);

    // ✅ Recharger les événements quand les filtres ou la page changent
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    /**
     * ✅ OPTIMISÉ: Les événements sont déjà filtrés et paginés par le backend
     * On retourne directement les données sans traitement supplémentaire
     */
    const filteredAndPaginatedEvents = useMemo(() => {
        return {
            events: allEvents,
            total: paginationMeta.total, // ✅ Utiliser les vraies métadonnées du backend
            totalPages: paginationMeta.totalPages
        };
    }, [allEvents, paginationMeta]);

    /**
     * Navigue vers la page de détails de l'événement
     */
    const handleView = (id: number) => {
        navigate(`/dashboard/admin/events/${id}`);
    };

    /**
     * Retourne le chip de statut avec la bonne couleur
     */
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'UPCOMING':
                return <Chip label="À venir" color="info" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'ONGOING':
                return <Chip label="En cours" sx={{ bgcolor: 'orange', color: 'white', fontWeight: 'bold' }} size="small" />;
            case 'COMPLETED':
                return <Chip label="Terminé" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'CANCELLED':
                return <Chip label="Annulé" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    /**
     * Formate l'affichage des dates (début → fin)
     */
    const formatDateRange = (startDatetime: string, endDatetime: string) => {
        const startDate = new Date(startDatetime);
        const endDate = new Date(endDatetime);

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        const formatTime = (date: Date) => {
            return date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(endDate);
        const startTimeStr = formatTime(startDate);
        const endTimeStr = formatTime(endDate);

        // Si même jour
        if (startDateStr === endDateStr) {
            return `${startDateStr} (${startTimeStr} - ${endTimeStr})`;
        }

        // Si jours différents
        return `${startDateStr} ${startTimeStr} au ${endDateStr} ${endTimeStr}`;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                Modération Événements
            </Typography>

            {/* Filters and Search */}
            <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                placeholder="Rechercher un événement, une église, un créateur..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                label="Rechercher"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Statut</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Statut"
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                >
                                    <MenuItem value="ALL">Tous les statuts</MenuItem>
                                    <MenuItem value="UPCOMING">À venir</MenuItem>
                                    <MenuItem value="ONGOING">En cours</MenuItem>
                                    <MenuItem value="COMPLETED">Terminés</MenuItem>
                                    <MenuItem value="CANCELLED">Annulés</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Tous les événements ({filteredAndPaginatedEvents.total})
                    </Typography>
                    {loading ? (
                        <TableSkeleton rows={itemsPerPage} />
                    ) : (
                        <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Titre</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Dates</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Statut</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Église</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Créateur</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAndPaginatedEvents.events.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">
                                                    Aucun événement trouvé
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAndPaginatedEvents.events.map(ev => (
                                            <TableRow
                                                key={ev.id}
                                                sx={{
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                    cursor: 'pointer',
                                                    // Animation de clignotement pour les événements en cours
                                                    ...(ev.status === 'ONGOING' && {
                                                        animation: 'blink 2s ease-in-out infinite',
                                                        '@keyframes blink': {
                                                            '0%, 100%': {
                                                                bgcolor: 'transparent',
                                                                opacity: 1
                                                            },
                                                            '50%': {
                                                                bgcolor: 'rgba(255, 152, 0, 0.15)',
                                                                opacity: 0.85
                                                            }
                                                        }
                                                    })
                                                }}
                                                onClick={() => handleView(ev.id)}
                                            >
                                                <TableCell sx={{ fontWeight: 'bold', maxWidth: 250 }}>
                                                    {ev.title}
                                                </TableCell>
                                                <TableCell sx={{ minWidth: 180 }}>
                                                    {formatDateRange(ev.start_datetime, ev.end_datetime)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusChip(ev.status || 'UPCOMING')}
                                                </TableCell>
                                                <TableCell sx={{ color: 'info.main', fontWeight: 500 }}>
                                                    {ev.church_name || 'N/A'}
                                                </TableCell>
                                                <TableCell sx={{ color: 'text.secondary' }}>
                                                    {ev.first_name} {ev.last_name}
                                                </TableCell>
                                                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'primary.dark' }
                                                        }}
                                                        onClick={() => handleView(ev.id)}
                                                        title="Voir les détails"
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pagination Controls */}
                    {!loading && filteredAndPaginatedEvents.events.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={filteredAndPaginatedEvents.totalPages}
                            total={filteredAndPaginatedEvents.total}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
