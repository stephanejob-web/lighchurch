import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Box,
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
    Event as EventIcon,
    Home as HomeIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Undo as UndoIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet.css';
import type { Church, Event, UserLocation } from '../../types/publicMap';
import { fetchChurchesAndEventsMarkers, getUserLocation, fetchChurchDetails } from '../../services/publicMapService';
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
// OPTIMIZED CANVAS LAYER - Combined Clusters
// ============================================================================
interface CanvasLayerProps {
    clusters: any[];
    selectedId: number | null;
    selectedType: 'church' | 'event' | null;
    showChurches: boolean;
    showEvents: boolean;
    participations: Set<number>;
    onMarkerClick: (item: any, type: 'church' | 'event') => void;
    onClusterClick: (clusterId: number, lat: number, lng: number) => void;
}

const CanvasLayer: React.FC<CanvasLayerProps> = React.memo(({
    clusters,
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
    const animationRef = useRef<number | null>(null);
    const pulseRef = useRef<number>(0);

    const hitAreasRef = useRef<Array<{ x: number, y: number, r: number, type: 'church' | 'event' | 'mixed', isCluster: boolean, data: any }>>([]);

    // Initialize sprites once
    const initSprites = useCallback(() => {
        const createMarkerSprite = (color: string, iconType: 'cross' | 'calendar', r: number, selected = false) => {
            const c = document.createElement('canvas');
            // Plus d'espace pour le marqueur sélectionné (pour le glow)
            const padding = selected ? 20 : 4;
            const size = Math.ceil((r + padding) * 2);
            c.width = size; c.height = size;
            const ctx = c.getContext('2d')!;
            const center = size / 2;

            if (selected) {
                // Ombre portée pour le marqueur sélectionné
                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetY = 3;
            }

            ctx.beginPath();
            ctx.arc(center, center, r, 0, 6.283);
            ctx.fillStyle = color; // Garder la couleur d'origine pour le marqueur
            ctx.fill();

            // Bordure plus épaisse et contrastée pour le sélectionné
            ctx.strokeStyle = selected ? '#FFFFFF' : '#fff';
            ctx.lineWidth = selected ? 3 : 2;
            ctx.stroke();

            // Réinitialiser l'ombre pour les icônes
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            ctx.strokeStyle = '#fff'; ctx.lineWidth = selected ? 2 : 1.5;
            if (iconType === 'cross') {
                const iconScale = selected ? 1.3 : 1;
                ctx.beginPath();
                ctx.moveTo(center, center - 4 * iconScale);
                ctx.lineTo(center, center + 4 * iconScale);
                ctx.moveTo(center - 3 * iconScale, center - 1 * iconScale);
                ctx.lineTo(center + 3 * iconScale, center - 1 * iconScale);
                ctx.stroke();
            } else {
                const iconScale = selected ? 1.3 : 1;
                ctx.strokeRect(center - 4 * iconScale, center - 3 * iconScale, 8 * iconScale, 7 * iconScale);
                ctx.beginPath();
                ctx.moveTo(center - 4 * iconScale, center - 1 * iconScale);
                ctx.lineTo(center + 4 * iconScale, center - 1 * iconScale);
                ctx.stroke();
            }
            return c;
        };

        spritesRef.current = {
            church: createMarkerSprite('#4285F4', 'cross', 10),
            churchSelected: createMarkerSprite('#4285F4', 'cross', 16, true),
            event: createMarkerSprite('#EA4335', 'calendar', 10),
            eventSelected: createMarkerSprite('#EA4335', 'calendar', 16, true),
            eventParticipating: createMarkerSprite('#34A853', 'calendar', 10)
        };
    }, []);

    const draw = useCallback((pulse: number = 0) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const bounds = map.getBounds();
        const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
        const size = map.getSize();
        const padding = { x: size.x * 0.5, y: size.y * 0.5 };
        const offset = {
            x: Math.round(topLeft.x - padding.x),
            y: Math.round(topLeft.y - padding.y)
        };
        const width = size.x + padding.x * 2;
        const height = size.y + padding.y * 2;

        L.DomUtil.setPosition(canvas, L.point(offset.x, offset.y));

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        } else {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, width, height);
        }

        hitAreasRef.current.length = 0;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sprites = spritesRef.current;
        const PI2 = Math.PI * 2;

        // Stocker le marqueur sélectionné pour le dessiner en dernier
        let selectedMarkerData: { x: number; y: number; sprite: HTMLCanvasElement; itemType: 'church' | 'event'; innerItem: any } | null = null;

        for (let i = 0; i < clusters.length; i++) {
            const item = clusters[i];
            if (!item.geometry) continue;

            const [lng, lat] = item.geometry.coordinates;
            const point = map.latLngToLayerPoint([lat, lng]);
            const x = Math.round(point.x - offset.x);
            const y = Math.round(point.y - offset.y);

            if (x < -30 || x > width + 30 || y < -30 || y > height + 30) continue;

            const isCluster = item.properties.cluster;

            if (isCluster) {
                const churchCount = item.properties.churchCount || 0;
                const eventCount = item.properties.eventCount || 0;
                const total = churchCount + eventCount;

                // Filtrage selon les options d'affichage
                const visibleCount = (showChurches ? churchCount : 0) + (showEvents ? eventCount : 0);
                if (visibleCount === 0) continue;

                const r = Math.min(28, 14 + Math.log10(total) * 8);

                // Dessiner le cluster bi-colore (camembert)
                if (churchCount > 0 && eventCount > 0 && showChurches && showEvents) {
                    // Cluster mixte : dessiner deux arcs proportionnels
                    const churchRatio = churchCount / total;
                    const churchAngle = churchRatio * PI2;

                    // Arc bleu (églises) - commence en haut (-PI/2)
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + churchAngle);
                    ctx.closePath();
                    ctx.fillStyle = '#4285F4';
                    ctx.fill();

                    // Arc rouge (événements)
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.arc(x, y, r, -Math.PI / 2 + churchAngle, -Math.PI / 2 + PI2);
                    ctx.closePath();
                    ctx.fillStyle = '#EA4335';
                    ctx.fill();
                } else {
                    // Cluster mono-couleur
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, PI2);
                    if (showChurches && churchCount > 0) {
                        ctx.fillStyle = '#4285F4';
                    } else {
                        ctx.fillStyle = '#EA4335';
                    }
                    ctx.fill();
                }

                // Bordure blanche
                ctx.beginPath();
                ctx.arc(x, y, r, 0, PI2);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Texte du compteur
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(visibleCount >= 1000 ? Math.round(visibleCount/1000) + 'k' : String(visibleCount), x, y);

                hitAreasRef.current.push({ x, y, r, type: 'mixed', isCluster: true, data: item });
            } else {
                // Marqueur individuel
                const itemType = item.properties.itemType as 'church' | 'event';
                const innerItem = item.properties.item;

                // Filtrage selon les options d'affichage
                if (itemType === 'church' && !showChurches) continue;
                if (itemType === 'event' && !showEvents) continue;

                const isSelected = selectedType === itemType && selectedId === innerItem?.id;
                const isParticipating = itemType === 'event' && innerItem && participations.has(innerItem.id);

                // Si sélectionné, sauvegarder pour dessiner en dernier
                if (isSelected) {
                    const sprite = itemType === 'church' ? sprites.churchSelected : sprites.eventSelected;
                    if (sprite) {
                        selectedMarkerData = { x, y, sprite, itemType, innerItem };
                    }
                    hitAreasRef.current.push({ x, y, r: 18, type: itemType, isCluster: false, data: innerItem });
                    continue; // Ne pas dessiner maintenant
                }

                const sprite = isParticipating
                    ? sprites.eventParticipating
                    : (itemType === 'church' ? sprites.church : sprites.event);

                if (sprite) {
                    const drawOffset = sprite.width / 2;
                    ctx.drawImage(sprite, x - drawOffset, y - drawOffset);
                }

                hitAreasRef.current.push({ x, y, r: 10, type: itemType, isCluster: false, data: innerItem });
            }
        }

        // Dessiner le marqueur sélectionné en dernier (au-dessus de tout)
        if (selectedMarkerData) {
            const { x, y, sprite, itemType } = selectedMarkerData;

            // Effet de halo pulsant
            const pulseScale = 0.5 + Math.sin(pulse * 0.05) * 0.5; // Oscillation entre 0 et 1
            const maxRingRadius = 35;
            const minRingRadius = 20;
            const ringRadius = minRingRadius + (maxRingRadius - minRingRadius) * pulseScale;
            const ringAlpha = 0.6 - pulseScale * 0.4; // Plus opaque quand petit, plus transparent quand grand

            // Couleur du halo selon le type
            const ringColor = itemType === 'church' ? '66, 133, 244' : '234, 67, 53'; // RGB

            // Dessiner le halo pulsant
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, PI2);
            ctx.fillStyle = `rgba(${ringColor}, ${ringAlpha * 0.3})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(${ringColor}, ${ringAlpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Deuxième anneau plus petit et plus opaque
            const innerRingRadius = minRingRadius + (maxRingRadius - minRingRadius) * pulseScale * 0.6;
            ctx.beginPath();
            ctx.arc(x, y, innerRingRadius, 0, PI2);
            ctx.strokeStyle = `rgba(${ringColor}, ${ringAlpha * 1.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Dessiner le marqueur sélectionné
            const drawOffset = sprite.width / 2;
            ctx.drawImage(sprite, x - drawOffset, y - drawOffset);
        }
    }, [map, clusters, showChurches, showEvents, selectedId, selectedType, participations]);

    const handleCanvasClick = useCallback((e: MouseEvent) => {
        const mx = e.offsetX;
        const my = e.offsetY;

        const hits = hitAreasRef.current;
        for (let i = hits.length - 1; i >= 0; i--) {
            const hit = hits[i];
            const dx = mx - hit.x;
            const dy = my - hit.y;

            if (dx * dx + dy * dy <= (hit.r + 5) * (hit.r + 5)) {
                if (hit.isCluster) {
                    const [lng, lat] = hit.data.geometry.coordinates;
                    onClusterClick(hit.data.properties.cluster_id, lat, lng);
                } else if (hit.data) {
                    onMarkerClick(hit.data, hit.type as 'church' | 'event');
                }
                return;
            }
        }
    }, [onMarkerClick, onClusterClick]);

    useEffect(() => {
        initSprites();

        const canvas = document.createElement('canvas');
        canvas.className = 'leaflet-zoom-animated';
        canvas.style.zIndex = '450';
        canvas.style.pointerEvents = 'auto';

        map.getPanes().overlayPane.appendChild(canvas);
        canvasRef.current = canvas;
        canvas.addEventListener('click', handleCanvasClick);

        const onMoveEnd = () => draw(pulseRef.current);
        const onZoomEnd = () => draw(pulseRef.current);

        map.on('moveend', onMoveEnd);
        map.on('zoomend', onZoomEnd);
        draw(0);

        return () => {
            map.off('moveend', onMoveEnd);
            map.off('zoomend', onZoomEnd);
            canvas.removeEventListener('click', handleCanvasClick);
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        };
    }, [map, draw, handleCanvasClick, initSprites]);

    // Animation loop pour l'effet pulsant du marqueur sélectionné
    useEffect(() => {
        if (selectedId === null) {
            // Pas de marqueur sélectionné, arrêter l'animation
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            return;
        }

        let running = true;
        const animate = () => {
            if (!running) return;
            pulseRef.current += 1;
            draw(pulseRef.current);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            running = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [selectedId, draw]);

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

// Capture map reference for external controls
const MapRefCapture: React.FC<{ onMapReady: (map: L.Map) => void }> = ({ onMapReady }) => {
    const map = useMap();
    useEffect(() => {
        onMapReady(map);
    }, [map, onMapReady]);
    return null;
};

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

const ZoomControls: React.FC<{ mapRef: L.Map | null }> = ({ mapRef }) => {
    return (
        <Box sx={{
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            borderRadius: 1,
            overflow: 'hidden',
        }}>
            <Box
                sx={{
                    bgcolor: 'white', width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', borderBottom: '1px solid #E6E6E6',
                    '&:hover': { bgcolor: '#F8F8F8' }
                }}
                onClick={() => mapRef?.zoomIn()}
            >
                <AddIcon sx={{ color: '#666' }} />
            </Box>
            <Box
                sx={{
                    bgcolor: 'white', width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8F8F8' }
                }}
                onClick={() => mapRef?.zoomOut()}
            >
                <RemoveIcon sx={{ color: '#666' }} />
            </Box>
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
    const [searchParams] = useSearchParams();

    // ========== MAP REFERENCE ==========
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

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

    // ========== NAVIGATION HISTORY (Bouton Retour) ==========
    const [previousPosition, setPreviousPosition] = useState<{ center: [number, number]; zoom: number } | null>(null);
    const [showReturnButton, setShowReturnButton] = useState(false);
    const returnButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                    // À faible zoom: récupérer clusters serveur pour la carte + données individuelles pour le ResultsPanel
                    const { fetchServerClusters } = await import('../../services/publicMapService');
                    const [clusters, markersData] = await Promise.all([
                        fetchServerClusters({ ...paddedBounds, zoom: currentZoom }),
                        fetchChurchesAndEventsMarkers({ ...paddedBounds, limit: 5000 })
                    ]);

                    if (cancelled) return;

                    const formatCluster = (c: any, type: 'church' | 'event') => ({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
                        properties: {
                            cluster: c.count > 1,
                            cluster_id: c.id,
                            point_count: c.count,
                            // Compteurs pour le rendu bi-colore
                            churchCount: type === 'church' ? c.count : 0,
                            eventCount: type === 'event' ? c.count : 0,
                            item: c.count === 1 ? { id: c.sampleId, church_name: c.sampleName, title: c.sampleName, latitude: c.lat, longitude: c.lng } : null,
                            itemType: type
                        }
                    });

                    setDataState({
                        churches: markersData.churches || [],
                        events: markersData.events || [],
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

    // ========== CLIENT-SIDE CLUSTERING (COMBINED) ==========
    const { clusters, getClusterExpansionZoom } = useSupercluster(
        dataState.churches,
        dataState.events,
        currentBounds,
        currentZoom,
        { radius: 60, maxZoom: 17 }
    );

    // High Zoom: Use Client Clusters; Low Zoom: Merge Server Clusters
    const finalClusters = useMemo(() => {
        if (currentZoom >= 10) return clusters;

        // Fusionner les clusters serveur proches pour créer des clusters bi-colores
        const churchClusters = dataState.serverClusters.churchClusters;
        const eventClusters = dataState.serverClusters.eventClusters;

        if (churchClusters.length === 0) return eventClusters;
        if (eventClusters.length === 0) return churchClusters;

        // Seuil de distance pour fusionner (en degrés, ~50km à l'équateur)
        const mergeThreshold = 0.5;

        const merged: any[] = [];
        const usedEventIndices = new Set<number>();

        // Pour chaque cluster d'église, chercher un cluster d'événement proche
        for (const church of churchClusters) {
            const [cLng, cLat] = church.geometry.coordinates;
            let foundMatch = false;

            for (let i = 0; i < eventClusters.length; i++) {
                if (usedEventIndices.has(i)) continue;

                const event = eventClusters[i];
                const [eLng, eLat] = event.geometry.coordinates;

                const dist = Math.sqrt((cLng - eLng) ** 2 + (cLat - eLat) ** 2);

                if (dist < mergeThreshold) {
                    // Fusionner les deux clusters
                    const totalChurches = church.properties.churchCount || 0;
                    const totalEvents = event.properties.eventCount || 0;

                    merged.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [(cLng + eLng) / 2, (cLat + eLat) / 2] // Point médian
                        },
                        properties: {
                            cluster: true,
                            cluster_id: `merged_${church.properties.cluster_id}_${event.properties.cluster_id}`,
                            point_count: totalChurches + totalEvents,
                            churchCount: totalChurches,
                            eventCount: totalEvents,
                            item: null,
                            itemType: 'mixed'
                        }
                    });

                    usedEventIndices.add(i);
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                merged.push(church);
            }
        }

        // Ajouter les clusters d'événements non fusionnés
        for (let i = 0; i < eventClusters.length; i++) {
            if (!usedEventIndices.has(i)) {
                merged.push(eventClusters[i]);
            }
        }

        return merged;
    }, [currentZoom, clusters, dataState.serverClusters.churchClusters, dataState.serverClusters.eventClusters]);

    // Final values for components (churches utilisé pour onOrganizerClick dans DetailDrawer)
    const churches = dataState.churches;

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

    // ========== HANDLE URL PARAM church_id (Aperçu Public) ==========
    useEffect(() => {
        const churchId = searchParams.get('church_id');
        if (churchId && mapInstance) {
            const loadChurch = async () => {
                try {
                    const church = await fetchChurchDetails(parseInt(churchId));
                    if (church && church.latitude && church.longitude) {
                        // Centrer la carte sur l'église
                        mapInstance.flyTo([church.latitude, church.longitude], 16, { duration: 1 });

                        // Ouvrir le drawer avec les détails de l'église
                        setSelectedItem(church);
                        setSelectedType('church');
                        setDetailDrawerOpen(true);
                    }
                } catch (error) {
                    console.error('Error loading church from URL:', error);
                }
            };
            loadChurch();
        }
    }, [searchParams, mapInstance]);

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

    const handleClusterClick = useCallback((clusterId: number, lat: number, lng: number) => {
        if (currentZoom < 10) {
            // High-level zoom steps for server clusters
            setMapCenter([lat, lng]);
            setMapZoom(currentZoom + 2);
        } else {
            const expansionZoom = getClusterExpansionZoom(clusterId);
            setMapCenter([lat, lng]);
            setMapZoom(Math.min(expansionZoom + 1, 18));
        }
    }, [getClusterExpansionZoom, currentZoom]);

    const handleCloseDrawer = useCallback(() => {
        setDetailDrawerOpen(false);
        setSelectedItem(null);
    }, []);

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        // Sauvegarder la position actuelle avant de se déplacer
        if (mapInstance) {
            const currentCenter = mapInstance.getCenter();
            const currentZoom = mapInstance.getZoom();
            setPreviousPosition({
                center: [currentCenter.lat, currentCenter.lng],
                zoom: currentZoom
            });

            // Afficher le bouton retour
            setShowReturnButton(true);

            // Auto-masquer après 10 secondes
            if (returnButtonTimeoutRef.current) {
                clearTimeout(returnButtonTimeoutRef.current);
            }
            returnButtonTimeoutRef.current = setTimeout(() => {
                setShowReturnButton(false);
            }, 10000);
        }

        setMapCenter([lat, lng]);
        setMapZoom(14);
    }, [mapInstance]);

    const handleRecenter = useCallback(() => {
        if (userLocation && mapInstance) {
            mapInstance.flyTo([userLocation.latitude, userLocation.longitude], 13, { duration: 0.5 });
        }
    }, [userLocation, mapInstance]);

    const handleReturnToPrevious = useCallback(() => {
        if (previousPosition && mapInstance) {
            mapInstance.flyTo(previousPosition.center, previousPosition.zoom, { duration: 0.5 });
            setShowReturnButton(false);
            setPreviousPosition(null);

            // Annuler le timeout
            if (returnButtonTimeoutRef.current) {
                clearTimeout(returnButtonTimeoutRef.current);
            }
        }
    }, [previousPosition, mapInstance]);

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
                        onLocationSelect={handleLocationSelect} 
                        // Filters are now shown by default (removed hideFilters)
                     />

                    {(resultsPanelOpen || viewMode === 'participations') && !detailDrawerOpen && (
                        <Box sx={{ position: 'absolute', top: 120, left: 16, bottom: 24, width: 'calc(100% - 32px)', zIndex: 900, pointerEvents: 'none' }}>
                            <Box sx={{ height: '100%', pointerEvents: 'auto', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                                {viewMode === 'participations' ? (
                                    <MyParticipationsSidebar onEventClick={(e) => handleMarkerClick(e, 'event')} />
                                ) : (
                                    <ResultsPanel
                                        onChurchClick={(c) => handleMarkerClick(c, 'church')}
                                        onEventClick={(e) => handleMarkerClick(e, 'event')}
                                        onClose={() => setResultsPanelOpen(false)} open={resultsPanelOpen}
                                        isGeolocated={!!userLocation} isMobileView
                                        currentBounds={currentBounds}
                                        userLocation={userLocation} />
                                )}
                            </Box>
                        </Box>
                    )}

                    <DetailDrawer open={detailDrawerOpen} onClose={handleCloseDrawer} loading={!selectedItem}
                        data={selectedItem} type={selectedType}
                        onOrganizerClick={async (id) => {
                            // D'abord chercher dans les églises locales
                            const c = churches.find(c => String(c.id) === String(id));
                            if (c) {
                                handleMarkerClick(c, 'church');
                            } else {
                                // Si non trouvée, récupérer depuis l'API et centrer la carte
                                try {
                                    const church = await fetchChurchDetails(Number(id));
                                    if (church && church.latitude && church.longitude) {
                                        mapInstance?.flyTo([church.latitude, church.longitude], 16, { duration: 1 });
                                        setSelectedItem(church);
                                        setSelectedType('church');
                                    }
                                } catch (error) {
                                    console.error('Error fetching organizer church:', error);
                                }
                            }
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
                                    // D'abord chercher dans les églises locales
                                    const c = churches.find(c => String(c.id) === String(id));
                                    if (c) {
                                        handleMarkerClick(c, 'church');
                                    } else {
                                        // Si non trouvée, récupérer depuis l'API et centrer la carte
                                        try {
                                            const church = await fetchChurchDetails(Number(id));
                                            if (church && church.latitude && church.longitude) {
                                                mapInstance?.flyTo([church.latitude, church.longitude], 16, { duration: 1 });
                                                setSelectedItem(church);
                                                setSelectedType('church');
                                            }
                                        } catch (error) {
                                            console.error('Error fetching organizer church:', error);
                                        }
                                    }
                                }} />
                        ) : viewMode === 'participations' ? (
                            <MyParticipationsSidebar onEventClick={(e) => handleMarkerClick(e, 'event')} />
                        ) : (
                            <ResultsPanel
                                onChurchClick={(c) => handleMarkerClick(c, 'church')}
                                onEventClick={(e) => handleMarkerClick(e, 'event')}
                                isGeolocated={!!userLocation} isMobileView={false}
                                currentBounds={currentBounds}
                                userLocation={userLocation} />
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
                <MapRefCapture onMapReady={setMapInstance} />


                {userLocation && <UserMarker position={[userLocation.latitude, userLocation.longitude]} />}

                <CanvasLayer
                    clusters={finalClusters}
                    selectedId={selectedItem?.id || null}
                    selectedType={selectedType}
                    showChurches={showChurches}
                    showEvents={showEvents}
                    participations={participations}
                    onMarkerClick={handleMarkerClick}
                    onClusterClick={handleClusterClick}
                />
            </MapContainer>

            {/* Bouton Retour flottant - apparaît après une recherche de lieu */}
            {showReturnButton && previousPosition && (
                <Box
                    onClick={handleReturnToPrevious}
                    sx={{
                        position: 'absolute',
                        bottom: 24,
                        left: isMobile ? 16 : 432,
                        zIndex: 1000,
                        bgcolor: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        animation: 'slideIn 0.3s ease',
                        '@keyframes slideIn': {
                            from: { opacity: 0, transform: 'translateY(20px)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                        },
                        '&:hover': {
                            bgcolor: '#F8F9FA',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            transform: 'scale(1.02)'
                        }
                    }}
                >
                    <UndoIcon sx={{ color: '#1A73E8', fontSize: 20 }} />
                    <Box component="span" sx={{ color: '#1A73E8', fontWeight: 500, fontSize: '0.875rem' }}>
                        Retour
                    </Box>
                </Box>
            )}

            <Box sx={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', alignItems: 'flex-end', gap: 1.5, zIndex: 1000 }}>
                {/* 1. Layer Switcher (Sitting to the left) - Google Maps style with real map thumbnails */}
                <Box
                    onClick={() => setMapType(mapType === 'satellite' ? 'standard' : 'satellite')}
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                            transform: 'scale(1.02)'
                        },
                        // Show the alternative map type as preview
                        backgroundImage: mapType === 'satellite'
                            ? 'url(https://tile.openstreetmap.org/10/525/367.png)' // Plan preview (Paris area)
                            : 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/367/525)', // Satellite preview
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <Box sx={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
                        fontSize: '0.7rem', fontWeight: 500, textAlign: 'center', py: 0.5,
                        backdropFilter: 'blur(2px)'
                    }}>
                        {mapType === 'satellite' ? 'Plan' : 'Satellite'}
                    </Box>
                </Box>

                {/* 2. Action Buttons Stack (Right) - Google Maps Style */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    
                    {/* My Location - Square Button */}
                    {userLocation && (
                        <Tooltip title="Ma position" placement="left">
                            <Box sx={{ 
                                bgcolor: 'white', width: 40, height: 40, borderRadius: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                '&:hover': { bgcolor: '#F8F8F8' } 
                            }} onClick={handleRecenter}>
                                <MyLocationIcon sx={{ color: '#666' }} />
                            </Box>
                        </Tooltip>
                    )}

                    {/* Zoom Controls - Stacked Square Buttons */}
                    <Box sx={{ my: 0.5 }}>
                        <ZoomControls mapRef={mapInstance} />
                    </Box>

                    {/* Other Actions - Square Buttons */}
                    <Tooltip title="Mes participations" placement="left">
                        <Box sx={{ 
                            bgcolor: 'white', width: 40, height: 40, borderRadius: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                            '&:hover': { bgcolor: '#F8F8F8' }
                        }} onClick={() => navigate('/my-participations')}>
                            <Badge badgeContent={participations.size} color="error" max={99}>
                                <EventIcon sx={{ color: participations.size > 0 ? '#EA4335' : '#666' }} />
                            </Badge>
                        </Box>
                    </Tooltip>

                    <Tooltip title="Accueil" placement="left">
                        <Box sx={{ 
                            bgcolor: 'white', width: 40, height: 40, borderRadius: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                            '&:hover': { bgcolor: '#F8F8F8' }
                        }} onClick={() => navigate('/')}>
                            <HomeIcon sx={{ color: '#666' }} />
                        </Box>
                    </Tooltip>
                </Box>
            </Box>
        </React.Fragment>
    );
};

export default HomePage;
