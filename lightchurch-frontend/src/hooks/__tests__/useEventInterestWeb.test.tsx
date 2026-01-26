import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import useEventInterestWeb from '../useEventInterestWeb';
import api from '../../lib/axios';

vi.mock('../../lib/axios');

function TestComponent({ eventId, initialCount }: { eventId: number; initialCount?: number }) {
    const { isInterested, interestedCount, isPending, toggle } = useEventInterestWeb(eventId, false, initialCount);

    return (
        <div>
            <div data-testid="is">{String(isInterested)}</div>
            <div data-testid="count">{interestedCount !== undefined ? String(interestedCount) : ''}</div>
            <div data-testid="pending">{String(isPending)}</div>
            <button onClick={() => { toggle().catch(() => {}); }}>toggle</button>
        </div>
    );
}

describe('useEventInterestWeb', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('optimistic toggle: POST then DELETE updates localStorage and counts', async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ data: { interested_count: 5 } });
        vi.mocked(api.delete).mockResolvedValueOnce({});

        render(<TestComponent eventId={1} initialCount={2} />);

        expect(screen.getByTestId('is').textContent).toBe('false');
        expect(screen.getByTestId('count').textContent).toBe('2');

        // Click to participate
        fireEvent.click(screen.getByText('toggle'));

        await waitFor(() => expect(screen.getByTestId('is').textContent).toBe('true'));
        await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('5'));

        // Check localStorage updated
        const raw = localStorage.getItem('light_church:interested_events');
        expect(raw).not.toBeNull();
        const parsed = JSON.parse(raw as string);
        expect(parsed['1']).toBeDefined();

        // Click to un-participate
        fireEvent.click(screen.getByText('toggle'));

        await waitFor(() => expect(screen.getByTestId('is').textContent).toBe('false'));
        await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('4'));

        const raw2 = localStorage.getItem('light_church:interested_events');
        const parsed2 = raw2 ? JSON.parse(raw2) : {};
        expect(parsed2['1']).toBeUndefined();
    });
});
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import useEventInterestWeb from '../useEventInterestWeb';
import api from '../../lib/axios';

vi.mock('../../lib/axios');

function TestComponent({ eventId, initialCount }: { eventId: number; initialCount?: number }) {
    const { isInterested, interestedCount, isPending, toggle } = useEventInterestWeb(eventId, false, initialCount);

    return (
        <div>
            <div data-testid="is">{String(isInterested)}</div>
            <div data-testid="count">{interestedCount !== undefined ? String(interestedCount) : ''}</div>
            <div data-testid="pending">{String(isPending)}</div>
            <button onClick={() => { toggle().catch(() => {}); }}>toggle</button>
        </div>
    );
}

describe('useEventInterestWeb', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('optimistic toggle: POST then DELETE updates localStorage and counts', async () => {
        vi.mocked(api.post).mockResolvedValueOnce({ data: { interested_count: 5 } });
        vi.mocked(api.delete).mockResolvedValueOnce({});

        render(<TestComponent eventId={1} initialCount={2} />);

        expect(screen.getByTestId('is').textContent).toBe('false');
        expect(screen.getByTestId('count').textContent).toBe('2');

        // Click to participate
        fireEvent.click(screen.getByText('toggle'));

        await waitFor(() => expect(screen.getByTestId('is').textContent).toBe('true'));
        await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('5'));

        // Check localStorage updated
        const raw = localStorage.getItem('light_church:interested_events');
        expect(raw).not.toBeNull();
        const parsed = JSON.parse(raw as string);
        expect(parsed['1']).toBeDefined();

        // Click to un-participate
        fireEvent.click(screen.getByText('toggle'));

        await waitFor(() => expect(screen.getByTestId('is').textContent).toBe('false'));
        await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('4'));

        const raw2 = localStorage.getItem('light_church:interested_events');
        const parsed2 = raw2 ? JSON.parse(raw2) : {};
        expect(parsed2['1']).toBeUndefined();
    });
});
