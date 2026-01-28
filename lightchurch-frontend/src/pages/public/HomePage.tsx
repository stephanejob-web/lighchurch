import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Paper,
    useMediaQuery,
    useTheme,
    LinearProgress,
    Badge,
    Alert,
    Snackbar,
    Tooltip,
    Button,
} from '@mui/material';
import {
    MyLocation as MyLocationIcon,
    Layers,
    Event as EventIcon,
    Home as HomeIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Tooltip as LeafletTooltip } from 'react-leaflet';
import { useSupercluster } from '../../hooks/useSupercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet.css';
import type { Church, Event, UserLocation } from '../../types/publicMap';
import {
    fetchChurchesAndEventsMarkers,
    getUserLocation,
} from '../../services/publicMapService';

// New UI Components
import SearchPanel from '../../components/ui/SearchPanel';
import DetailDrawer from '../../components/ui/DetailDrawer';
import ResultsPanel from '../../components/Map/ResultsPanel';
import Sidebar from '../../components/Map/Sidebar';
import MyParticipationsSidebar from '../../components/Map/MyParticipationsSidebar';

// Fix Leaflet default icon (Same as before)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// OPTIMIZATION: Load all data at once
const FETCH_LIMIT = 15000;

// MapCenter Component (Same as before)
interface MapCenterProps {
    center: [number, number];
    zoom?: number;
}
const MapCenter: React.FC<MapCenterProps> = React.memo(({ center, zoom = 2 }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
});
MapCenter.displayName = 'MapCenter';

// MapEventsHandler Component - tracks bounds and zoom
interface MapEventsHandlerProps {
    onBoundsChange: (bounds: L.LatLngBounds, zoom: number) => void;
}
const MapEventsHandler: React.FC<MapEventsHandlerProps> = React.memo(({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => onBoundsChange(map.getBounds(), map.getZoom()),
        zoomend: () => onBoundsChange(map.getBounds(), map.getZoom())
    });
    return null;
});
MapEventsHandler.displayName = 'MapEventsHandler';

// ZoomControls Component - Custom zoom buttons
interface ZoomControlsProps {
    isMobile: boolean;
}
const ZoomControls: React.FC<ZoomControlsProps> = ({ isMobile }) => {
    const map = useMap();

    const handleZoomIn = () => {
        map.zoomIn();
    };

    const handleZoomOut = () => {
        map.zoomOut();
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 24,
                // Sur mobile: à gauche, sur desktop: après le sidebar (440px)
                left: isMobile ? 24 : 440,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 2,
            }}
        >
            <Tooltip title="Zoom avant" placement="right" arrow>
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderBottom: '1px solid #E0E0E0',
                        borderRadius: 0,
                        '&:hover': { bgcolor: '#F1F3F4' }
                    }}
                    onClick={handleZoomIn}
                >
                    <AddIcon sx={{ color: '#666' }} />
                </Paper>
            </Tooltip>
            <Tooltip title="Zoom arrière" placement="right" arrow>
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: 0,
                        '&:hover': { bgcolor: '#F1F3F4' }
                    }}
                    onClick={handleZoomOut}
                >
                    <RemoveIcon sx={{ color: '#666' }} />
                </Paper>
            </Tooltip>
        </Box>
    );
};

// Icons (Same as before)
const createChurchIcon = () => L.divIcon({
    className: 'custom-marker-church',
    html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4" stroke="white" stroke-width="2"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

const createEventIcon = () => L.divIcon({
    className: 'custom-marker-event',
    html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#EA4335" stroke="white" stroke-width="2"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm7 5h5v5h-5z"/></svg>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

const createSelectedChurchIcon = () => L.divIcon({
    className: 'custom-marker-church-selected marker-bounce',
    html: '<svg width="48" height="48" viewBox="0 0 24 24" fill="#FBBC04" stroke="white" stroke-width="2" style="filter: drop-shadow(0 0 8px rgba(0,0,0,0.5));"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
});

const createSelectedEventIcon = () => L.divIcon({
    className: 'custom-marker-event-selected marker-bounce',
    html: '<svg width="48" height="48" viewBox="0 0 24 24" fill="#FBBC04" stroke="white" stroke-width="2" style="filter: drop-shadow(0 0 8px rgba(0,0,0,0.5));"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm7 5h5v5h-5z"/></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
});

const createParticipatingEventIcon = () => L.divIcon({
    className: 'custom-marker-event-participating',
    html: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#34A853" stroke="white" stroke-width="2"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 12l-4-4 1.4-1.4L10 12.2l6.6-6.6L18 7l-8 8z"/></svg>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

const createParticipatingEventSelectedIcon = () => L.divIcon({
    className: 'custom-marker-event-participating-selected marker-bounce',
    html: '<svg width="48" height="48" viewBox="0 0 24 24" fill="#34A853" stroke="white" stroke-width="2" style="filter: drop-shadow(0 0 8px rgba(0,0,0,0.35));"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 12l-4-4 1.4-1.4L10 12.2l6.6-6.6L18 7l-8 8z"/></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
});

const userIconInstance = L.divIcon({
    className: 'custom-marker-user-static',
    html: `
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle class="pulse-circle" cx="10" cy="10" r="8" fill="rgba(66, 133, 244, 0.3)"/>
            <circle cx="10" cy="10" r="5" fill="#4285F4" stroke="white" stroke-width="2"/>
        </svg>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
});

// OPTIMIZED: Cluster icons with caching for maximum performance
const churchClusterIconCache = new Map<string, L.DivIcon>();
const eventClusterIconCache = new Map<string, L.DivIcon>();

const getClusterSize = (count: number): number => {
    // Discrete sizes for better caching (fewer unique icons)
    if (count < 10) return 32;
    if (count < 50) return 36;
    if (count < 100) return 40;
    if (count < 500) return 46;
    if (count < 1000) return 52;
    return 58;
};

const formatCount = (count: number): string => {
    if (count >= 10000) return Math.round(count / 1000) + 'k';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
};

const createChurchClusterIcon = (count: number): L.DivIcon => {
    const size = getClusterSize(count);
    const cacheKey = `${size}-${formatCount(count)}`;

    if (churchClusterIconCache.has(cacheKey)) {
        return churchClusterIconCache.get(cacheKey)!;
    }

    const icon = L.divIcon({
        className: 'cluster-church',
        html: `<div class="cluster-icon" style="width:${size}px;height:${size}px;background:#4285F4;border-radius:50%;border:2px solid #fff;color:#fff;font:bold 12px Arial;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3)">${formatCount(count)}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });

    churchClusterIconCache.set(cacheKey, icon);
    return icon;
};

const createEventClusterIcon = (count: number): L.DivIcon => {
    const size = getClusterSize(count);
    const cacheKey = `${size}-${formatCount(count)}`;

    if (eventClusterIconCache.has(cacheKey)) {
        return eventClusterIconCache.get(cacheKey)!;
    }

    const icon = L.divIcon({
        className: 'cluster-event',
        html: `<div class="cluster-icon" style="width:${size}px;height:${size}px;background:#EA4335;border-radius:50%;border:2px solid #fff;color:#fff;font:bold 12px Arial;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3)">${formatCount(count)}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });

    eventClusterIconCache.set(cacheKey, icon);
    return icon;
};

interface HomePageProps {
    viewMode?: 'explore' | 'participations';
}

const HomePage: React.FC<HomePageProps> = ({ viewMode = 'explore' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    // States
    const [churches, setChurches] = useState<Church[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]);
    const [mapZoom, setMapZoom] = useState<number>(6);
    const [loading, setLoading] = useState(true);
    const [slowLoading, setSlowLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [_isMapReady, setIsMapReady] = useState(false);
    const [showGeoAlert, setShowGeoAlert] = useState(false);

    // UI States
    const [showChurches, setShowChurches] = useState(true);
    const [showEvents, setShowEvents] = useState(true);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<'church' | 'event' | null>(null);

    // Map Type
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('satellite');

    // Supercluster state for performance
    const [currentZoom, setCurrentZoom] = useState<number>(6);
    const [currentBounds, setCurrentBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

    // Refs
    const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // const isFirstLoadRef = useRef(true); // Removed as unused
    // const abortControllerRef = useRef<AbortController | null>(null); // No longer needed for single load

    // Smart markers: Filter out churches that have events at the same location
    const filteredChurches = useMemo(() => {
        if (!showEvents || events.length === 0) {
            return churches;
        }

        // Create a Set of event coordinates for fast lookup
        const eventCoordinates = new Set(
            events
                .filter(e => e.latitude != null && e.longitude != null)
                .map(event => `${Number(event.latitude).toFixed(6)},${Number(event.longitude).toFixed(6)}`)
        );

        // Filter out churches that have an event at the same location
        return churches.filter(church => {
            if (church.latitude == null || church.longitude == null) return false;
            const churchCoord = `${Number(church.latitude).toFixed(6)},${Number(church.longitude).toFixed(6)}`;
            return !eventCoordinates.has(churchCoord);
        });
    }, [churches, events, showEvents]);

    // Supercluster for ultra-fast clustering (using optimized defaults)
    const { churchClusters, eventClusters, getClusterExpansionZoom } = useSupercluster(
        showChurches ? filteredChurches : [],
        showEvents ? events : [],
        currentBounds,
        currentZoom
    );

    // Initialization (Geo) - Optional, falls back to France center
    // Initialization (Geo & Data)
    useEffect(() => {
        const initializeMap = async () => {
            setLoading(true);
            try {
                // 1. Get User Location (Parallel with data fetch if possible, but location centers map)
                const position = await getUserLocation();
                
                if (position) {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                    setMapCenter([latitude, longitude]);
                    setMapZoom(13);
                } else {
                    console.log('Geolocation not available, centering on France');
                    setMapCenter([46.603354, 1.888334]); 
                    setMapZoom(6);
                    setShowGeoAlert(true);
                }

                // 2. LOAD ALL DATA AT ONCE (Optimization for < 20k items)
                // We fetch everything regardless of bounds
                const data = await fetchChurchesAndEventsMarkers({
                    limit: FETCH_LIMIT
                });
                
                // Filter out any invalid data to prevent crashes
                const validChurches = (data.churches || []).filter(c => c && typeof c.latitude === 'number' && typeof c.longitude === 'number');
                const validEvents = (data.events || []).filter(e => e && typeof e.latitude === 'number' && typeof e.longitude === 'number');

                setChurches(validChurches);
                setEvents(validEvents);

            } catch (err: any) {
                console.error('Error initializing map:', err);
                setError('Impossible de charger les données. Vérifiez votre connexion.');
                // Fallback center if location failed
                if (!userLocation) {
                    setMapCenter([46.603354, 1.888334]);
                    setMapZoom(6);
                }
            } finally {
                setLoading(false);
                setTimeout(() => setIsMapReady(true), 500);
            }
        };
        initializeMap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debug logging


    // Cleanup
    useEffect(() => {
        return () => {
            // if (abortControllerRef.current) abortControllerRef.current.abort(); // Removed
            if (boundsChangeTimeoutRef.current) clearTimeout(boundsChangeTimeoutRef.current);
        };
    }, []);

    // Show slow loading message after 3 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setTimeout(() => {
                setSlowLoading(true);
            }, 3000);
        } else {
            setSlowLoading(false);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [loading]);

    // Focus event handler: center map and open detail drawer when requested
    useEffect(() => {
        let mounted = true;

        const doFocusEvent = async (eventId: number) => {
            try {
                const { fetchEventDetails } = await import('../../services/publicMapService');
                const details = await fetchEventDetails(Number(eventId));
                if (!mounted || !details) return;
                setSelectedItem(details);
                setSelectedType('event');
                setDetailDrawerOpen(true);
                if (details.latitude && details.longitude) {
                    setMapCenter([details.latitude, details.longitude]);
                    setMapZoom(16);
                }
            } catch (e) {
                console.error('Focus event failed', e);
            }
        };

        const doFocusChurch = async (churchId: number) => {
            try {
                const { fetchChurchDetails } = await import('../../services/publicMapService');
                const details = await fetchChurchDetails(Number(churchId));
                if (!mounted || !details) return;
                setSelectedItem(details);
                setSelectedType('church');
                setDetailDrawerOpen(true);
                if (details.latitude && details.longitude) {
                    setMapCenter([details.latitude, details.longitude]);
                    setMapZoom(16);
                }
            } catch (e) {
                console.error('Focus church failed', e);
            }
        };

        const handler = (e: any) => {
            const id = e?.detail?.eventId;
            if (id) doFocusEvent(Number(id));
        };

        window.addEventListener('light_church:focus_event', handler as EventListener);

        // If URL has focusEvent param (e.g., /map?focusEvent=123), handle it
        // If URL has church_id param (e.g., /map?church_id=123), handle it
        try {
            const params = new URLSearchParams(window.location.search);
            const focusEventId = params.get('focusEvent');
            const churchId = params.get('church_id');

            if (focusEventId) {
                // remove param from URL
                const url = new URL(window.location.href);
                params.delete('focusEvent');
                url.search = params.toString();
                window.history.replaceState({}, '', url.toString());
                doFocusEvent(Number(focusEventId));
            } else if (churchId) {
                // remove param from URL
                const url = new URL(window.location.href);
                params.delete('church_id');
                url.search = params.toString();
                window.history.replaceState({}, '', url.toString());
                doFocusChurch(Number(churchId));
            }
        } catch (e) { /* ignore */ }

        return () => { mounted = false; window.removeEventListener('light_church:focus_event', handler as EventListener); };
    }, []);

    // Load Data - REMOVED (Replaced by load-all in mount effect)
    /* 
    const loadDataForBounds = useCallback(async (bounds: L.LatLngBounds) => {
        ... removed code ...
    }, [userLocation, isMobile]);
    */

    // Bounds Change Handler - Only updates Supercluster state now
    const handleBoundsChange = useCallback((bounds: L.LatLngBounds, zoom: number) => {
        // Update supercluster state immediately for smooth clustering
        setCurrentZoom(zoom);
        setCurrentBounds({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        });
        
        // No network request triggers here anymore!
    }, []);

    // Interactions
    const handleRecenterMap = useCallback(() => {
        if (userLocation) {
            setMapCenter([userLocation.latitude, userLocation.longitude]);
            setMapZoom(13);
        }
    }, [userLocation]);

    const handleSearch = (_query: string) => {
        // Implement search logic here, potentially calling separate search API
        // console.log('Searching for:', query);
    };

    const handleFilterChange = (filters: { churches: boolean; events: boolean }) => {
        setShowChurches(filters.churches);
        setShowEvents(filters.events);
    };

    const handleMarkerClick = async (item: any, type: 'church' | 'event') => {
        setSelectedItem(null); // Clear previous item
        setSelectedType(type);
        setDetailDrawerOpen(true);
        setDetailDrawerOpen(true);
        setMapCenter([item.latitude, item.longitude]);
        setMapZoom(16); // Focus close on the selected item

        // Fetch full details
        try {
            // Temporarily use local state for loading in Drawer if needed, 
            // but we can pass a loading prop to drawer. 
            // For now, let's just use the selectedItem as 'loading' state implies null/skeleton
            let details;
            if (type === 'church') {
                // Import these dynamically or ensure they are imported at top
                const { fetchChurchDetails } = await import('../../services/publicMapService');
                details = await fetchChurchDetails(item.id);
            } else {
                const { fetchEventDetails } = await import('../../services/publicMapService');
                details = await fetchEventDetails(item.id);
            }
            setSelectedItem(details);
        } catch (err) {
            console.error('Error fetching details:', err);
            // Optionally handle error in UI
        }
    };

    const handleCloseDrawer = () => {
        setDetailDrawerOpen(false);
        setSelectedItem(null);
        handleRecenterMap();
    };

    const churchIcon = useMemo(() => createChurchIcon(), []);
    const eventIcon = useMemo(() => createEventIcon(), []);
    const selectedChurchIcon = useMemo(() => createSelectedChurchIcon(), []);
    const selectedEventIcon = useMemo(() => createSelectedEventIcon(), []);
    const participatingEventIcon = useMemo(() => createParticipatingEventIcon(), []);
    const participatingEventSelectedIcon = useMemo(() => createParticipatingEventSelectedIcon(), []);

    // Local participations: keep as state and listen to updates so UI updates without full refresh
    const [localParticipations, setLocalParticipations] = useState<Set<number>>(() => {
        try {
            const raw = localStorage.getItem('light_church:interested_events');
            if (!raw) return new Set<number>();
            const obj = JSON.parse(raw) as Record<string, number>;
            return new Set<number>(Object.keys(obj).map(k => Number(k)).filter(Boolean));
        } catch {
            return new Set<number>();
        }
    });

    useEffect(() => {
        const refresh = () => {
            try {
                const raw = localStorage.getItem('light_church:interested_events');
                if (!raw) { setLocalParticipations(new Set<number>()); return; }
                const obj = JSON.parse(raw) as Record<string, number>;
                setLocalParticipations(new Set<number>(Object.keys(obj).map(k => Number(k)).filter(Boolean)));
            } catch {
                setLocalParticipations(new Set<number>());
            }
        };

        // initial read
        refresh();

        // listen for same-tab custom events and storage events (cross-tab)
        window.addEventListener('light_church:interests_updated', refresh as EventListener);
        const storageHandler = (e: StorageEvent) => { if (e.key === 'light_church:interested_events') refresh(); };
        window.addEventListener('storage', storageHandler);

        return () => {
            window.removeEventListener('light_church:interests_updated', refresh as EventListener);
            window.removeEventListener('storage', storageHandler);
        };
    }, [events]);

    const [resultsPanelOpen, setResultsPanelOpen] = useState(true);

    const handleToggleList = () => {
        setResultsPanelOpen(!resultsPanelOpen);
    };

    const handleLocationSelect = useCallback((lat: number, lng: number, _label: string) => {
        // console.log('Selected location:', label);
        setMapCenter([lat, lng]);
        setMapZoom(13);
    }, []);

    return (
        <React.Fragment>
            {loading && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 3000 }}>
                    <LinearProgress sx={{ height: 4 }} />
                </Box>
            )}

            {/* Geolocation Alert */}
            <Snackbar
                open={showGeoAlert}
                autoHideDuration={8000}
                onClose={() => setShowGeoAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ top: { xs: 70, md: 24 } }}
            >
                <Alert
                    onClose={() => setShowGeoAlert(false)}
                    severity="info"
                    sx={{ width: '100%', boxShadow: 3 }}
                >
                    Pour une meilleure expérience, activez la géolocalisation pour voir les églises près de chez vous
                </Alert>
            </Snackbar>

            {/* Error Alert */}
            <Snackbar
                open={!!error}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setError(null)}
                    severity="error"
                    sx={{ width: '100%', boxShadow: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setError(null);
                                // Reload page to retry
                                window.location.reload();
                            }}
                            sx={{ fontWeight: 600 }}
                        >
                            Réessayer
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Snackbar>

            {/* Slow Loading Alert */}
            <Snackbar
                open={slowLoading && !error}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="warning"
                    sx={{ width: '100%', boxShadow: 3 }}
                >
                    Le chargement prend plus de temps que prévu, veuillez patienter...
                </Alert>
            </Snackbar>

            {isMobile ? (
                // Mobile Layout (Floating Panels)
                <>
                    {/* 1. Floating Search Panel */}
                    <SearchPanel
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        onToggleList={handleToggleList}
                        onLocationSelect={handleLocationSelect}
                        hideFilters={true}
                    />

                    {/* 1.5 Results Panel */}
                    <Box sx={{
                        position: 'absolute',
                        top: 70, // Below search panel
                        left: 16,
                        bottom: 24,
                        width: { xs: 'calc(100% - 32px)', sm: 360 },
                        zIndex: 900, // Below DetailDrawer but above map
                        display: (resultsPanelOpen || viewMode === 'participations') && !detailDrawerOpen ? 'block' : 'none',
                        pointerEvents: 'none' // Let clicks pass through container
                    }}>
                        <Box sx={{
                            height: '100%',
                            pointerEvents: 'auto', // Re-enable clicks for panel
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: 3
                        }}>
                            {viewMode === 'participations' ? (
                                <MyParticipationsSidebar
                                    onEventClick={(event) => handleMarkerClick(event, 'event')}
                                />
                            ) : (
                                <ResultsPanel
                                    churches={churches}
                                    events={events}
                                    loading={loading}
                                    onChurchClick={(church) => handleMarkerClick(church, 'church')}
                                    onEventClick={(event) => handleMarkerClick(event, 'event')}
                                    onClose={() => setResultsPanelOpen(false)}
                                    open={resultsPanelOpen}
                                    isGeolocated={!!userLocation}
                                    isMobileView={isMobile}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* 3. Detail Drawer */}
                    <DetailDrawer
                        open={detailDrawerOpen}
                        onClose={handleCloseDrawer}
                        loading={false}
                        data={selectedItem}
                        type={selectedType}
                        onOrganizerClick={async (churchId) => {
                            const basicChurch = churches.find(c => String(c.id) === String(churchId));
                            if (basicChurch) {
                                handleMarkerClick(basicChurch, 'church');
                            } else {
                                try {
                                    setDetailDrawerOpen(true);
                                    setSelectedType('church');
                                    // Dynamically import service to fetch missing details
                                    const { fetchChurchDetails } = await import('../../services/publicMapService');
                                    const details = await fetchChurchDetails(Number(churchId));
                                    setSelectedItem(details);
                                    if (details && details.latitude && details.longitude) {
                                        setMapCenter([details.latitude, details.longitude]);
                                        setMapZoom(16);
                                    }
                                } catch (e) {
                                    console.error("Failed to fetch organizer church details", e);
                                }
                            }
                        }}
                    />
                </>
            ) : (
                // Desktop Layout (Sidebar)
                <Sidebar>
                    {viewMode === 'explore' && !detailDrawerOpen && (
                        <SearchPanel
                            embedded
                            onSearch={handleSearch}
                            onFilterChange={handleFilterChange}
                            onToggleList={handleToggleList}
                            onLocationSelect={handleLocationSelect}
                        />
                    )}

                    <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        {detailDrawerOpen && selectedItem ? (
                            <DetailDrawer
                                embedded
                                open={true}
                                onClose={handleCloseDrawer}
                                loading={false}
                                data={selectedItem}
                                type={selectedType}
                                onOrganizerClick={async (churchId) => {
                                    // Fix: String conversion for safety
                                    const basicChurch = churches.find(c => String(c.id) === String(churchId));
                                    if (basicChurch) {
                                        handleMarkerClick(basicChurch, 'church');
                                    } else {
                                        try {
                                            // Dynamically import service to fetch missing details
                                            const { fetchChurchDetails } = await import('../../services/publicMapService');
                                            const details = await fetchChurchDetails(Number(churchId));
                                            setSelectedItem(details);
                                            setSelectedType('church');
                                            if (details && details.latitude && details.longitude) {
                                                setMapCenter([details.latitude, details.longitude]);
                                                setMapZoom(16);
                                            }
                                        } catch (e) {
                                            console.warn("Church logic: details fetch failed", e);
                                        }
                                    }
                                }}
                            />
                        ) : viewMode === 'participations' ? (
                            <MyParticipationsSidebar
                                onEventClick={(event) => handleMarkerClick(event, 'event')}
                            />
                        ) : (
                            <ResultsPanel
                                churches={churches}
                                events={events}
                                loading={loading}
                                onChurchClick={(church) => handleMarkerClick(church, 'church')}
                                onEventClick={(event) => handleMarkerClick(event, 'event')}
                                isGeolocated={!!userLocation}
                                isMobileView={false}
                            />
                        )}
                    </Box>
                </Sidebar>
            )}

            {/* 2. Map Container */}
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                minZoom={3}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // We will add custom controls
            >
                <TileLayer
                    url={mapType === 'satellite'
                        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                    attribution='&copy; OpenStreetMap contributors'
                />

                <MapCenter center={mapCenter} zoom={mapZoom} />
                <MapEventsHandler onBoundsChange={handleBoundsChange} />
                <ZoomControls isMobile={isMobile} />

                {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIconInstance} />
                )}

                {/* Supercluster-powered rendering for maximum performance */}
                {/* Church clusters and markers */}
                {churchClusters.map((cluster: any) => {
                    const [lng, lat] = cluster.geometry.coordinates;
                    const isCluster = cluster.properties.cluster;

                    if (isCluster) {
                        const pointCount = cluster.properties.point_count;
                        return (
                            <Marker
                                key={`church-cluster-${cluster.properties.cluster_id}`}
                                position={[lat, lng]}
                                icon={createChurchClusterIcon(pointCount)}
                                eventHandlers={{
                                    click: (e: L.LeafletMouseEvent) => {
                                        const expansionZoom = getClusterExpansionZoom(cluster.properties.cluster_id, 'church');
                                        e.target._map.setView([lat, lng], Math.min(expansionZoom + 1, 18));
                                    }
                                }}
                            >
                                <LeafletTooltip direction="top" offset={[0, -15]} opacity={0.95}>
                                    <span style={{ fontWeight: 'bold' }}>{pointCount} églises</span> dans cette zone
                                </LeafletTooltip>
                            </Marker>
                        );
                    }

                    const church = cluster.properties.item;
                    if (!church) return null;
                    const isSelected = selectedItem?.id === church.id && selectedType === 'church';
                    return (
                        <Marker
                            key={`church-${church.id}`}
                            position={[lat, lng]}
                            icon={isSelected ? selectedChurchIcon : churchIcon}
                            eventHandlers={{ click: () => handleMarkerClick(church, 'church') }}
                            zIndexOffset={isSelected ? 1000 : 0}
                        >
                            <LeafletTooltip direction="top" offset={[0, -15]} opacity={0.95}>
                                {church.church_name}
                            </LeafletTooltip>
                        </Marker>
                    );
                })}

                {/* Event clusters and markers */}
                {eventClusters.map((cluster: any) => {
                    const [lng, lat] = cluster.geometry.coordinates;
                    const isCluster = cluster.properties.cluster;

                    if (isCluster) {
                        const pointCount = cluster.properties.point_count;
                        return (
                            <Marker
                                key={`event-cluster-${cluster.properties.cluster_id}`}
                                position={[lat, lng]}
                                icon={createEventClusterIcon(pointCount)}
                                eventHandlers={{
                                    click: (e: L.LeafletMouseEvent) => {
                                        const expansionZoom = getClusterExpansionZoom(cluster.properties.cluster_id, 'event');
                                        e.target._map.setView([lat, lng], Math.min(expansionZoom + 1, 18));
                                    }
                                }}
                            >
                                <LeafletTooltip direction="top" offset={[0, -15]} opacity={0.95}>
                                    <span style={{ fontWeight: 'bold' }}>{pointCount} événements</span> dans cette zone
                                </LeafletTooltip>
                            </Marker>
                        );
                    }

                    const event = cluster.properties.item;
                    if (!event) return null;
                    const isSelected = selectedItem?.id === event.id && selectedType === 'event';
                    const isParticipating = localParticipations.has(event.id);
                    return (
                        <Marker
                            key={`event-${event.id}`}
                            position={[lat, lng]}
                            icon={
                                isSelected
                                    ? (isParticipating ? participatingEventSelectedIcon : selectedEventIcon)
                                    : (isParticipating ? participatingEventIcon : eventIcon)
                            }
                            eventHandlers={{ click: () => handleMarkerClick(event, 'event') }}
                            zIndexOffset={isSelected ? 1000 : 0}
                        >
                            <LeafletTooltip direction="top" offset={[0, -15]} opacity={0.95}>
                                {event.title}
                            </LeafletTooltip>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Map Legend */}
            <Paper
                elevation={2}
                sx={{
                    position: 'absolute',
                    bottom: isMobile ? 80 : 24,
                    left: isMobile ? 24 : 464,
                    zIndex: 1000,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4285F4 0%, #2563eb 100%)',
                            border: '2px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                        <Box component="span" sx={{ fontSize: 13, color: '#333' }}>Églises</Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #EA4335 0%, #dc2626 100%)',
                            border: '2px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                        <Box component="span" sx={{ fontSize: 13, color: '#333' }}>Événements</Box>
                    </Box>
                </Box>
            </Paper>

            {/* 4. Floating Action Buttons (Bottom Right) */}
            <Box sx={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
                {/* Home Button */}
                <Tooltip title="Accueil" placement="left" arrow>
                    <Paper
                        elevation={2}
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#F1F3F4' }
                        }}
                        onClick={() => navigate('/')}
                    >
                        <HomeIcon sx={{ color: '#666' }} />
                    </Paper>
                </Tooltip>

                {/* Mes participations */}
                <Tooltip title="Mes participations" placement="left" arrow>
                    <Paper
                        elevation={2}
                        sx={{
                            bgcolor: 'secondary.main',
                            borderRadius: 2,
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'secondary.dark' }
                        }}
                        onClick={() => navigate('/my-participations')}
                    >
                        <Badge badgeContent={localParticipations.size} color="primary" max={99}>
                            <EventIcon sx={{ color: 'white' }} />
                        </Badge>
                    </Paper>
                </Tooltip>

                {/* Map Layer Toggle */}
                <Tooltip title={mapType === 'satellite' ? 'Vue standard' : 'Vue satellite'} placement="left" arrow>
                    <Paper
                        elevation={2}
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#F1F3F4' }
                        }}
                        onClick={() => setMapType(t => t === 'standard' ? 'satellite' : 'standard')}
                    >
                        <Layers sx={{ color: '#666' }} />
                    </Paper>
                </Tooltip>

                {/* My Location - Only show if geolocation is available */}
                {userLocation && (
                    <Tooltip title="Ma position" placement="left" arrow>
                        <Paper
                            elevation={2}
                            sx={{
                                bgcolor: 'white',
                                borderRadius: 2,
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#F1F3F4' }
                            }}
                            onClick={handleRecenterMap}
                        >
                            <MyLocationIcon sx={{ color: '#666' }} />
                        </Paper>
                    </Tooltip>
                )}
            </Box>

        </React.Fragment>
    );
};

export default HomePage;
