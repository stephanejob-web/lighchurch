import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    Divider,
    Stack,
    IconButton,
    useMediaQuery,
    useTheme,
    Chip,
    Skeleton,
    InputBase,
    CircularProgress
} from '@mui/material';
import { Drawer as VaulDrawer } from 'vaul';
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
import { formatDistance, fetchChurchesPaginated, fetchEventsPaginated } from '../../services/publicMapService';

interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

interface UserLocation {
    latitude: number;
    longitude: number;
}

interface ResultsPanelProps {
    onChurchClick: (church: Church) => void;
    onEventClick: (event: Event) => void;
    onClose?: () => void;
    open?: boolean;
    isGeolocated?: boolean;
    isMobileView?: boolean;
    currentBounds?: MapBounds | null;
    userLocation?: UserLocation | null;
    embedded?: boolean;
}

const PAGE_SIZE = 20;

/**
 * Helper function pour obtenir le texte temporel intelligent
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

        if (now >= startTime && endTime && now <= endTime) {
            const remaining = getRemainingTime(endDatetime);
            if (remaining) {
                return { text: `Se termine dans ${remaining.text}`, color: '#34A853' };
            }
        }

        if (now < startTime) {
            const timeText = formatDistanceToNow(start, { addSuffix: true, locale: fr });
            return { text: timeText.charAt(0).toUpperCase() + timeText.slice(1), color: '#1A73E8' };
        }

        return null;
    } catch {
        return null;
    }
};

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
 * Card pour une église
 */
const ChurchCard: React.FC<{ church: Church; onClick: () => void }> = React.memo(({ church, onClick }) => (
    <Box
        sx={{
            py: 2, px: 3, display: 'flex', gap: 2.5,
            borderBottom: '1px solid #E8EAED', bgcolor: '#FFFFFF',
            cursor: 'pointer', transition: 'all 0.2s ease',
            borderRadius: '8px', mx: 1, my: 0.5,
            '&:hover': { bgcolor: '#F8F9FA', transform: 'translateX(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
        }}
        onClick={onClick}
    >
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
            <Typography variant="body2" sx={{ color: '#5F6368', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PlaceIcon sx={{ fontSize: 14 }} />
                {formatDistance(church.distance_km)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip
                    label="Itinéraire" size="small" icon={<PlaceIcon style={{ fontSize: 14 }} />}
                    onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${church.latitude},${church.longitude}`, '_blank'); }}
                    sx={{ height: 24, fontSize: '0.75rem', bgcolor: '#F1F3F4', color: '#3C4043', '&:hover': { bgcolor: '#E8EAED' } }}
                />
            </Stack>
        </Box>
        <Box sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: '#F8F9FA', border: '1px solid #E8EAED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AccountBalanceIcon sx={{ fontSize: 32, color: '#1A73E8' }} />
        </Box>
    </Box>
));
ChurchCard.displayName = 'ChurchCard';

/**
 * Card pour un événement
 */
const EventCard: React.FC<{ event: Event; onClick: () => void }> = React.memo(({ event, onClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { isInterested, interestedCount: localInterestedCount, isPending, toggle } = useEventInterestWeb(event.id, false, event.interested_count);

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
                py: 2, px: 3, display: 'flex', gap: 2.5,
                borderBottom: '1px solid #E8EAED',
                bgcolor: isCancelled ? '#F1F3F4' : (isOngoing ? '#E8F5E9' : '#FFFFFF'),
                cursor: 'pointer', transition: 'all 0.2s ease',
                borderRadius: '8px', mx: 1, my: 0.5,
                borderLeft: isCancelled ? '4px solid #EA4335' : (isOngoing ? '4px solid #34A853' : 'none'),
                pl: (isCancelled || isOngoing) ? 2.5 : 3,
                opacity: isCancelled ? 0.8 : 1,
                '&:hover': { bgcolor: isCancelled ? '#E8EAED' : (isOngoing ? '#C8E6C9' : '#F8F9FA'), transform: 'translateX(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
            }}
            onClick={onClick}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {isCancelled && (
                    <Box sx={{ mb: 1 }}>
                        <Chip label="ANNULÉ" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#EA4335', color: '#FFFFFF', letterSpacing: '0.5px' }} />
                        {event.cancellation_reason && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#EA4335', fontStyle: 'italic' }}>
                                "{event.cancellation_reason}"
                            </Typography>
                        )}
                    </Box>
                )}
                {(isOngoing && !isCancelled) && (
                    <Box sx={{ mb: 1 }}>
                        <Chip label="EN COURS" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#34A853', color: '#FFFFFF', letterSpacing: '0.5px' }} />
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
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Chip
                        label={isInterested ? "Inscrit" : "Participer"} size="small"
                        icon={isInterested ? <CheckCircleIcon style={{ fontSize: 14 }} /> : undefined}
                        onClick={(e) => { e.stopPropagation(); toggle().catch(() => { }); }}
                        disabled={isPending}
                        sx={{ height: 24, fontSize: '0.75rem', bgcolor: isInterested ? '#E8F0FE' : '#F1F3F4', color: isInterested ? '#1A73E8' : '#3C4043', fontWeight: 500, '&:hover': { bgcolor: isInterested ? '#D2E3FC' : '#E8EAED' } }}
                    />
                </Stack>
            </Box>
            <Paper elevation={0} sx={{ width: 72, height: 72, borderRadius: 2, border: '1px solid #DADCE0', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden', flexShrink: 0 }}>
                <Box sx={{ width: '100%', height: 22, bgcolor: '#EA4335', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px', lineHeight: 1 }}>
                        {startDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pb: 0.5 }}>
                    <Typography variant="h5" sx={{ color: '#202124', fontWeight: 400, fontSize: '1.5rem', lineHeight: 1, mt: 0.5 }}>
                        {startDate.getDate()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#EA4335', fontSize: '0.65rem', fontWeight: 500, mt: 0.25 }}>
                        {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
});
EventCard.displayName = 'EventCard';

/**
 * ResultsPanel avec pagination serveur
 */
const ResultsPanel: React.FC<ResultsPanelProps> = React.memo(({
    onChurchClick,
    onEventClick,
    onClose,
    open = true,
    currentBounds,
    userLocation,
    embedded
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // États pour les filtres
    const [searchQuery, setSearchQuery] = useState('');
    const [filterChurches, setFilterChurches] = useState(true);
    const [filterEvents, setFilterEvents] = useState(true);

    // États pour la pagination serveur
    const [churches, setChurches] = useState<Church[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [churchOffset, setChurchOffset] = useState(0);
    const [eventOffset, setEventOffset] = useState(0);
    const [hasMoreChurches, setHasMoreChurches] = useState(true);
    const [hasMoreEvents, setHasMoreEvents] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const loaderRef = useRef<HTMLDivElement>(null);
    const boundsRef = useRef<MapBounds | null>(null);
    const panelWidth = 400;

    // Debounce pour éviter trop de requêtes
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch initial quand les bounds changent
    useEffect(() => {
        if (!currentBounds) return;

        // Vérifier si les bounds ont vraiment changé de manière significative
        const prevBounds = boundsRef.current;
        if (prevBounds) {
            const threshold = 0.01; // ~1km
            const changed = Math.abs(prevBounds.north - currentBounds.north) > threshold ||
                           Math.abs(prevBounds.south - currentBounds.south) > threshold ||
                           Math.abs(prevBounds.east - currentBounds.east) > threshold ||
                           Math.abs(prevBounds.west - currentBounds.west) > threshold;
            if (!changed) return;
        }

        boundsRef.current = currentBounds;

        // Debounce la requête
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        fetchTimeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
            setChurches([]);
            setEvents([]);
            setChurchOffset(0);
            setEventOffset(0);
            setHasMoreChurches(true);
            setHasMoreEvents(true);
            setInitialLoadDone(false);

            try {
                // Inclure les coordonnées utilisateur pour le calcul de distance
                const userParams = userLocation ? { userLat: userLocation.latitude, userLng: userLocation.longitude } : {};

                const [churchResult, eventResult] = await Promise.all([
                    filterChurches ? fetchChurchesPaginated({ ...currentBounds, ...userParams, limit: PAGE_SIZE, offset: 0 }) : Promise.resolve({ data: [], hasMore: false }),
                    filterEvents ? fetchEventsPaginated({ ...currentBounds, ...userParams, limit: PAGE_SIZE, offset: 0 }) : Promise.resolve({ data: [], hasMore: false })
                ]);

                setChurches(churchResult.data);
                setEvents(eventResult.data);
                setChurchOffset(PAGE_SIZE);
                setEventOffset(PAGE_SIZE);
                setHasMoreChurches(churchResult.hasMore);
                setHasMoreEvents(eventResult.hasMore);
                setInitialLoadDone(true);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [currentBounds, filterChurches, filterEvents, userLocation]);

    // Charger plus de données au scroll
    const loadMore = useCallback(async () => {
        if (!currentBounds || isLoadingMore) return;
        if (!hasMoreChurches && !hasMoreEvents) return;

        setIsLoadingMore(true);

        // Inclure les coordonnées utilisateur pour le calcul de distance
        const userParams = userLocation ? { userLat: userLocation.latitude, userLng: userLocation.longitude } : {};

        try {
            const promises: Promise<any>[] = [];

            if (filterChurches && hasMoreChurches) {
                promises.push(fetchChurchesPaginated({ ...currentBounds, ...userParams, limit: PAGE_SIZE, offset: churchOffset }));
            } else {
                promises.push(Promise.resolve(null));
            }

            if (filterEvents && hasMoreEvents) {
                promises.push(fetchEventsPaginated({ ...currentBounds, ...userParams, limit: PAGE_SIZE, offset: eventOffset }));
            } else {
                promises.push(Promise.resolve(null));
            }

            const [churchResult, eventResult] = await Promise.all(promises);

            if (churchResult) {
                setChurches(prev => [...prev, ...churchResult.data]);
                setChurchOffset(prev => prev + PAGE_SIZE);
                setHasMoreChurches(churchResult.hasMore);
            }

            if (eventResult) {
                setEvents(prev => [...prev, ...eventResult.data]);
                setEventOffset(prev => prev + PAGE_SIZE);
                setHasMoreEvents(eventResult.hasMore);
            }
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentBounds, churchOffset, eventOffset, hasMoreChurches, hasMoreEvents, filterChurches, filterEvents, isLoadingMore, userLocation]);

    // Intersection Observer pour le scroll infini
    useEffect(() => {
        const loader = loaderRef.current;
        if (!loader || !initialLoadDone) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loader);
        return () => observer.disconnect();
    }, [loadMore, isLoadingMore, initialLoadDone]);

    // Handlers pour les filtres
    const handleToggleChurches = useCallback(() => {
        setFilterChurches(prev => !prev);
    }, []);

    const handleToggleEvents = useCallback(() => {
        setFilterEvents(prev => !prev);
    }, []);

    // Combiner et filtrer les données
    const filteredAndSortedData = useMemo(() => {
        const items: Array<{ type: 'church' | 'event'; data: Church | Event }> = [];

        if (filterChurches) {
            churches.forEach(church => items.push({ type: 'church', data: church }));
        }
        if (filterEvents) {
            events.forEach(event => items.push({ type: 'event', data: event }));
        }

        // Filtrage par recherche locale
        let filteredItems = items;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredItems = items.filter(item => {
                if (item.type === 'church') {
                    const church = item.data as Church;
                    return church.church_name?.toLowerCase().includes(query) ||
                           church.denomination_name?.toLowerCase().includes(query) ||
                           church.city?.toLowerCase().includes(query);
                } else {
                    const event = item.data as Event;
                    return event.title?.toLowerCase().includes(query) ||
                           event.church_name?.toLowerCase().includes(query) ||
                           event.event_city?.toLowerCase().includes(query);
                }
            });
        }

        // Tri intelligent automatique :
        // - Événements : par date (du plus proche au plus éloigné)
        // - Églises : par distance
        // - Si les deux : événements d'abord (par date), puis églises (par distance)
        return filteredItems.sort((a, b) => {
            // Si types différents : événements en premier
            if (a.type !== b.type) {
                return a.type === 'event' ? -1 : 1;
            }

            // Même type : tri spécifique
            if (a.type === 'event') {
                // Événements : par date croissante (prochains en premier)
                return new Date((a.data as Event).start_datetime).getTime() - new Date((b.data as Event).start_datetime).getTime();
            } else {
                // Églises : par distance croissante (plus proches en premier)
                return (a.data.distance_km ?? Infinity) - (b.data.distance_km ?? Infinity);
            }
        });
    }, [churches, events, filterChurches, filterEvents, searchQuery]);

    const hasMore = (filterChurches && hasMoreChurches) || (filterEvents && hasMoreEvents);
    const totalCount = filteredAndSortedData.length;
    // Afficher la barre de recherche si le nombre total (avant filtrage) > 15
    const totalBeforeFilter = churches.length + events.length;
    const showSearchBar = totalBeforeFilter > 15 || searchQuery.length > 0;

    const content = (
        <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
            {/* En-tête */}
            <Box sx={{ p: 2, borderBottom: '1px solid #E8EAED' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: '#202124', fontSize: '1.125rem' }}>
                            {totalCount} {totalCount > 1 ? 'résultats' : 'résultat'}
                            {hasMore && '+'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5F6368' }}>
                            {filterChurches && filterEvents && 'Églises et événements'}
                            {filterChurches && !filterEvents && 'Églises uniquement'}
                            {!filterChurches && filterEvents && 'Événements uniquement'}
                        </Typography>
                    </Box>
                    {isMobile && onClose && (
                        <IconButton onClick={onClose} size="small" sx={{ color: '#5F6368' }}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* Barre de recherche */}
            {showSearchBar && (
                <Box sx={{ p: 2, borderBottom: '1px solid #E8EAED' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F8F9FA', borderRadius: 1, px: 2, py: 1 }}>
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
                </Box>
            )}

            {/* Filtres */}
            <Box sx={{ position: 'sticky', top: 0, bgcolor: '#FFFFFF', zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ px: 2, py: 1, flexWrap: 'wrap' }}>
                    <Chip
                        icon={filterChurches ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label={`Églises (${churches.length}${hasMoreChurches ? '+' : ''})`}
                        onClick={handleToggleChurches}
                        sx={{
                            bgcolor: '#FFFFFF', color: filterChurches ? '#1A73E8' : '#5F6368',
                            borderColor: filterChurches ? '#1A73E8' : '#DADCE0',
                            borderWidth: filterChurches ? 2 : 1, borderStyle: 'solid',
                            fontWeight: filterChurches ? 500 : 400, fontSize: '0.875rem', height: 32, borderRadius: '16px'
                        }}
                    />
                    <Chip
                        icon={filterEvents ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label={`Événements (${events.length}${hasMoreEvents ? '+' : ''})`}
                        onClick={handleToggleEvents}
                        sx={{
                            bgcolor: '#FFFFFF', color: filterEvents ? '#1A73E8' : '#5F6368',
                            borderColor: filterEvents ? '#1A73E8' : '#DADCE0',
                            borderWidth: filterEvents ? 2 : 1, borderStyle: 'solid',
                            fontWeight: filterEvents ? 500 : 400, fontSize: '0.875rem', height: 32, borderRadius: '16px'
                        }}
                    />
                </Stack>
            </Box>

            {/* Liste */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {isLoading ? (
                    <Box sx={{ p: 2 }}>
                        {[1, 2, 3].map(i => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                            </Box>
                        ))}
                    </Box>
                ) : filteredAndSortedData.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <SearchIcon sx={{ fontSize: 64, color: '#DADCE0', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#5F6368', fontWeight: 500, fontSize: '1rem', mb: 1 }}>
                            Aucun résultat
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#80868B', fontSize: '0.875rem' }}>
                            Déplacez la carte pour voir d'autres résultats
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {filteredAndSortedData.map((item, index) => (
                            <React.Fragment key={`${item.type}-${item.data.id}`}>
                                {item.type === 'church' ? (
                                    <ChurchCard church={item.data as Church} onClick={() => onChurchClick(item.data as Church)} />
                                ) : (
                                    <EventCard event={item.data as Event} onClick={() => onEventClick(item.data as Event)} />
                                )}
                                {index < filteredAndSortedData.length - 1 && <Divider sx={{ borderColor: '#E8EAED' }} />}
                            </React.Fragment>
                        ))}

                        {/* Loader pour pagination */}
                        {hasMore && (
                            <Box ref={loaderRef} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, gap: 1 }}>
                                <CircularProgress size={24} sx={{ color: '#1A73E8' }} />
                                <Typography variant="caption" sx={{ color: '#5F6368' }}>
                                    Chargement...
                                </Typography>
                            </Box>
                        )}

                        {/* Fin de liste */}
                        {!hasMore && totalCount > 0 && (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="caption" sx={{ color: '#80868B' }}>
                                    Fin des résultats ({totalCount} éléments)
                                </Typography>
                            </Box>
                        )}
                    </List>
                )}
            </Box>
        </Box>
    );

    if (isMobile) {
        return (
            <VaulDrawer.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
                <VaulDrawer.Portal>
                    <VaulDrawer.Overlay
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            zIndex: 1200,
                        }}
                    />
                    <VaulDrawer.Content
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '90vh',
                            backgroundColor: '#FFFFFF',
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            zIndex: 1201,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        aria-describedby={undefined}
                    >
                        {/* Accessibility: Hidden title for screen readers */}
                        <VaulDrawer.Title style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
                            Résultats de recherche
                        </VaulDrawer.Title>
                        {/* Handle pour le swipe */}
                        <Box
                            sx={{
                                pt: 2,
                                pb: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                cursor: 'grab',
                                flexShrink: 0,
                            }}
                        >
                            <Box sx={{ width: 40, height: 5, bgcolor: '#DADCE0', borderRadius: 2.5 }} />
                        </Box>
                        <Box sx={{ overflowY: 'auto', flex: 1 }}>
                            {content}
                        </Box>
                    </VaulDrawer.Content>
                </VaulDrawer.Portal>
            </VaulDrawer.Root>
        );
    }

    if (embedded) {
        return content;
    }

    return (
        <Paper elevation={0} sx={{ position: 'absolute', top: 16, left: 16, bottom: 16, width: panelWidth, zIndex: 1000, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', border: '1px solid #E8EAED', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {content}
        </Paper>
    );
});

ResultsPanel.displayName = 'ResultsPanel';

export default ResultsPanel;
