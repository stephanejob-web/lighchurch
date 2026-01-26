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

// Mock data
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
        language_id: 10
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
        speaker_name: 'Pasteur Marie',
        language_id: 10
    }
];

const mockLanguages = [
    { id: 10, name_fr: 'Français', flag_emoji: '🇫🇷', is_active: true },
    { id: 1, name_fr: 'Anglais', flag_emoji: '🇬🇧', is_active: true }
];

describe('MyEvents - Chargement et Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.skip('devrait charger sans boucle infinie (pas de re-renders)', async () => {
        let renderCount = 0;

        vi.mocked(api.get).mockImplementation((url) => {
            renderCount++;
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
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        });

        // Les 3 appels API doivent avoir été faits exactement une fois
        expect(renderCount).toBeLessThan(10); // Pas de boucle infinie
    });

    it.skip('devrait filtrer efficacement les événements (performance)', async () => {
        const manyEvents = Array.from({ length: 100 }, (_, i) => ({
            id: i,
            title: `Événement ${i}`,
            start_datetime: '2025-12-28T10:00:00',
            end_datetime: '2025-12-28T12:00:00',
            description: 'Description',
            city: i % 2 === 0 ? 'Paris' : 'Lyon',
            status: 'UPCOMING',
            speaker_name: 'Speaker',
            language_id: 10
        }));

        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: manyEvents });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        const startTime = performance.now();

        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/rechercher/i);
        fireEvent.change(searchInput, { target: { value: 'Paris' } });

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Le filtrage devrait être rapide même avec 100 événements
        expect(renderTime).toBeLessThan(5000); // Moins de 5 secondes
    });

    it('ne devrait pas crasher avec des données invalides', async () => {
        const invalidEvents = [
            {
                id: 1,
                title: 'Event sans dates',
                start_datetime: null,
                end_datetime: null,
                city: null,
                status: 'UPCOMING'
            }
        ];

        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: invalidEvents });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        });

        // L'application ne devrait pas crasher
        expect(screen.getByText('Event sans dates')).toBeInTheDocument();
    });
});

describe('MyEvents - Soumission d\'Événement (Pastor)', () => {
    beforeEach(() => {
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

    it.skip('devrait créer un événement avec succès (POST)', async () => {
        const mockPost = vi.fn().mockResolvedValue({ data: { id: 1 } });
        vi.mocked(api.post).mockImplementation(mockPost);
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

        // Spy sur window.alert
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        });

        // Ouvrir le formulaire
        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByText(/informations générales/i)).toBeInTheDocument();
        });

        // Remplir le formulaire (Step 1)
        const titleInput = screen.getByLabelText(/titre de l'événement/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const speakerInput = screen.getByLabelText(/intervenant/i);

        fireEvent.change(titleInput, { target: { value: 'Nouveau Culte' } });
        fireEvent.change(descriptionInput, { target: { value: 'Description du culte' } });
        fireEvent.change(speakerInput, { target: { value: 'Pasteur Test' } });

        // Attendre le délai anti-spam
        await new Promise(resolve => setTimeout(resolve, 600));

        // Passer au step 2
        let nextButton = screen.getByRole('button', { name: /suivant/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/date & heure/i)).toBeInTheDocument();
        });

        // Remplir les dates (Step 2)
        const startDateInput = screen.getByLabelText(/date et heure de début/i);
        const endDateInput = screen.getByLabelText(/date et heure de fin/i);

        fireEvent.change(startDateInput, { target: { value: '2025-12-31T10:00' } });
        fireEvent.change(endDateInput, { target: { value: '2025-12-31T12:00' } });

        await new Promise(resolve => setTimeout(resolve, 600));

        // Passer au step 3
        nextButton = screen.getByRole('button', { name: /suivant/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/lieu & localisation/i)).toBeInTheDocument();
        }, { timeout: 5000 });

        await new Promise(resolve => setTimeout(resolve, 600));

        // Passer au step 4
        nextButton = screen.getByRole('button', { name: /suivant/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/options & détails/i)).toBeInTheDocument();
        }, { timeout: 5000 });

        await new Promise(resolve => setTimeout(resolve, 600));

        // Passer au récapitulatif (step 5)
        nextButton = screen.getByRole('button', { name: /suivant/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/récapitulatif/i)).toBeInTheDocument();
        }, { timeout: 5000 });

        await new Promise(resolve => setTimeout(resolve, 600));

        // Soumettre
        const submitButton = screen.getByRole('button', { name: /créer l'événement/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith(
                '/church/events',
                expect.objectContaining({
                    title: 'Nouveau Culte',
                    description: 'Description du culte',
                    speaker_name: 'Pasteur Test'
                })
            );
        }, { timeout: 5000 });

        expect(alertSpy).toHaveBeenCalledWith('Événement créé avec succès !');

        alertSpy.mockRestore();
    });

    it.skip('devrait mettre à jour un événement existant (PUT)', async () => {
        const mockPut = vi.fn().mockResolvedValue({ data: { id: 1 } });
        const eventToEdit = { ...mockEvents[0], id: 1 };

        vi.mocked(api.put).mockImplementation(mockPut);
        vi.mocked(api.get).mockImplementation((url) => {
            if (url === '/church/my-church') {
                return Promise.resolve({ data: mockChurchData });
            }
            if (url === '/church/my-events') {
                return Promise.resolve({ data: [eventToEdit] });
            }
            if (url.startsWith('/church/events/')) {
                return Promise.resolve({ data: eventToEdit });
            }
            if (url === '/settings/languages') {
                return Promise.resolve({ data: mockLanguages });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        renderMyEvents();

        await waitFor(() => {
            expect(screen.getByText('Culte du Dimanche')).toBeInTheDocument();
        });

        // Cliquer sur le menu de l'événement
        const menuButtons = screen.getAllByRole('button', { name: '' });
        const eventMenuButton = menuButtons.find(btn =>
            btn.querySelector('[data-testid="MoreVertIcon"]')
        );

        if (eventMenuButton) {
            fireEvent.click(eventMenuButton);

            await waitFor(() => {
                const modifierMenuItem = screen.getByText(/modifier/i);
                fireEvent.click(modifierMenuItem);
            });

            await waitFor(() => {
                expect(screen.getByText(/informations générales/i)).toBeInTheDocument();
            });

            // Modifier le titre
            const titleInput = screen.getByLabelText(/titre de l'événement/i) as HTMLInputElement;
            expect(titleInput.value).toBe('Culte du Dimanche');

            fireEvent.change(titleInput, { target: { value: 'Culte Modifié' } });

            // Naviguer jusqu'au récapitulatif
            await new Promise(resolve => setTimeout(resolve, 600));
            fireEvent.click(screen.getByRole('button', { name: /suivant/i }));

            await waitFor(() => {
                expect(screen.getByText(/date & heure/i)).toBeInTheDocument();
            });

            await new Promise(resolve => setTimeout(resolve, 600));
            fireEvent.click(screen.getByRole('button', { name: /suivant/i }));

            await waitFor(() => {
                expect(screen.getByText(/lieu & localisation/i)).toBeInTheDocument();
            });

            await new Promise(resolve => setTimeout(resolve, 600));
            fireEvent.click(screen.getByRole('button', { name: /suivant/i }));

            await waitFor(() => {
                expect(screen.getByText(/options & détails/i)).toBeInTheDocument();
            });

            await new Promise(resolve => setTimeout(resolve, 600));
            fireEvent.click(screen.getByRole('button', { name: /suivant/i }));

            await waitFor(() => {
                expect(screen.getByText(/récapitulatif/i)).toBeInTheDocument();
            });

            await new Promise(resolve => setTimeout(resolve, 600));

            // Soumettre la modification
            const submitButton = screen.getByRole('button', { name: /modifier l'événement/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockPut).toHaveBeenCalledWith(
                    '/church/events/1',
                    expect.objectContaining({
                        title: 'Culte Modifié'
                    })
                );
            }, { timeout: 5000 });

            expect(alertSpy).toHaveBeenCalledWith('Événement mis à jour avec succès !');
        }

        alertSpy.mockRestore();
    });
});

describe('MyEvents - Gestion d\'Erreurs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('devrait gérer les erreurs réseau (500)', async () => {
        vi.mocked(api.get).mockRejectedValue({
            response: { status: 500, data: { message: 'Erreur serveur' } }
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        });

        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it.skip('devrait afficher une erreur si la soumission échoue', async () => {
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

        vi.mocked(api.post).mockRejectedValue({
            response: {
                status: 400,
                data: {
                    message: 'Validation échouée',
                    errors: { title: 'Titre invalide' }
                }
            }
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Test' } });

            const descriptionInput = screen.getByLabelText(/description/i);
            fireEvent.change(descriptionInput, { target: { value: 'Test desc' } });

            const speakerInput = screen.getByLabelText(/intervenant/i);
            fireEvent.change(speakerInput, { target: { value: 'Speaker' } });
        });

        // Naviguer rapidement jusqu'au submit
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 600));
            const buttons = screen.queryAllByRole('button', { name: /suivant|créer/i });
            if (buttons.length > 0) {
                fireEvent.click(buttons[0]);
            }
        }

        await waitFor(() => {
            expect(screen.queryByText(/titre invalide/i)).toBeInTheDocument();
        }, { timeout: 10000 });

        alertSpy.mockRestore();
    });

    it('devrait nettoyer les timeouts lors du démontage', async () => {
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
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        });

        // Démonter le composant - ne devrait pas causer d'erreurs ou de warnings
        expect(() => unmount()).not.toThrow();
    });
});

describe('MyEvents - Validation Avancée', () => {
    beforeEach(() => {
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

    it.skip('devrait valider le format des URLs YouTube', async () => {
        renderMyEvents();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        });

        const createButton = screen.getByRole('button', { name: /nouvel événement/i });
        fireEvent.click(createButton);

        // Aller au step 4 (Options)
        await waitFor(() => {
            const titleInput = screen.getByLabelText(/titre de l'événement/i);
            fireEvent.change(titleInput, { target: { value: 'Test Event' } });

            const descriptionInput = screen.getByLabelText(/description/i);
            fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

            const speakerInput = screen.getByLabelText(/intervenant/i);
            fireEvent.change(speakerInput, { target: { value: 'Test Speaker' } });
        });

        // Naviguer jusqu'au step 4
        for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 600));
            fireEvent.click(screen.getByRole('button', { name: /suivant/i }));
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        await waitFor(() => {
            expect(screen.getByText(/options & détails/i)).toBeInTheDocument();
        }, { timeout: 10000 });

        // Tester URL YouTube invalide
        const youtubeLiveInputs = screen.getAllByPlaceholderText(/https:\/\/youtube/i);
        if (youtubeLiveInputs.length > 0) {
            fireEvent.change(youtubeLiveInputs[0], { target: { value: 'https://example.com/video' } });
            fireEvent.blur(youtubeLiveInputs[0]);

            await waitFor(() => {
                expect(screen.getByText(/lien youtube.*valide/i)).toBeInTheDocument();
            });
        }
    });
});
