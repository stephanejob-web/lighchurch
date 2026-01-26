import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyEvents from '../MyEvents';
import api from '../../lib/axios';

vi.mock('../../lib/axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ eventId: undefined })
    };
});

const renderMyEvents = () => render(
    <BrowserRouter>
        <MyEvents />
    </BrowserRouter>
);

const mockChurchData = {
    id: 1,
    church_name: 'Église Test',
    denomination_id: 1,
    latitude: 48.8566,
    longitude: 2.3522,
    address: '123 Rue de la Paix, 75001 Paris',
    details: { address: '123 Rue de la Paix, 75001 Paris' }
};

const mockLanguages = [
    { id: 10, name_fr: 'Français', flag_emoji: '🇫🇷', is_active: true }
];

describe('MyEvents - Use Church Address', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(api.get).mockImplementation((url: string) => {
            if (url === '/church/my-church') return Promise.resolve({ data: mockChurchData });
            if (url === '/church/my-events') return Promise.resolve({ data: [] });
            if (url === '/settings/languages') return Promise.resolve({ data: mockLanguages });
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    it('préremplit latitude/longitude quand on coche la case', async () => {
        renderMyEvents();

        await waitFor(() => expect(screen.queryByText('Chargement...')).not.toBeInTheDocument());

        // Ouvrir le formulaire
        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        // Attendre que le formulaire soit affiché (rechercher le bouton Suivant)
        await waitFor(() => expect(screen.getByRole('button', { name: /suivant/i })).toBeInTheDocument());

        // Remplir step 1
        fireEvent.change(screen.getByLabelText(/titre de l'événement/i), { target: { value: 'Evénement Test' } });
        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });
        fireEvent.change(screen.getByLabelText(/intervenant/i), { target: { value: 'Pasteur' } });
        await new Promise(r => setTimeout(r, 600));

        // Passer au step 2 et remplir dates
        fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
        await waitFor(() => expect(screen.getByText(/date & heure/i)).toBeInTheDocument());
        fireEvent.change(screen.getByLabelText(/date et heure de début/i), { target: { value: '2025-12-31T10:00' } });
        fireEvent.change(screen.getByLabelText(/date et heure de fin/i), { target: { value: '2025-12-31T12:00' } });
        await new Promise(r => setTimeout(r, 600));

        // Passer au step 3
        fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
        await waitFor(() => expect(screen.getByText(/lieu & localisation/i)).toBeInTheDocument());

        // Cocher la case
        const checkbox = screen.getByLabelText(/utiliser l'adresse de l'église/i);
        fireEvent.click(checkbox);

        // Vérifier que les coords ont été préremplies
        await waitFor(() => {
            expect((screen.getByLabelText(/latitude/i) as HTMLInputElement).value).toBe(String(mockChurchData.latitude));
            expect((screen.getByLabelText(/longitude/i) as HTMLInputElement).value).toBe(String(mockChurchData.longitude));
        });
    });
});
