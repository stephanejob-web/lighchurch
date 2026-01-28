import { useMemo, useRef, useCallback } from 'react';
import Supercluster from 'supercluster';
import type { Church, Event } from '../types/publicMap';

export interface ClusterProperties {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string;
    // Pour les points individuels
    itemId?: number;
    itemType?: 'church' | 'event';
    item?: Church | Event;
}

export interface ClusterPoint {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
    properties: ClusterProperties;
}

interface UseSuperclusterOptions {
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
}

interface Bounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export function useSupercluster(
    churches: Church[],
    events: Event[],
    bounds: Bounds | null,
    zoom: number,
    options: UseSuperclusterOptions = {}
) {
    // Paramètres optimisés pour 10,000+ marqueurs
    const { radius = 100, maxZoom = 18, minZoom = 0 } = options;

    // Créer les index supercluster pour églises et événements
    const churchIndexRef = useRef<Supercluster<ClusterProperties, ClusterProperties> | null>(null);
    const eventIndexRef = useRef<Supercluster<ClusterProperties, ClusterProperties> | null>(null);

    // Convertir les églises en GeoJSON features
    const churchFeatures = useMemo((): ClusterPoint[] => {
        return churches.map(church => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [church.longitude, church.latitude] as [number, number]
            },
            properties: {
                cluster: false,
                itemId: church.id,
                itemType: 'church' as const,
                item: church
            }
        }));
    }, [churches]);

    // Convertir les événements en GeoJSON features
    const eventFeatures = useMemo((): ClusterPoint[] => {
        return events.map(event => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [event.longitude, event.latitude] as [number, number]
            },
            properties: {
                cluster: false,
                itemId: event.id,
                itemType: 'event' as const,
                item: event
            }
        }));
    }, [events]);

    // Créer/mettre à jour l'index des églises
    useMemo(() => {
        const index = new Supercluster<ClusterProperties, ClusterProperties>({
            radius,
            maxZoom,
            minZoom,
            minPoints: 2, // Force clustering dès 2 points
        });
        index.load(churchFeatures as any);
        churchIndexRef.current = index;
    }, [churchFeatures, radius, maxZoom, minZoom]);

    // Créer/mettre à jour l'index des événements
    useMemo(() => {
        const index = new Supercluster<ClusterProperties, ClusterProperties>({
            radius,
            maxZoom,
            minZoom,
            minPoints: 2, // Force clustering dès 2 points
        });
        index.load(eventFeatures as any);
        eventIndexRef.current = index;
    }, [eventFeatures, radius, maxZoom, minZoom]);

    // Récupérer les clusters visibles pour les églises
    const churchClusters = useMemo(() => {
        if (!churchIndexRef.current || !bounds) return [];

        const bbox: [number, number, number, number] = [
            bounds.west,
            bounds.south,
            bounds.east,
            bounds.north
        ];

        try {
            return churchIndexRef.current.getClusters(bbox, Math.floor(zoom));
        } catch (e) {
            console.error('Error getting church clusters:', e);
            return [];
        }
    }, [bounds, zoom, churchFeatures]);

    // Récupérer les clusters visibles pour les événements
    const eventClusters = useMemo(() => {
        if (!eventIndexRef.current || !bounds) return [];

        const bbox: [number, number, number, number] = [
            bounds.west,
            bounds.south,
            bounds.east,
            bounds.north
        ];

        try {
            return eventIndexRef.current.getClusters(bbox, Math.floor(zoom));
        } catch (e) {
            console.error('Error getting event clusters:', e);
            return [];
        }
    }, [bounds, zoom, eventFeatures]);

    // Fonction pour obtenir les enfants d'un cluster
    const getClusterExpansionZoom = useCallback((clusterId: number, type: 'church' | 'event') => {
        const index = type === 'church' ? churchIndexRef.current : eventIndexRef.current;
        if (!index) return zoom + 1;

        try {
            return index.getClusterExpansionZoom(clusterId);
        } catch (e) {
            return zoom + 1;
        }
    }, [zoom]);

    return {
        churchClusters,
        eventClusters,
        getClusterExpansionZoom,
        totalChurches: churches.length,
        totalEvents: events.length
    };
}
