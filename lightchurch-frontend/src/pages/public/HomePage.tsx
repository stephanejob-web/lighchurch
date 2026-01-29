import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet.css';
import type { Church, Event, UserLocation } from '../../types/publicMap';
import { fetchChurchesAndEventsMarkers, getUserLocation } from '../../services/publicMapService';
import { useSupercluster } from '../../hooks/useSupercluster';

// UI Components
import SearchPanel from '../../components/ui/SearchPanel';
import DetailDrawer from '../../components/ui/DetailDrawer';
import ResultsPanel from '../../components/Map/ResultsPanel';
import Sidebar from '../../components/Map/Sidebar';
import MyParticipationsSidebar from '../../components/Map/MyParticipationsSidebar';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ============================================================================
// OPTIMIZED CANVAS LAYER - Zero allocations during render
// ============================================================================
interface CanvasLayerProps {
    churchClusters: any[];
    eventClusters: any[];
    selectedId: number | null;
    selectedType: 'church' | 'event' | null;
    showChurches: boolean;
    showEvents: boolean;
    participations: Set<number>;
    onMarkerClick: (item: any, type: 'church' | 'event') => void;
    onClusterClick: (clusterId: number, type: 'church' | 'event', lat: number, lng: number, expansionZoom: number) => void;
}

const CanvasLayer: React.FC<CanvasLayerProps> = React.memo(({
    churchClusters,
    eventClusters,
    selectedId,
    selectedType,
    showChurches,
    showEvents,
    participations,
    onMarkerClick,
    onClusterClick,
}) => {
    const map = useMap();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const spritesRef = useRef<Record<string, HTMLCanvasElement>>({});
    const lastZoomRef = useRef<number>(-1);

    // Pre-allocate hit areas to avoid GC pressure
    const hitAreasRef = useRef<Array<{ x: number, y: number, r: number, type: 'church' | 'event', isCluster: boolean, data: any }>>([]);

    // Initialize sprites once
    const initSprites = useCallback(() => {
        const createMarkerSprite = (color: string, iconType: 'cross' | 'calendar', r: number, selected = false) => {
            const c = document.createElement('canvas');
            const size = Math.ceil((r + 4) * 2);
            c.width = size; c.height = size;
            const ctx = c.getContext('2d')!;
            const center = size / 2;

            ctx.beginPath();
            ctx.arc(center, center, r, 0, 6.283);
            ctx.fillStyle = selected ? '#FBBC04' : color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
            if (iconType === 'cross') {
                ctx.beginPath(); ctx.moveTo(center, center - 4); ctx.lineTo(center, center + 4);
                ctx.moveTo(center - 3, center - 1); ctx.lineTo(center + 3, center - 1); ctx.stroke();
            } else {
                ctx.strokeRect(center - 4, center - 3, 8, 7);
                ctx.beginPath(); ctx.moveTo(center - 4, center - 1); ctx.lineTo(center + 4, center - 1); ctx.stroke();
            }
            return c;
        };

        // Initializing sprites
        spritesRef.current = {
            church: createMarkerSprite('#4285F4', 'cross', 10),
            churchSelected: createMarkerSprite('#4285F4', 'cross', 14, true),
            event: createMarkerSprite('#EA4335', 'calendar', 10),
            eventSelected: createMarkerSprite('#EA4335', 'calendar', 14, true),
            eventParticipating: createMarkerSprite('#34A853', 'calendar', 10)
        };
    }, []);

    // Optimized drawing loop
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const size = map.getSize();
        if (canvas.width !== size.x || canvas.height !== size.y) {
            canvas.width = size.x; canvas.height = size.y;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hitAreasRef.current.length = 0;

        const zoom = map.getZoom();

        if (zoom !== lastZoomRef.current) {
            lastZoomRef.current = zoom;
        }

        const sprites = spritesRef.current;

        const renderItems = (items: any[], type: 'church' | 'event') => {
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item.geometry) continue;

                const [lng, lat] = item.geometry.coordinates;

                // Use latLngToContainerPoint for direct container coordinates (no caching needed)
                const point = map.latLngToContainerPoint([lat, lng]);
                const x = Math.round(point.x);
                const y = Math.round(point.y);

                if (x < -40 || x > canvas.width + 40 || y < -40 || y > canvas.height + 40) continue;

                const isCluster = item.properties.cluster;
                if (isCluster) {
                    const count = item.properties.point_count;
                    const r = Math.min(28, 14 + Math.log10(count) * 8);
                    
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, 6.283);
                    ctx.fillStyle = type === 'church' ? '#4285F4' : '#EA4335';
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(count >= 1000 ? Math.round(count/1000) + 'k' : String(count), x, y);
                    
                    hitAreasRef.current.push({ x, y, r, type, isCluster: true, data: item });
                } else {
                    const innerItem = item.properties.item;
                    const isSelected = selectedType === type && selectedId === innerItem?.id;
                    const isParticipating = type === 'event' && innerItem && participations.has(innerItem.id);
                    
                    const sprite = isSelected ? (type === 'church' ? sprites.churchSelected : sprites.eventSelected) :
                                 (isParticipating ? sprites.eventParticipating : (type === 'church' ? sprites.church : sprites.event));

                    if (sprite) {
                        const sSize = sprite.width;
                        const offset = sSize / 2;
                        ctx.drawImage(sprite, x - offset, y - offset);
                    }
                    
                    hitAreasRef.current.push({ x, y, r: isSelected ? 14 : 10, type, isCluster: false, data: innerItem });
                }
            }
        };

        if (showChurches) renderItems(churchClusters, 'church');
        if (showEvents) renderItems(eventClusters, 'event');

    }, [map, churchClusters, eventClusters, showChurches, showEvents, selectedId, selectedType, participations]);

    const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
        const mx = e.containerPoint.x;
        const my = e.containerPoint.y;

        const hits = hitAreasRef.current;
        for (let i = hits.length - 1; i >= 0; i--) {
            const hit = hits[i];
            const dx = mx - hit.x; const dy = my - hit.y;
            if (dx * dx + dy * dy <= (hit.r + 5) * (hit.r + 5)) {
                if (hit.isCluster) {
                    const [lng, lat] = hit.data.geometry.coordinates;
                    onClusterClick(hit.data.properties.cluster_id, hit.type, lat, lng, 0);
                } else if (hit.data) {
                    onMarkerClick(hit.data, hit.type);
                }
                return;
            }
        }
    }, [onMarkerClick, onClusterClick]);

    useEffect(() => {
        initSprites();
        const container = map.getContainer();
        let canvas = container.querySelector('.markers-canvas') as HTMLCanvasElement;

        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.className = 'markers-canvas';
            canvas.style.cssText = 'position:absolute;top:0;left:0;z-index:450;pointer-events:none;';
            container.appendChild(canvas);
        }
        canvasRef.current = canvas;

        const onMove = () => draw();
        map.on('move', onMove);
        map.on('zoom', onMove);
        map.on('viewreset', onMove);
        map.on('resize', onMove);
        map.on('click', handleMapClick);

        draw();

        return () => {
            map.off('move', onMove);
            map.off('zoom', onMove);
            map.off('viewreset', onMove);
            map.off('resize', onMove);
            map.off('click', handleMapClick);
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        };
    }, [map, draw, handleMapClick, initSprites]);

    return null;
});
CanvasLayer.displayName = 'CanvasLayer';

// ============================================================================
// MAP COMPONENTS
// ============================================================================
const MapCenter: React.FC<{ center: [number, number]; zoom: number }> = React.memo(({ center, zoom }) => {
    const map = useMap();
    const prevRef = useRef({ center, zoom });

    useEffect(() => {
        if (prevRef.current.center[0] !== center[0] ||
            prevRef.current.center[1] !== center[1] ||
            prevRef.current.zoom !== zoom) {
            map.flyTo(center, zoom, { duration: 0.5 });
            prevRef.current = { center, zoom };
        }
    }, [center, zoom, map]);

    return null;
});

interface BoundsTrackerProps {
    onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }, zoom: number) => void;
}

const BoundsTracker: React.FC<BoundsTrackerProps> = React.memo(({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => {
            const b = map.getBounds();
            onBoundsChange({
                north: b.getNorth(),
                south: b.getSouth(),
                east: b.getEast(),
                west: b.getWest()
            }, map.getZoom());
        },
        zoomend: () => {
            const b = map.getBounds();
            onBoundsChange({
                north: b.getNorth(),
                south: b.getSouth(),
                east: b.getEast(),
                west: b.getWest()
            }, map.getZoom());
        }
    });

    // Initial bounds
    useEffect(() => {
        const b = map.getBounds();
        onBoundsChange({
            north: b.getNorth(),
            south: b.getSouth(),
            east: b.getEast(),
            west: b.getWest()
        }, map.getZoom());
    }, [map, onBoundsChange]);

    return null;
});

const UserMarker: React.FC<{ position: [number, number] }> = React.memo(({ position }) => {
    const map = useMap();
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
            return;
        }

        const icon = L.divIcon({
            className: 'user-marker',
            html: `<div style="width:20px;height:20px;position:relative;">
                <div style="position:absolute;width:20px;height:20px;background:rgba(66,133,244,0.3);border-radius:50%;"></div>
                <div style="position:absolute;top:5px;left:5px;width:10px;height:10px;background:#4285F4;border:2px solid white;border-radius:50%;"></div>
            </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        markerRef.current = L.marker(position, { icon, zIndexOffset: 1000 }).addTo(map);

        return () => {
            markerRef.current?.remove();
            markerRef.current = null;
        };
    }, [map, position]);

    return null;
});

const ZoomControls: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const map = useMap();
    return (
        <Box sx={{
            position: 'absolute', bottom: 24, left: isMobile ? 24 : 440,
            display: 'flex', flexDirection: 'column', zIndex: 1000,
            borderRadius: 2, overflow: 'hidden', boxShadow: 2,
        }}>
            <Tooltip title="Zoom +" placement="right">
                <Paper elevation={0} sx={{
                    bgcolor: 'white', width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', borderBottom: '1px solid #E0E0E0', '&:hover': { bgcolor: '#F5F5F5' }
                }} onClick={() => map.zoomIn()}>
                    <AddIcon sx={{ color: '#666' }} />
                </Paper>
            </Tooltip>
            <Tooltip title="Zoom -" placement="right">
                <Paper elevation={0} sx={{
                    bgcolor: 'white', width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', '&:hover': { bgcolor: '#F5F5F5' }
                }} onClick={() => map.zoomOut()}>
                    <RemoveIcon sx={{ color: '#666' }} />
                </Paper>
            </Tooltip>
        </Box>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
interface HomePageProps {
    viewMode?: 'explore' | 'participations';
}

const HomePage: React.FC<HomePageProps> = ({ viewMode = 'explore' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    // ========== DATA STATE ==========
    const [loading, setLoading] = useState(false);

    // ========== MAP STATE ==========
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]);
    const [mapZoom, setMapZoom] = useState(6);
    const [currentBounds, setCurrentBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
    const [currentZoom, setCurrentZoom] = useState(6);

    // ========== UI STATE ==========
    const [showGeoAlert, setShowGeoAlert] = useState(false);
    const [showChurches, setShowChurches] = useState(true);
    const [showEvents, setShowEvents] = useState(true);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<'church' | 'event' | null>(null);
    const [mapType, setMapType] = useState<'satellite' | 'standard'>('satellite');
    const [resultsPanelOpen, setResultsPanelOpen] = useState(true);

    // ========== PARTICIPATIONS ==========
    const [participations, setParticipations] = useState<Set<number>>(() => {
        try {
            const raw = localStorage.getItem('light_church:interested_events');
            return raw ? new Set(Object.keys(JSON.parse(raw)).map(Number).filter(Boolean)) : new Set();
        } catch { return new Set(); }
    });

    // ========== DATA FETCHING (REFINED STRATEGY) ==========
    const [dataState, setDataState] = useState<{
        churches: Church[];
        events: Event[];
        serverClusters: { churchClusters: any[]; eventClusters: any[] };
        fetching: boolean;
    }>({
        churches: [],
        events: [],
        serverClusters: { churchClusters: [], eventClusters: [] },
        fetching: false
    });

    const lastFetchedBoundsRef = useRef<{ north: number; south: number; east: number; west: number } | null>(null);
    const lastZoomRef = useRef<number>(currentZoom);

    // Strategy:
    // 1. Zoom < 10: Server-side clusters with stable IDs
    // 2. Zoom >= 10: Markers for Padded Viewport
    useEffect(() => {
        if (!currentBounds) return;

        // Determination of whether we need to refetch
        const isZoomChanged = Math.abs(currentZoom - lastZoomRef.current) >= 1;
        
        let needsRefetch = isZoomChanged;
        
        // If zoom didn't change, check if we are still within the "padded" bounds from last fetch
        if (!needsRefetch && lastFetchedBoundsRef.current) {
            const b = currentBounds;
            const lb = lastFetchedBoundsRef.current;
            // Buffer threshold: trigger fetch if we are within 10% of the edge of our cached area
            const paddingLat = (lb.north - lb.south) * 0.1;
            const paddingLng = (lb.east - lb.west) * 0.1;
            
            if (b.north > lb.north - paddingLat || 
                b.south < lb.south + paddingLat || 
                b.east > lb.east - paddingLng || 
                b.west < lb.west + paddingLng) {
                needsRefetch = true;
            }
        } else {
            needsRefetch = true;
        }

        if (!needsRefetch) return;

        lastZoomRef.current = currentZoom;
        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            setDataState(prev => ({ ...prev, fetching: true }));
            
            try {
                // Calculate Padded Bounding Box (50% larger)
                const latPad = (currentBounds.north - currentBounds.south) * 0.5;
                const lngPad = (currentBounds.east - currentBounds.west) * 0.5;
                const paddedBounds = {
                    north: currentBounds.north + latPad,
                    south: currentBounds.south - latPad,
                    east: currentBounds.east + lngPad,
                    west: currentBounds.west - lngPad
                };

                if (currentZoom < 10) {
                    const { fetchServerClusters } = await import('../../services/publicMapService');
                    const clusters = await fetchServerClusters({ ...paddedBounds, zoom: currentZoom });
                    
                    if (cancelled) return;

                    const formatCluster = (c: any, type: 'church' | 'event') => ({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
                        properties: {
                            cluster: c.count > 1,
                            cluster_id: c.id,
                            point_count: c.count,
                            item: c.count === 1 ? { id: c.sampleId, church_name: c.sampleName, title: c.sampleName, latitude: c.lat, longitude: c.lng } : null,
                            itemType: type
                        }
                    });

                    setDataState({
                        churches: [], 
                        events: [],
                        serverClusters: {
                            churchClusters: (clusters.churchClusters || []).map(c => formatCluster(c, 'church')),
                            eventClusters: (clusters.eventClusters || []).map(c => formatCluster(c, 'event'))
                        },
                        fetching: false
                    });
                } else {
                    const data = await fetchChurchesAndEventsMarkers({ ...paddedBounds, limit: 5000 });
                    
                    if (cancelled) return;

                    setDataState({
                        churches: data.churches || [],
                        events: data.events || [],
                        serverClusters: { churchClusters: [], eventClusters: [] },
                        fetching: false
                    });
                }
                
                lastFetchedBoundsRef.current = paddedBounds;

            } catch (err) {
                console.error('Fetch error:', err);
                setDataState(prev => ({ ...prev, fetching: false }));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchData, isZoomChanged ? 50 : 400); // Faster trigger on zoom
        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [currentBounds, currentZoom]);

    // ========== CLIENT-SIDE CLUSTERING ==========
    const { churchClusters, eventClusters, getClusterExpansionZoom } = useSupercluster(
        showChurches ? dataState.churches : [],
        showEvents ? dataState.events : [],
        currentBounds,
        currentZoom,
        { radius: 60, maxZoom: 17 }
    );

    // High Zoom: Use Client Clusters; Low Zoom: Use Server Clusters
    // Progressive: during fetch, keep showing previous state if available
    const finalChurchClusters = currentZoom >= 10 ? churchClusters : dataState.serverClusters.churchClusters;
    const finalEventClusters = currentZoom >= 10 ? eventClusters : dataState.serverClusters.eventClusters;

    // Final values for components
    const churches = dataState.churches;
    const events = dataState.events;

    // ========== GET USER LOCATION ==========
    useEffect(() => {
        const fetchLocation = async () => {
            const position = await getUserLocation();
            if (position) {
                const loc = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                setUserLocation(loc);
                setMapCenter([loc.latitude, loc.longitude]);
                setMapZoom(13);
            } else {
                setShowGeoAlert(true);
            }
        };
        fetchLocation();
    }, []);

    // ========== PARTICIPATIONS LISTENER ==========
    useEffect(() => {
        const refresh = () => {
            try {
                const raw = localStorage.getItem('light_church:interested_events');
                setParticipations(raw ? new Set(Object.keys(JSON.parse(raw)).map(Number).filter(Boolean)) : new Set());
            } catch { setParticipations(new Set()); }
        };
        window.addEventListener('light_church:interests_updated', refresh);
        window.addEventListener('storage', (e) => { if (e.key === 'light_church:interested_events') refresh(); });
        return () => window.removeEventListener('light_church:interests_updated', refresh);
    }, []);

    // ========== HANDLERS ==========
    const handleBoundsChange = useCallback((bounds: any, zoom: number) => {
        setCurrentBounds(bounds);
        setCurrentZoom(zoom);
    }, []);

    const handleMarkerClick = useCallback(async (item: any, type: 'church' | 'event') => {
        setSelectedType(type);
        setDetailDrawerOpen(true);
        // Important: Use item.latitude/longitude directly
        setMapCenter([item.latitude, item.longitude]);
        setMapZoom(16);

        try {
            if (type === 'church') {
                const { fetchChurchDetails } = await import('../../services/publicMapService');
                const details = await fetchChurchDetails(item.id);
                setSelectedItem(details);
            } else {
                const { fetchEventDetails } = await import('../../services/publicMapService');
                const details = await fetchEventDetails(item.id);
                setSelectedItem(details);
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setSelectedItem(item);
        }
    }, []);

    const handleClusterClick = useCallback((clusterId: any, type: 'church' | 'event', lat: number, lng: number) => {
        if (currentZoom < 10) {
            // High-level zoom steps for server clusters
            setMapCenter([lat, lng]);
            setMapZoom(currentZoom + 2);
        } else {
            const expansionZoom = getClusterExpansionZoom(clusterId, type);
            setMapCenter([lat, lng]);
            setMapZoom(Math.min(expansionZoom + 1, 18));
        }
    }, [getClusterExpansionZoom, currentZoom]);

    const handleCloseDrawer = useCallback(() => {
        setDetailDrawerOpen(false);
        setSelectedItem(null);
    }, []);

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        setMapCenter([lat, lng]);
        setMapZoom(14);
    }, []);

    const handleRecenter = useCallback(() => {
        if (userLocation) {
            setMapCenter([userLocation.latitude, userLocation.longitude]);
            setMapZoom(13);
        }
    }, [userLocation]);

    return (
        <React.Fragment>
            {loading && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 3000 }}>
                    <LinearProgress />
                </Box>
            )}

            <Snackbar open={showGeoAlert} autoHideDuration={6000} onClose={() => setShowGeoAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={() => setShowGeoAlert(false)} severity="info">
                    Activez la géolocalisation pour voir les églises près de vous
                </Alert>
            </Snackbar>

            {isMobile ? (
                <>
                    <SearchPanel onSearch={() => {}}
                        onFilterChange={(f) => { setShowChurches(f.churches); setShowEvents(f.events); }}
                        onToggleList={() => setResultsPanelOpen(!resultsPanelOpen)}
                        onLocationSelect={handleLocationSelect} hideFilters />

                    {(resultsPanelOpen || viewMode === 'participations') && !detailDrawerOpen && (
                        <Box sx={{ position: 'absolute', top: 70, left: 16, bottom: 24, width: 'calc(100% - 32px)', zIndex: 900, pointerEvents: 'none' }}>
                            <Box sx={{ height: '100%', pointerEvents: 'auto', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                                {viewMode === 'participations' ? (
                                    <MyParticipationsSidebar onEventClick={(e) => handleMarkerClick(e, 'event')} />
                                ) : (
                                    <ResultsPanel churches={churches} events={events} loading={loading || dataState.fetching}
                                        onChurchClick={(c) => handleMarkerClick(c, 'church')}
                                        onEventClick={(e) => handleMarkerClick(e, 'event')}
                                        onClose={() => setResultsPanelOpen(false)} open={resultsPanelOpen}
                                        isGeolocated={!!userLocation} isMobileView />
                                )}
                            </Box>
                        </Box>
                    )}

                    <DetailDrawer open={detailDrawerOpen} onClose={handleCloseDrawer} loading={!selectedItem}
                        data={selectedItem} type={selectedType}
                        onOrganizerClick={async (id) => {
                            const c = churches.find(c => String(c.id) === String(id));
                            if (c) handleMarkerClick(c, 'church');
                        }} />
                </>
            ) : (
                <Sidebar>
                    {viewMode === 'explore' && !detailDrawerOpen && (
                        <SearchPanel embedded onSearch={() => {}}
                            onFilterChange={(f) => { setShowChurches(f.churches); setShowEvents(f.events); }}
                            onToggleList={() => setResultsPanelOpen(!resultsPanelOpen)}
                            onLocationSelect={handleLocationSelect} />
                    )}
                    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {detailDrawerOpen ? (
                            <DetailDrawer embedded open onClose={handleCloseDrawer} loading={!selectedItem}
                                data={selectedItem} type={selectedType}
                                onOrganizerClick={async (id) => {
                                    const c = churches.find(c => String(c.id) === String(id));
                                    if (c) handleMarkerClick(c, 'church');
                                }} />
                        ) : viewMode === 'participations' ? (
                            <MyParticipationsSidebar onEventClick={(e) => handleMarkerClick(e, 'event')} />
                        ) : (
                            <ResultsPanel churches={churches} events={events} loading={loading}
                                onChurchClick={(c) => handleMarkerClick(c, 'church')}
                                onEventClick={(e) => handleMarkerClick(e, 'event')}
                                isGeolocated={!!userLocation} isMobileView={false} />
                        )}
                    </Box>
                </Sidebar>
            )}

            <MapContainer center={mapCenter} zoom={mapZoom} minZoom={3} maxZoom={18}
                style={{ height: '100%', width: '100%' }} zoomControl={false} preferCanvas>
                <TileLayer
                    url={mapType === 'satellite'
                        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                />

                <MapCenter center={mapCenter} zoom={mapZoom} />
                <BoundsTracker onBoundsChange={handleBoundsChange} />
                <ZoomControls isMobile={isMobile} />

                {userLocation && <UserMarker position={[userLocation.latitude, userLocation.longitude]} />}

                <CanvasLayer
                    churchClusters={finalChurchClusters}
                    eventClusters={finalEventClusters}
                    selectedId={selectedItem?.id || null}
                    selectedType={selectedType}
                    showChurches={showChurches}
                    showEvents={showEvents}
                    participations={participations}
                    onMarkerClick={handleMarkerClick}
                    onClusterClick={handleClusterClick}
                />
            </MapContainer>

            <Paper elevation={2} sx={{
                position: 'absolute', bottom: isMobile ? 80 : 24, left: isMobile ? 24 : 464,
                zIndex: 1000, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)'
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4285F4' }} />
                        <Box sx={{ fontSize: 12 }}>Églises {currentZoom >= 10 ? `(${churches.length})` : '(Vue globale)'}</Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#EA4335' }} />
                        <Box sx={{ fontSize: 12 }}>Événements {currentZoom >= 10 ? `(${events.length})` : '(Vue globale)'}</Box>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
                <Tooltip title="Accueil" placement="left">
                    <Paper elevation={2} sx={{ bgcolor: 'white', borderRadius: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        onClick={() => navigate('/')}>
                        <HomeIcon sx={{ color: '#666' }} />
                    </Paper>
                </Tooltip>

                <Tooltip title="Mes participations" placement="left">
                    <Paper elevation={2} sx={{ bgcolor: 'secondary.main', borderRadius: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        onClick={() => navigate('/my-participations')}>
                        <Badge badgeContent={participations.size} color="primary" max={99}>
                            <EventIcon sx={{ color: 'white' }} />
                        </Badge>
                    </Paper>
                </Tooltip>

                <Tooltip title={mapType === 'satellite' ? 'Vue carte' : 'Vue satellite'} placement="left">
                    <Paper elevation={2} sx={{ bgcolor: 'white', borderRadius: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        onClick={() => setMapType(t => t === 'satellite' ? 'standard' : 'satellite')}>
                        <Layers sx={{ color: '#666' }} />
                    </Paper>
                </Tooltip>

                {userLocation && (
                    <Tooltip title="Ma position" placement="left">
                        <Paper elevation={2} sx={{ bgcolor: 'white', borderRadius: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            onClick={handleRecenter}>
                            <MyLocationIcon sx={{ color: '#666' }} />
                        </Paper>
                    </Tooltip>
                )}
            </Box>
        </React.Fragment>
    );
};

export default HomePage;
