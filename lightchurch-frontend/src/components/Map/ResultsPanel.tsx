import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    Divider,
    Stack,
    IconButton,
    Drawer,
    useMediaQuery,
    useTheme,
    Chip,
    Skeleton,
    InputBase
} from '@mui/material';
import {
    Close as CloseIcon,
    AccountBalance as AccountBalanceIcon,
    Place as PlaceIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Check as CheckIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import useEventInterestWeb from '../../hooks/useEventInterestWeb';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Church, Event } from '../../types/publicMap';
import { formatDistance } from '../../services/publicMapService';

type SortType = 'distance' | 'date';

interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

interface ResultsPanelProps {
    churches: Church[];
    events: Event[];
    loading: boolean;
    onChurchClick: (church: Church) => void;
    onEventClick: (event: Event) => void;
    onClose?: () => void;
    open?: boolean;
    isGeolocated?: boolean;
    isMobileView?: boolean;
    currentBounds?: MapBounds | null;
}

/**
 * Helper function pour obtenir le texte temporel intelligent selon le statut de l'événement
 * Retourne null si aucun texte à afficher
 */
const getSmartTimeDisplay = (
    startDatetime: string | null | undefined,
    endDatetime: string | null | undefined,
    currentTime: Date
): { text: string; color: string } | null => {
    if (!startDatetime) return null;

    try {
        const start = new Date(startDatetime);
        const end = endDatetime ? new Date(endDatetime) : null;

        if (isNaN(start.getTime())) return null;

        const now = currentTime.getTime();
        const startTime = start.getTime();
        const endTime = end ? end.getTime() : null;

        // Événement en cours
        if (now >= startTime && endTime && now <= endTime) {
            const remaining = getRemainingTime(endDatetime);
            if (remaining) {
                return {
                    text: `Se termine dans ${remaining.text}`,
                    color: '#E37400' // Orange
                };
            }
        }

        // Événement futur (tous, sans limite)
        if (now < startTime) {
            const timeText = formatDistanceToNow(start, {
                addSuffix: true,
                locale: fr
            });
            return {
                text: timeText.charAt(0).toUpperCase() + timeText.slice(1),
                color: '#1A73E8' // Bleu
            };
        }

        // Événement passé - ne rien afficher
        return null;

    } catch {
        return null;
    }
};

/**
 * Helper function pour calculer le temps restant jusqu'à la fin d'un événement
 * Retourne un objet avec le texte (sans préfixe) et les minutes totales restantes
 */
const getRemainingTime = (endDatetime: string | null | undefined): { text: string; totalMinutes: number } | null => {
    if (!endDatetime) return null;

    try {
        const end = new Date(endDatetime);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const totalMinutes = Math.floor(diff / (1000 * 60));

        let text = '';
        if (hours > 0) {
            text = `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
        } else if (minutes > 0) {
            text = `${minutes} min`;
        } else {
            text = 'quelques secondes';
        }

        return { text, totalMinutes };
    } catch {
        return null;
    }
};

/**
 * Composant Card pour une église
 */
const ChurchCard: React.FC<{
    church: Church;
    onClick: () => void;
}> = React.memo(({ church, onClick }) => (
    <Box
        sx={{
            py: 2,
            px: 3,
            display: 'flex',
            gap: 2.5,
            borderBottom: '1px solid #E8EAED',
            bgcolor: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
            '&:hover': {
                bgcolor: '#F8F9FA',
                transform: 'translateX(4px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }
        }}
        onClick={onClick}
    >
        {/* Left Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#202124', lineHeight: 1.2, mb: 0.5 }}>
                {church.church_name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#E37400', fontWeight: 500, fontSize: '0.875rem' }}>
                    {church.denomination_name || 'Église'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5F6368', fontSize: '0.875rem' }}>
                    • {church.city}
                </Typography>
            </Stack>

            {/* Metadata */}
            <Typography variant="body2" sx={{ color: '#5F6368', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PlaceIcon sx={{ fontSize: 14 }} />
                {formatDistance(church.distance_km)}
            </Typography>

            {/* Action Chips */}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip
                    label="Itinéraire"
                    size="small"
                    icon={<PlaceIcon style={{ fontSize: 14 }} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${church.latitude},${church.longitude}`, '_blank');
                    }}
                    sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        bgcolor: '#F1F3F4',
                        color: '#3C4043',
                        '&:hover': { bgcolor: '#E8EAED' }
                    }}
                />
            </Stack>
        </Box>

        {/* Right Icon (Church Badge) */}
        <Box
            sx={{
                width: 72,
                height: 72,
                borderRadius: 2,
                bgcolor: '#F8F9FA',
                border: '1px solid #E8EAED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}
        >
            <AccountBalanceIcon sx={{ fontSize: 32, color: '#1A73E8' }} />
        </Box>
    </Box>
));

ChurchCard.displayName = 'ChurchCard';

/**
 * Composant Card pour un événement
 */
const EventCard: React.FC<{
    event: Event;
    onClick: () => void;
}> = React.memo(({ event, onClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Hook web pour gérer la participation (optimistic + localStorage)
    const { isInterested, interestedCount: localInterestedCount, isPending, toggle } = useEventInterestWeb(event.id, false, event.interested_count);

    // Mettre à jour le temps chaque minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const startDate = new Date(event.start_datetime);
    const endDate = event.end_datetime ? new Date(event.end_datetime) : null;
    const isOngoing = endDate && currentTime >= startDate && currentTime <= endDate;
    const isCancelled = !!event.cancelled_at;
    const smartTimeDisplay = getSmartTimeDisplay(event.start_datetime, event.end_datetime, currentTime);

    return (
        <Box
            sx={{
                py: 2,
                px: 3,
                display: 'flex',
                gap: 2.5,
                borderBottom: '1px solid #E8EAED',
                bgcolor: isCancelled ? '#F1F3F4' : (isOngoing ? '#FFF8F0' : '#FFFFFF'),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: '8px',
                mx: 1,
                my: 0.5,
                borderLeft: isCancelled ? '4px solid #EA4335' : (isOngoing ? '4px solid #E37400' : 'none'),
                pl: (isCancelled || isOngoing) ? 2.5 : 3,
                opacity: isCancelled ? 0.8 : 1,
                '&:hover': {
                    bgcolor: isCancelled ? '#E8EAED' : (isOngoing ? '#FFF3E6' : '#F8F9FA'),
                    transform: 'translateX(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
            }}
            onClick={onClick}
        >
            {/* Left Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Badge ANNULÉ */}
                {isCancelled && (
                    <Box sx={{ mb: 1 }}>
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
                        {event.cancellation_reason && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#EA4335', fontStyle: 'italic' }}>
                                "{event.cancellation_reason}"
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Badge EN COURS pour événements en cours (si pas annulé) */}
                {(isOngoing && !isCancelled) && (
                    <Box sx={{ mb: 0.5 }}>
                        <Chip
                            label="EN COURS"
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: '#EA4335',
                                color: '#FFFFFF',
                                letterSpacing: '0.5px',
                                animation: 'pulse 2s ease-in-out infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0.85 }
                                },
                                '& .MuiChip-label': {
                                    px: 1
                                }
                            }}
                        />
                    </Box>
                )}

                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: isCancelled ? '#5F6368' : '#202124', lineHeight: 1.2, mb: 0.5, textDecoration: isCancelled ? 'line-through' : 'none' }}>
                    {event.title}
                </Typography>

                {smartTimeDisplay && (
                    <Typography variant="body2" sx={{ color: smartTimeDisplay.color, fontWeight: 500, fontSize: '0.875rem', mb: 0.5 }}>
                        {smartTimeDisplay.text}
                    </Typography>
                )}

                <Typography variant="body2" sx={{ color: '#5F6368', fontSize: '0.875rem' }}>
                    {event.event_city} • {event.church_name}
                </Typography>

                {/* Metadata */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#5F6368', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlaceIcon sx={{ fontSize: 14 }} /> {formatDistance(event.distance_km)}
                    </Typography>
                    {((localInterestedCount ?? event.interested_count) !== undefined && (localInterestedCount ?? event.interested_count)! > 0) && (
                        <Typography variant="caption" sx={{ color: '#5F6368', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckIcon sx={{ fontSize: 14 }} /> {localInterestedCount ?? event.interested_count} participations
                        </Typography>
                    )}
                </Stack>

                {/* Action Chips */}
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Chip
                        label={isInterested ? "Inscrit" : "Participer"}
                        size="small"
                        icon={isInterested ? <CheckCircleIcon style={{ fontSize: 14 }} /> : undefined}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggle().catch(() => { });
                        }}
                        disabled={isPending}
                        sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            bgcolor: isInterested ? '#E8F0FE' : '#F1F3F4',
                            color: isInterested ? '#1A73E8' : '#3C4043',
                            fontWeight: 500,
                            '&:hover': { bgcolor: isInterested ? '#D2E3FC' : '#E8EAED' }
                        }}
                    />
                </Stack>
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
        </Box>
    );
});

EventCard.displayName = 'EventCard';

/**
 * Panneau de résultats style Google Maps
 * Affiche la liste des églises et événements
 * Responsive: Panel sur desktop, Drawer sur mobile
 */
const ResultsPanel: React.FC<ResultsPanelProps> = React.memo(({
    churches,
    events,
    loading,
    onChurchClick,
    onEventClick,
    onClose,
    open = true,
    currentBounds
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // États pour la recherche et le tri
    const [searchQuery, setSearchQuery] = useState('');
    const [filterChurches, setFilterChurches] = useState(true);
    const [filterEvents, setFilterEvents] = useState(true);
    const [showMyParticipations, setShowMyParticipations] = useState(false);
    const [sortBy, setSortBy] = useState<SortType>('distance');

    // Taille fixe du panneau
    const panelWidth = 400; // Largeur fixe

    // Handlers pour les filtres/tri avec auto-ajustement
    const handleToggleChurches = useCallback(() => {
        setFilterChurches(prev => {
            const newValue = !prev;
            if (newValue && sortBy === 'date') {
                setSortBy('distance');
            }
            return newValue;
        });
    }, [sortBy]);

    const handleToggleEvents = useCallback(() => {
        setFilterEvents(prev => !prev);
    }, []);

    const handleSortChange = useCallback((newSortType: SortType) => {
        setSortBy(newSortType);
        if (newSortType === 'date') {
            setFilterChurches(false);
            setFilterEvents(true);
        }
    }, []);

    const toggleShowMyParticipations = useCallback(() => {
        setShowMyParticipations(prev => !prev);
        // when showing only participations, ensure events filter is active
        setFilterEvents(true);
        setFilterChurches(false);
    }, []);

    // Helper pour vérifier si un point est dans les bounds visibles
    const isInBounds = useCallback((lat: number, lng: number): boolean => {
        if (!currentBounds) return true;
        return (
            lat >= currentBounds.south &&
            lat <= currentBounds.north &&
            lng >= currentBounds.west &&
            lng <= currentBounds.east
        );
    }, [currentBounds]);

    // Filtrer les données par ce qui est visible sur la carte
    const visibleChurches = useMemo(() => {
        return churches.filter(c => isInBounds(c.latitude, c.longitude));
    }, [churches, isInBounds]);

    const visibleEvents = useMemo(() => {
        return events.filter(e => isInBounds(e.latitude, e.longitude));
    }, [events, isInBounds]);

    // Filtrer et trier les données
    const filteredAndSortedData = useMemo(() => {
        const items: Array<{ type: 'church' | 'event'; data: Church | Event }> = [];

        if (filterChurches) {
            visibleChurches.forEach(church => items.push({ type: 'church', data: church }));
        }

        if (filterEvents) {
            visibleEvents.forEach(event => items.push({ type: 'event', data: event }));
        }

        // Filtrage par recherche
        let filteredItems = items;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredItems = items.filter(item => {
                if (item.type === 'church') {
                    const church = item.data as Church;
                    return (
                        church.church_name?.toLowerCase().includes(query) ||
                        church.denomination_name?.toLowerCase().includes(query) ||
                        church.city?.toLowerCase().includes(query) ||
                        church.pastor_name?.toLowerCase().includes(query)
                    );
                } else {
                    const event = item.data as Event;
                    return (
                        event.title?.toLowerCase().includes(query) ||
                        event.church_name?.toLowerCase().includes(query) ||
                        event.event_city?.toLowerCase().includes(query)
                    );
                }
            });
        }

        // Filtrer uniquement les participations locales si demandé
        if (showMyParticipations) {
            let local: Record<string, number> = {};
            try {
                const raw = localStorage.getItem('light_church:interested_events');
                if (raw) local = JSON.parse(raw) as Record<string, number>;
            } catch {
                local = {};
            }

            filteredItems = filteredItems.filter(item => item.type === 'event' && local[String(item.data.id)] !== undefined);
        }

        // Limit for performance - only sort and show top 50
        const top50 = filteredItems.sort((a, b) => {
            if (sortBy === 'distance') {
                const distA = a.data.distance_km ?? Infinity;
                const distB = b.data.distance_km ?? Infinity;
                return distA - distB;
            } else {
                if (a.type === 'event' && b.type === 'event') {
                    const dateA = new Date((a.data as Event).created_at || 0).getTime();
                    const dateB = new Date((b.data as Event).created_at || 0).getTime();
                    return dateB - dateA;
                }
                return a.type === 'event' ? -1 : 1;
            }
        }).slice(0, 50);

        return top50;
    }, [churches, events, filterChurches, filterEvents, searchQuery, sortBy, showMyParticipations]);

    // Calculer le total avant filtre de recherche (basé sur les éléments visibles)
    const totalBeforeSearch = useMemo(() => {
        let count = 0;
        if (filterChurches) count += visibleChurches.length;
        if (filterEvents) count += visibleEvents.length;
        return count;
    }, [visibleChurches.length, visibleEvents.length, filterChurches, filterEvents]);

    const showSearchBar = totalBeforeSearch > 15;

    const content = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF'
            }}
        >
            {/* En-tête */}
            <Box sx={{ p: 2, borderBottom: '1px solid #E8EAED' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: '#202124', fontSize: '1.125rem' }}>
                            {filteredAndSortedData.length} {filteredAndSortedData.length > 1 ? 'résultats' : 'résultat'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5F6368' }}>
                            {filterChurches && filterEvents && 'Églises et événements'}
                            {filterChurches && !filterEvents && 'Églises uniquement'}
                            {!filterChurches && filterEvents && 'Événements uniquement'}
                            {!filterChurches && !filterEvents && 'Aucun filtre sélectionné'}
                        </Typography>
                    </Box>
                    {isMobile && onClose && (
                        <IconButton onClick={onClose} size="small" sx={{ color: '#5F6368' }}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* Barre de recherche (si > 15 résultats) */}
            {showSearchBar && (
                <Box sx={{ p: 2, borderBottom: '1px solid #E8EAED' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#F8F9FA',
                            borderRadius: 1,
                            px: 2,
                            py: 1
                        }}
                    >
                        <SearchIcon sx={{ color: '#5F6368', fontSize: 20, mr: 1 }} />
                        <InputBase
                            placeholder="Filtrer les résultats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, fontSize: '0.875rem', color: '#202124' }}
                        />
                        {searchQuery && (
                            <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.5 }}>
                                <ClearIcon sx={{ fontSize: 18, color: '#5F6368' }} />
                            </IconButton>
                        )}
                    </Box>
                    {searchQuery && (
                        <Typography variant="caption" sx={{ color: '#5F6368', mt: 1, display: 'block' }}>
                            {filteredAndSortedData.length} résultat{filteredAndSortedData.length > 1 ? 's' : ''} trouvé{filteredAndSortedData.length > 1 ? 's' : ''}
                        </Typography>
                    )}
                </Box>
            )}

            {/* Chips de filtres/tri - Google Maps style */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    bgcolor: '#FFFFFF',
                    zIndex: 10,
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    overflowX: isMobile ? 'auto' : 'visible',
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none'
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{
                        px: 2,
                        py: 1,
                        minWidth: isMobile ? 'max-content' : 'auto',
                        flexWrap: isMobile ? 'nowrap' : 'wrap'
                    }}
                >
                    {/* Églises */}
                    <Chip
                        icon={filterChurches ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label={`Églises (${visibleChurches.length})`}
                        onClick={handleToggleChurches}
                        sx={{
                            bgcolor: '#FFFFFF',
                            color: filterChurches ? '#1A73E8' : '#5F6368',
                            borderColor: filterChurches ? '#1A73E8' : '#DADCE0',
                            borderWidth: filterChurches ? 2 : 1,
                            borderStyle: 'solid',
                            fontWeight: filterChurches ? 500 : 400,
                            fontSize: '0.875rem',
                            height: 32,
                            borderRadius: '16px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: '#FAFAFA',
                                borderColor: filterChurches ? '#1A73E8' : '#5F6368'
                            }
                        }}
                    />

                    {/* Événements */}
                    <Chip
                        icon={filterEvents ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label={`Événements (${visibleEvents.length})`}
                        onClick={handleToggleEvents}
                        sx={{
                            bgcolor: '#FFFFFF',
                            color: filterEvents ? '#1A73E8' : '#5F6368',
                            borderColor: filterEvents ? '#1A73E8' : '#DADCE0',
                            borderWidth: filterEvents ? 2 : 1,
                            borderStyle: 'solid',
                            fontWeight: filterEvents ? 500 : 400,
                            fontSize: '0.875rem',
                            height: 32,
                            borderRadius: '16px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: '#FAFAFA',
                                borderColor: filterEvents ? '#1A73E8' : '#5F6368'
                            }
                        }}
                    />

                    {/* Les plus proches */}
                    <Chip
                        icon={sortBy === 'distance' ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label="Les plus proches"
                        onClick={() => handleSortChange('distance')}
                        sx={{
                            bgcolor: '#FFFFFF',
                            color: sortBy === 'distance' ? '#1A73E8' : '#5F6368',
                            borderColor: sortBy === 'distance' ? '#1A73E8' : '#DADCE0',
                            borderWidth: sortBy === 'distance' ? 2 : 1,
                            borderStyle: 'solid',
                            fontWeight: sortBy === 'distance' ? 500 : 400,
                            fontSize: '0.875rem',
                            height: 32,
                            borderRadius: '16px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: '#FAFAFA',
                                borderColor: sortBy === 'distance' ? '#1A73E8' : '#5F6368'
                            }
                        }}
                    />

                    {/* Les plus récents */}
                    <Chip
                        icon={sortBy === 'date' ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label="Les plus récents"
                        onClick={() => handleSortChange('date')}
                        sx={{
                            bgcolor: '#FFFFFF',
                            color: sortBy === 'date' ? '#1A73E8' : '#5F6368',
                            borderColor: sortBy === 'date' ? '#1A73E8' : '#DADCE0',
                            borderWidth: sortBy === 'date' ? 2 : 1,
                            borderStyle: 'solid',
                            fontWeight: sortBy === 'date' ? 500 : 400,
                            fontSize: '0.875rem',
                            height: 32,
                            borderRadius: '16px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: '#FAFAFA',
                                borderColor: sortBy === 'date' ? '#1A73E8' : '#5F6368'
                            }
                        }}
                    />
                </Stack>
            </Box>

            {/* Liste des résultats filtrés et triés */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    // Skeleton loaders
                    <Box sx={{ p: 2 }}>
                        {[1, 2, 3].map(i => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                            </Box>
                        ))}
                    </Box>
                ) : filteredAndSortedData.length === 0 ? (
                    // Aucun résultat
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        {searchQuery ? (
                            <>
                                {/* Mes participations */}
                                <Chip
                                    icon={showMyParticipations ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                                    label="Mes participations"
                                    onClick={toggleShowMyParticipations}
                                    sx={{
                                        bgcolor: '#FFFFFF',
                                        color: showMyParticipations ? '#1A73E8' : '#5F6368',
                                        borderColor: showMyParticipations ? '#1A73E8' : '#DADCE0',
                                        borderWidth: showMyParticipations ? 2 : 1,
                                        borderStyle: 'solid',
                                        fontWeight: showMyParticipations ? 500 : 400,
                                        fontSize: '0.875rem',
                                        height: 32,
                                        borderRadius: '16px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: '#FAFAFA',
                                            borderColor: showMyParticipations ? '#1A73E8' : '#5F6368'
                                        }
                                    }}
                                />
                                <SearchIcon sx={{ fontSize: 64, color: '#DADCE0', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#5F6368', fontWeight: 500, fontSize: '1rem', mb: 1 }}>
                                    Aucun résultat
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#80868B', fontSize: '0.875rem' }}>
                                    Aucun résultat ne correspond à "{searchQuery}"
                                </Typography>
                            </>
                        ) : !filterChurches && !filterEvents ? (
                            <>
                                <Typography variant="h6" sx={{ color: '#5F6368', fontWeight: 500, fontSize: '1rem', mb: 1 }}>
                                    Aucun filtre sélectionné
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#80868B', fontSize: '0.875rem' }}>
                                    Veuillez sélectionner au moins un filtre
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" sx={{ color: '#5F6368', fontWeight: 500, fontSize: '1rem', mb: 1 }}>
                                    Aucun résultat
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#80868B', fontSize: '0.875rem' }}>
                                    Aucun résultat ne correspond à vos filtres
                                </Typography>
                            </>
                        )}
                    </Box>
                ) : (
                    // Liste combinée
                    <List disablePadding>
                        {filteredAndSortedData.map((item, index) => (
                            <React.Fragment key={`${item.type}-${item.data.id}`}>
                                {item.type === 'church' ? (
                                    <ChurchCard
                                        church={item.data as Church}
                                        onClick={() => onChurchClick(item.data as Church)}
                                    />
                                ) : (
                                    <EventCard
                                        event={item.data as Event}
                                        onClick={() => onEventClick(item.data as Event)}
                                    />
                                )}
                                {index < filteredAndSortedData.length - 1 && <Divider sx={{ borderColor: '#E8EAED' }} />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );

    // Sur mobile: Drawer en bas
    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        height: '90vh',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
                    }
                }}
            >
                {/* Handle indicateur */}
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        bgcolor: '#FFFFFF',
                        zIndex: 100,
                        pt: 2,
                        pb: 1,
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            backgroundColor: '#DADCE0',
                            borderRadius: 2
                        }}
                    />
                </Box>
                {content}
            </Drawer>
        );
    }

    // Sur desktop: Panel fixe à gauche
    return (
        <Paper
            elevation={0}
            sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bottom: 16,
                width: panelWidth,
                zIndex: 1000,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8EAED',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
        >
            {content}
        </Paper>
    );
});

ResultsPanel.displayName = 'ResultsPanel';

export default ResultsPanel;
