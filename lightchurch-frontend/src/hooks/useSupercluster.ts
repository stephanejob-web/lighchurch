import { useMemo, useRef, useCallback } from 'react';
import Supercluster from 'supercluster';
import type { Church, Event } from '../types/publicMap';

export interface ClusterProperties {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string;
    // Compteurs par type dans le cluster
    churchCount?: number;
    eventCount?: number;
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
    const { radius = 80, maxZoom = 18, minZoom = 0 } = options;

    // Ref pour l'index combiné
    const indexRef = useRef<Supercluster<ClusterProperties, ClusterProperties> | null>(null);

    // Combiner églises et événements en un seul array de features
    const combinedFeatures = useMemo((): ClusterPoint[] => {
        const churchFeatures: ClusterPoint[] = churches.map(church => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [church.longitude, church.latitude] as [number, number]
            },
            properties: {
                cluster: false,
                itemId: church.id,
                itemType: 'church' as const,
                item: church,
                churchCount: 1,
                eventCount: 0
            }
        }));

        const eventFeatures: ClusterPoint[] = events.map(event => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [event.longitude, event.latitude] as [number, number]
            },
            properties: {
                cluster: false,
                itemId: event.id,
                itemType: 'event' as const,
                item: event,
                churchCount: 0,
                eventCount: 1
            }
        }));

        return [...churchFeatures, ...eventFeatures];
    }, [churches, events]);

    // Créer l'index Supercluster combiné avec map/reduce pour agréger les compteurs
    useMemo(() => {
        const index = new Supercluster({
            radius,
            maxZoom,
            minZoom,
            minPoints: 2,
            // Map: extraire les propriétés de chaque point pour l'agrégation
            map: (props: any) => ({
                churchCount: props.churchCount || 0,
                eventCount: props.eventCount || 0
            }),
            // Reduce: agréger les compteurs lors du clustering
            reduce: (accumulated: any, props: any) => {
                accumulated.churchCount = (accumulated.churchCount || 0) + (props.churchCount || 0);
                accumulated.eventCount = (accumulated.eventCount || 0) + (props.eventCount || 0);
            }
        });
        index.load(combinedFeatures as any);
        indexRef.current = index as any;
    }, [combinedFeatures, radius, maxZoom, minZoom]);

    // Récupérer les clusters visibles
    const clusters = useMemo(() => {
        if (!indexRef.current || !bounds) return [];

        const bbox: [number, number, number, number] = [
            bounds.west,
            bounds.south,
            bounds.east,
            bounds.north
        ];

        try {
            return indexRef.current.getClusters(bbox, Math.floor(zoom));
        } catch (e) {
            console.error('Error getting clusters:', e);
            return [];
        }
    }, [bounds, zoom, combinedFeatures]);

    // Fonction pour obtenir le zoom d'expansion d'un cluster
    const getClusterExpansionZoom = useCallback((clusterId: number) => {
        if (!indexRef.current) return zoom + 1;

        try {
            return indexRef.current.getClusterExpansionZoom(clusterId);
        } catch (e) {
            return zoom + 1;
        }
    }, [zoom]);

    return {
        clusters,
        getClusterExpansionZoom,
        totalChurches: churches.length,
        totalEvents: events.length
    };
}
