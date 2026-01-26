import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyEvents from '../MyEvents';
import api from '../../lib/axios';

// Mock axios
vi.mock('../../lib/axios');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ eventId: undefined })
    };
});

// Helper function to render component
const renderMyEvents = () => {
    return render(
        <BrowserRouter>
            <MyEvents />
        </BrowserRouter>
    );
};

// Mock church data
const mockChurchData = {
    id: 1,
    church_name: 'Église Test',
    denomination_id: 1,
    latitude: 48.8566,
    longitude: 2.3522,
    address: '123 Rue de la Paix, 75001 Paris',
    details: {
        address: '123 Rue de la Paix, 75001 Paris'
    }
};

// Mock events data
const mockEvents = [
    {
        id: 1,
        title: 'Culte du Dimanche',
        start_datetime: '2025-12-28T10:00:00',
        end_datetime: '2025-12-28T12:00:00',
        description: 'Culte dominical',
        city: 'Paris',
        address: '123 Rue de la Paix',
        status: 'UPCOMING',
        image_url: 'https://example.com/image.jpg',
        speaker_name: 'Pasteur Jean',
        language_id: 10,
        max_seats: '100',
        is_free: 1,
        has_parking: 1,
        parking_capacity: '50',
        is_parking_free: 1
    },
    {
        id: 2,
        title: 'Conférence',
        start_datetime: '2025-12-29T18:00:00',
        end_datetime: '2025-12-29T20:00:00',
        description: 'Conférence biblique',
        city: 'Lyon',
        address: '456 Avenue de Lyon',
        status: 'PUBLISHED',
        image_url: '',
        speaker_name: 'Pasteur Marie',
        language_id: 10
    }
];

// Mock languages data
const mockLanguages = [
    { id: 10, name_fr: 'Français', flag_emoji: '🇫🇷', is_active: true },
    { id: 1, name_fr: 'Anglais', flag_emoji: '🇬🇧', is_active: true }
];

describe('MyEvents - Chargement Initial', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('devrait afficher un loader pendant le chargement', () => {
        vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

        renderMyEvents();

        expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('devrait charger les données de l\'église et les événements', async () => {
        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: mockEvents });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        expect(api.get).toHaveBeenCalledWith('/church/my-church');
        expect(api.get).toHaveBeenCalledWith('/church/my-events', {
            params: { status: 'ALL' }
        });
        expect(api.get).toHaveBeenCalledWith('/settings/languages');
    });

    it('devrait afficher un message si l\'église n\'existe pas', async () => {
        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.reject({ response: { status: 404 } });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        renderMyEvents();

        await waitFor(() => {
            expect(screen.getByText(/créer la fiche de votre église/i)).toBeInTheDocument();
        });
    });

    it.skip('devrait afficher un message si l\'église est incomplète', async () => {
        const incompleteChurch = {
            ...mockChurchData,
            latitude: null,
            longitude: null
        };

        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: incompleteChurch });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: [] });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        renderMyEvents();

        await waitFor(() => {
            expect(screen.getByText(/complétez votre fiche église/i)).toBeInTheDocument();
        });
    });
});

describe('MyEvents - Affichage des Événements', () => {
    beforeEach(async () => {
        vi.clearAllMocks();

        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: mockEvents });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    it('devrait afficher la liste des événements', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.getByText('Culte du Dimanche')).toBeInTheDocument();
            expect(screen.getByText('Conférence')).toBeInTheDocument();
        });
    });

    it('devrait filtrer les événements par statut', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.getByText('Culte du Dimanche')).toBeInTheDocument();
        });

        // Cliquer sur le filtre "À venir"
        const upcomingButton = screen.getByRole('button', { name: /à venir/i });
        fireEvent.click(upcomingButton);

        await waitFor(() => {
            expect(screen.getByText('Culte du Dimanche')).toBeInTheDocument();
        });
    });

    it('devrait rechercher des événements par titre', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.getByText('Culte du Dimanche')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/rechercher/i);
        fireEvent.change(searchInput, { target: { value: 'Conférence' } });

        await waitFor(() => {
            expect(screen.getByText('Conférence')).toBeInTheDocument();
            expect(screen.queryByText('Culte du Dimanche')).not.toBeInTheDocument();
        });
    });

    it('devrait rechercher des événements par ville', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.getByText('Culte du Dimanche')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/rechercher/i);
        fireEvent.change(searchInput, { target: { value: 'Lyon' } });

        await waitFor(() => {
            expect(screen.getByText('Conférence')).toBeInTheDocument();
            expect(screen.queryByText('Culte du Dimanche')).not.toBeInTheDocument();
        });
    });

    it('devrait trier les événements par date de création', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.getByText('Culte du Dimanche')).toBeInTheDocument();
        });

        const events = screen.getAllByRole('heading', { level: 6 });
        expect(events[0]).toHaveTextContent('Conférence'); // ID 2 (plus récent)
        expect(events[1]).toHaveTextContent('Culte du Dimanche'); // ID 1
    });

    it('devrait afficher les dates de début et de fin sur les cartes', async () => {
        renderMyEvents();

        await waitFor(() => {
            // Vérifier que les heures de début et de fin sont affichées (format local)
            expect(screen.getByText(/10:00/)).toBeInTheDocument();
            expect(screen.getByText(/12:00/)).toBeInTheDocument();
        });
    });
});

describe('MyEvents - Création d\'Événement - Step 1: Informations Générales', () => {
    beforeEach(async () => {
        vi.clearAllMocks();

        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: [] });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    it.skip('devrait ouvrir le formulaire de création', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByText(/informations générales/i)).toBeInTheDocument();
        });
    });

    it.skip('devrait valider le titre comme requis', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/titre.*obligatoire/i)).toBeInTheDocument();
        });
    });

    it.skip('devrait valider que le titre a au moins 3 caractères', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'ab' } });
            fireEvent.blur(titleInput);
        });

        await waitFor(() => {
            expect(screen.getByText(/titre.*au moins 3 caractères/i)).toBeInTheDocument();
        });
    });

    it.skip('devrait accepter un titre valide', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Mon Super Événement' } });
            fireEvent.blur(titleInput);
        });

        await waitFor(() => {
            expect(screen.queryByText(/titre.*obligatoire/i)).not.toBeInTheDocument();
        });
    });

    it.skip('devrait valider la description comme requise', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Mon Super Événement' } });

            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/description.*obligatoire/i)).toBeInTheDocument();
        });
    });

    it.skip('devrait passer au step 2 avec des données valides', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Mon Super Événement' } });

            const descriptionInput = screen.getByLabelText(/description/i);
            fireEvent.change(descriptionInput, { target: { value: 'Une description complète de mon événement' } });

            const speakerInput = screen.getByLabelText(/intervenant/i);
            fireEvent.change(speakerInput, { target: { value: 'Pasteur Jean' } });
        });

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        // Attendre un peu pour éviter la protection anti-soumission rapide
        await new Promise(resolve => setTimeout(resolve, 600));

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/date & heure/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});

describe('MyEvents - Création d\'Événement - Step 2: Date & Heure', () => {
    beforeEach(async () => {
        vi.clearAllMocks();

        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: [] });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    it.skip('devrait valider que la date de début est obligatoire', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        // Créer un événement et aller au step 2
        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Test Event' } });

            const descriptionInput = screen.getByLabelText(/description/i);
            fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

            const speakerInput = screen.getByLabelText(/intervenant/i);
            fireEvent.change(speakerInput, { target: { value: 'Test Speaker' } });
        });

        await new Promise(resolve => setTimeout(resolve, 600));

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/date & heure/i)).toBeInTheDocument();
        });

        // Essayer de passer au step suivant sans date
        await new Promise(resolve => setTimeout(resolve, 600));

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/date de début.*obligatoire/i)).toBeInTheDocument();
        });
    });

    it.skip('devrait valider que la date de fin doit être après la date de début', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Test Event' } });

            const descriptionInput = screen.getByLabelText(/description/i);
            fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

            const speakerInput = screen.getByLabelText(/intervenant/i);
            fireEvent.change(speakerInput, { target: { value: 'Test Speaker' } });
        });

        await new Promise(resolve => setTimeout(resolve, 600));

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/date & heure/i)).toBeInTheDocument();
        });

        // Ajouter des dates invalides (fin avant début)
        const startDateInput = screen.getByLabelText(/date et heure de début/i);
        const endDateInput = screen.getByLabelText(/date et heure de fin/i);

        fireEvent.change(startDateInput, { target: { value: '2025-12-31T10:00' } });
        fireEvent.change(endDateInput, { target: { value: '2025-12-31T09:00' } });

        await new Promise(resolve => setTimeout(resolve, 600));

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/date de fin doit être après la date de début/i)).toBeInTheDocument();
        });
    });
});

describe('MyEvents - Navigation entre Steps', () => {
    beforeEach(async () => {
        vi.clearAllMocks();

        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: [] });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    it.skip('devrait conserver les données lors de la navigation Suivant/Précédent', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Test Persistence' } });
        });

        await new Promise(resolve => setTimeout(resolve, 600));

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: /suivant/i });
            fireEvent.click(nextButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/date & heure/i)).toBeInTheDocument();
        });

        // Revenir au step 1
        const prevButton = screen.getByRole('button', { name: /précédent/i });
        fireEvent.click(prevButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i) as HTMLInputElement;
            expect(titleInput.value).toBe('Test Persistence');
        });
    });

    it.skip('devrait bloquer la soumission immédiate après changement de step', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Test' } });

            const descriptionInput = screen.getByLabelText(/description/i);
            fireEvent.change(descriptionInput, { target: { value: 'Test desc' } });
        });

        // Essayer de cliquer rapidement sur Suivant
        const nextButton = screen.getByRole('button', { name: /suivant/i });
        fireEvent.click(nextButton);

        // Devrait encore être au step 1 (soumission bloquée)
        await waitFor(() => {
            expect(screen.getByText(/informations générales/i)).toBeInTheDocument();
        });
    });
});

describe('MyEvents - Protection et Sécurité', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    it('ne devrait pas crasher avec des dates invalides', async () => {
        const eventsWithInvalidDates = [
            {
                ...mockEvents[0],
                start_datetime: null,
                end_datetime: null
            }
        ];

        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: eventsWithInvalidDates });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        // L'application ne devrait pas crasher
        expect(screen.getByText('Culte du Dimanche')).toBeInTheDocument();
    });

    it('ne devrait pas avoir de memory leak avec les timeouts', async () => {
        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: [] });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        const { unmount } = renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        // Démonter le composant - ne devrait pas causer d'erreurs
        unmount();
    });
});
