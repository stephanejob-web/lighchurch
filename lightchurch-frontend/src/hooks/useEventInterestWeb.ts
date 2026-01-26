import { useState, useCallback, useEffect } from 'react';
import api from '../lib/axios';

const DEVICE_KEY = 'light_church:device_id';
const INTERESTED_KEY = 'light_church:interested_events';

function getOrCreateDeviceId(): string {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
        id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        try { localStorage.setItem(DEVICE_KEY, id); } catch { /* ignore */ }
    }
    return id!;
}

function readLocalInterested(): Record<string, number> {
    try {
        const raw = localStorage.getItem(INTERESTED_KEY);
        if (!raw) return {};
        return JSON.parse(raw) as Record<string, number>;
    } catch {
        return {};
    }
}

function writeLocalInterested(data: Record<string, number>) {
    try { localStorage.setItem(INTERESTED_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export default function useEventInterestWeb(eventId: number, initialInterested = false, initialCount?: number) {
    const [isInterested, setIsInterested] = useState<boolean>(() => {
        const local = readLocalInterested();
        return local[String(eventId)] !== undefined ? true : initialInterested;
    });
    const [interestedCount, setInterestedCount] = useState<number | undefined>(initialCount);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        // sync initialCount when provided
        if (initialCount !== undefined) setInterestedCount(initialCount);
    }, [initialCount]);

    const toggle = useCallback(async () => {
        const device_id = getOrCreateDeviceId();
        const idStr = String(eventId);

        // optimistic update
        const prevInterested = isInterested;
        const prevCount = interestedCount;

        setIsPending(true);
        setIsInterested(!prevInterested);
        if (prevCount !== undefined) setInterestedCount(prevInterested ? prevCount - 1 : prevCount + 1);

        try {
            if (prevInterested) {
                await api.delete(`/public/events/${eventId}/interest`, { params: { device_id } });
                // remove local
                const local = readLocalInterested();
                delete local[idStr];
                writeLocalInterested(local);
                // notify same-tab listeners that interests changed
                try { window.dispatchEvent(new CustomEvent('light_church:interests_updated', { detail: { eventId, interested: false } })); } catch {}
            } else {
                const res = await api.post(`/public/events/${eventId}/interest`, { device_id });
                // server may return interested_count
                if (res?.data?.interested_count !== undefined) {
                    setInterestedCount(res.data.interested_count);
                }
                const local = readLocalInterested();
                local[idStr] = Date.now();
                writeLocalInterested(local);
                // notify same-tab listeners that interests changed
                try { window.dispatchEvent(new CustomEvent('light_church:interests_updated', { detail: { eventId, interested: true } })); } catch {}
            }
        } catch (err) {
            // revert
            setIsInterested(prevInterested);
            setInterestedCount(prevCount);
            // rethrow for caller handling
            throw err;
        } finally {
            setIsPending(false);
        }
    }, [eventId, isInterested, interestedCount]);

    return { isInterested, interestedCount, isPending, toggle, getOrCreateDeviceId };
}
