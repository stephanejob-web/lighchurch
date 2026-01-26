import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Alert,
    Grid,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    InputAdornment,
    Menu,
    ListItemIcon,
    ListItemText,
    Stepper,
    Step,
    StepLabel,
    Divider,
    Chip,
    Stack,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Pagination,
    Tooltip,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Event as EventIcon,
    LocationOn as LocationOnIcon,
    Image as ImageIcon,
    YouTube as YouTubeIcon,
    Church as ChurchIcon,
    ArrowBack as ArrowBackIcon,
    MoreVert as MoreVertIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Description as DescriptionIcon,
    CalendarMonth as CalendarMonthIcon,
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    NavigateNext as NavigateNextIcon,
    NavigateBefore as NavigateBeforeIcon,
    Info as InfoIcon,
    ViewModule as ViewModuleIcon,
    ViewList as ViewListIcon,
    Schedule as ScheduleIcon,
    PlayCircle as PlayCircleIcon,
    Search as SearchIcon,
    AccessTime as AccessTimeIcon,
    Sort as SortIcon,
    DateRange as DateRangeIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import AddressAutocomplete from '../components/AddressAutocomplete';
import DateTimeInput from '../components/DateTimeInput';
import { geocodeAddress } from '../services/geoService';

interface EventFormData {
    title: string;
    start_datetime: string;
    end_datetime: string;
    description: string;
    latitude: string;
    longitude: string;
    address: string;
    street_number: string;
    street_name: string;
    postal_code: string;
    city: string;
    speaker_name: string;
    language_id: string;
    translation_language_ids: number[];
    max_seats: string;
    image_url: string;
    is_free: number;
    registration_link: string;
    has_parking: number;
    parking_capacity: string;
    is_parking_free: number;
    parking_details: string;
    youtube_live: string;
    status: string;
    is_all_day: boolean;
    cancellation_reason?: string;
    cancelled_at?: string;
    cancelled_by?: number;
}

interface EventData extends EventFormData {
    id: number;
    interested_count?: number;
}

const initialFormState: EventFormData = {
    title: '',
    start_datetime: '',
    end_datetime: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    street_number: '',
    street_name: '',
    postal_code: '',
    city: '',
    speaker_name: '',
    language_id: '10',
    translation_language_ids: [],
    max_seats: '',
    image_url: '',
    is_free: 1,
    registration_link: '',
    has_parking: 0,
    parking_capacity: '',
    is_parking_free: 1,
    parking_details: '',
    youtube_live: '',
    status: 'PUBLISHED',
    is_all_day: false
};

export default function MyEvents() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const isAdminMode = !!eventId;

    const [events, setEvents] = useState<EventData[]>([]);
    const [showForm, setShowForm] = useState(isAdminMode);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(eventId ? parseInt(eventId) : null);
    const [activeStep, setActiveStep] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [formData, setFormData] = useState<EventFormData>(initialFormState);
    const [useChurchAddress, setUseChurchAddress] = useState<boolean>(false);
    const [, setChurchData] = useState<any | null>(null);
    const [dateError, setDateError] = useState('');
    const [hasChurch, setHasChurch] = useState<boolean | null>(null);
    const [isChurchComplete, setIsChurchComplete] = useState<boolean>(false);
    const [languages, setLanguages] = useState<any[]>([]);
    const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; eventId: number } | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelEventId, setCancelEventId] = useState<number | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [eventStatus, setEventStatus] = useState<string>('');
    const [showReactivateButton, setShowReactivateButton] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'created' | 'event_date'>('created'); // Sort by creation date by default
    const itemsPerPage = 9; // 9 events per page (3x3 grid)

    // État pour le décompte temps réel (utilisé pour forcer le re-render toutes les minutes)
    const [, setCurrentTime] = useState(new Date());

    // Mise à jour du temps chaque minute pour le décompte
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    // Fonction pour calculer le temps restant
    const getRemainingTime = (endDatetime: string | null | undefined): { text: string; totalMinutes: number } | null => {
        if (!endDatetime) return null;

        const end = new Date(endDatetime);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const totalMinutes = Math.floor(diff / (1000 * 60));

        let text = '';
        if (hours > 0) {
            text = `Fin dans ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
        } else if (minutes > 0) {
            text = `Fin dans ${minutes} min`;
        } else {
            text = 'Se termine maintenant';
        }

        return { text, totalMinutes };
    };

    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

    // Confirmation dialog state
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
    const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
    const [confirmDialogOnConfirm, setConfirmDialogOnConfirm] = useState<(() => void) | null>(null);

    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Protection contre la soumission immédiate après changement de step
    const [lastStepChangeTime, setLastStepChangeTime] = useState<number>(0);

    // Ref to store timeouts for cleanup
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    // Stepper configuration
    const steps = useMemo(() => [
        { label: 'Informations générales', icon: <DescriptionIcon /> },
        { label: 'Date & Heure', icon: <CalendarMonthIcon /> },
        { label: 'Lieu & Localisation', icon: <LocationOnIcon /> },
        { label: 'Options & Détails', icon: <SettingsIcon /> },
        { label: 'Récapitulatif', icon: <VisibilityIcon /> }
    ], []);

    // Custom StepIcon component (mémorisé pour éviter les remontages)
    const CustomStepIcon = useCallback(({ index, icon }: { index: number; icon: React.ReactNode }) => {
        return (
            <Box
                sx={{
                    width: { xs: 36, sm: 48 },
                    height: { xs: 36, sm: 48 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: activeStep === index ? 'primary.main' : activeStep > index ? 'success.main' : 'action.disabledBackground',
                    color: activeStep >= index ? 'white' : 'text.disabled',
                    transition: 'all 0.3s ease',
                    boxShadow: activeStep === index ? 4 : 0
                }}
            >
                {activeStep > index ? <CheckCircleIcon /> : icon}
            </Box>
        );
    }, [activeStep]);

    // Validation functions
    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.trim().length === 0) {
            newErrors.title = 'Le titre est obligatoire';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'Le titre doit contenir au moins 3 caractères';
        }

        if (!formData.speaker_name || formData.speaker_name.trim().length === 0) {
            newErrors.speaker_name = 'L\'intervenant est obligatoire';
        }

        if (!formData.description || formData.description.trim().length === 0) {
            newErrors.description = 'La description est obligatoire';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'La description doit contenir au moins 10 caractères';
        } else if (formData.description.trim().length > 50000) {
            newErrors.description = 'La description ne doit pas dépasser 50 000 caractères';
        }

        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.start_datetime) {
            newErrors.start_datetime = 'La date de début est obligatoire';
        }

        if (!formData.end_datetime) {
            newErrors.end_datetime = 'La date de fin est obligatoire';
        }

        if (formData.start_datetime && formData.end_datetime) {
            const startDate = new Date(formData.start_datetime);
            const endDate = new Date(formData.end_datetime);
            if (endDate <= startDate) {
                newErrors.end_datetime = 'La date de fin doit être après la date de début';
            }
        }

        if (!formData.language_id) {
            newErrors.language_id = 'La langue principale est obligatoire';
        }

        return newErrors;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};

        if (useChurchAddress) {
            if (!formData.address || formData.address.trim().length === 0) {
                newErrors.address = 'L\'adresse de l\'église est manquante';
            }
            if (!formData.latitude || !formData.longitude) {
                newErrors.address = 'Les coordonnées GPS de l\'église sont manquantes';
            }
            return newErrors;
        }

        if (!formData.address || formData.address.trim().length === 0) {
            newErrors.address = 'L\'adresse est obligatoire';
        }

        if (!formData.latitude || !formData.longitude) {
            newErrors.address = 'Veuillez sélectionner une adresse valide avec coordonnées GPS';
        }

        return newErrors;
    };

    const validateStep4 = () => {
        const newErrors: Record<string, string> = {};

        // Validation optionnelle mais si rempli, doit être valide
        if (formData.max_seats && (isNaN(parseInt(formData.max_seats)) || parseInt(formData.max_seats) <= 0)) {
            newErrors.max_seats = 'Le nombre de places doit être un nombre positif';
        }

        if (formData.youtube_live && formData.youtube_live.trim().length > 0) {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(formData.youtube_live)) {
                newErrors.youtube_live = 'Le lien YouTube doit être une URL valide (commençant par http:// ou https://)';
            }
        }

        if (formData.is_free === 0 && formData.registration_link && formData.registration_link.trim().length > 0) {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(formData.registration_link)) {
                newErrors.registration_link = 'Le lien billetterie doit être une URL valide';
            }
        }

        if (formData.has_parking === 1 && formData.parking_capacity && (isNaN(parseInt(formData.parking_capacity)) || parseInt(formData.parking_capacity) <= 0)) {
            newErrors.parking_capacity = 'La capacité du parking doit être un nombre positif';
        }

        return newErrors;
    };

    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 0:
                return Object.keys(validateStep1()).length === 0;
            case 1:
                return Object.keys(validateStep2()).length === 0;
            case 2:
                return Object.keys(validateStep3()).length === 0;
            case 3:
                return Object.keys(validateStep4()).length === 0;
            case 4:
                return true; // Récapitulatif, toujours valide
            default:
                return false;
        }
    };

    // Helper functions for Snackbar and Confirmation Dialog
    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
        setConfirmDialogTitle(title);
        setConfirmDialogMessage(message);
        setConfirmDialogOnConfirm(() => onConfirm);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
    };

    const handleConfirmDialogConfirm = () => {
        if (confirmDialogOnConfirm) {
            confirmDialogOnConfirm();
        }
        setConfirmDialogOpen(false);
    };

    const handleNext = () => {
        // Validate current step before proceeding
        let stepErrors = {};
        switch (activeStep) {
            case 0:
                stepErrors = validateStep1();
                break;
            case 1:
                stepErrors = validateStep2();
                break;
            case 2:
                stepErrors = validateStep3();
                break;
            case 3:
                stepErrors = validateStep4();
                break;
        }

        if (Object.keys(stepErrors).length === 0) {
            setErrors({});
            const newStep = activeStep + 1;
            setActiveStep(newStep);
            setLastStepChangeTime(Date.now()); // Enregistrer le moment du changement
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setErrors(stepErrors);
            // Mark all fields as touched to show errors
            const touchedFields: Record<string, boolean> = {};
            Object.keys(stepErrors).forEach(key => {
                touchedFields[key] = true;
            });
            setTouched(prev => ({ ...prev, ...touchedFields }));
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFieldBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    useEffect(() => {
        const loadLanguages = async () => {
            try {
                const { data } = await api.get('/settings/languages');
                setLanguages(Array.isArray(data) ? data.filter((lang: any) => lang.is_active) : []);
            } catch (err) {
                console.error('Failed to load languages:', err);
                setLanguages([]);
            }
        };
        loadLanguages();
    }, []);

    /**
     * Calcule le statut dynamique d'un événement basé sur les dates
     */
    const calculateEventStatus = useCallback((event: { cancelled_at?: string | null; start_datetime: string; end_datetime: string }): string => {
        // Si l'événement est annulé, retourner CANCELLED
        if (event.cancelled_at) {
            return 'CANCELLED';
        }

        const now = new Date();
        const startDate = new Date(event.start_datetime);
        const endDate = new Date(event.end_datetime);

        // Si la date de fin est passée
        if (now > endDate) {
            return 'COMPLETED';
        }

        // Si l'événement est en cours (entre start et end)
        if (now >= startDate && now <= endDate) {
            return 'ONGOING';
        }

        // Si l'événement est à venir
        if (now < startDate) {
            return 'UPCOMING';
        }

        return 'UPCOMING';
    }, []);

    const loadEventForEdit = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/events/${id}`);
            // Detect if the event is all-day based on times (00:00 to 23:59)
            const isAllDay = data.start_datetime && data.end_datetime
                ? isAllDayEvent(data.start_datetime, data.end_datetime)
                : false;

            setFormData({
                ...initialFormState,
                ...data,
                start_datetime: data.start_datetime ? new Date(data.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: data.end_datetime ? new Date(data.end_datetime).toISOString().slice(0, 16) : '',
                language_id: data.language_id ? data.language_id.toString() : '10',
                translation_language_ids: data.translation_language_ids || [],
                has_parking: data.has_parking ? 1 : 0,
                is_parking_free: data.is_parking_free ? 1 : 0,
                is_free: data.is_free ? 1 : 0,
                is_all_day: isAllDay
            });

            // Calculer le statut de l'événement
            const status = calculateEventStatus({
                cancelled_at: data.cancelled_at,
                start_datetime: data.start_datetime,
                end_datetime: data.end_datetime
            });

            setEventStatus(status);

            // Déterminer le mode d'affichage
            if (status === 'COMPLETED') {
                // Événements terminés : lecture seule
                setIsReadOnly(true);
                setShowReactivateButton(false);
            } else if (status === 'CANCELLED') {
                // Événements annulés : afficher le bouton de réactivation
                setIsReadOnly(true);
                setShowReactivateButton(true);
            } else {
                // Événements à venir ou en cours : mode édition
                setIsReadOnly(false);
                setShowReactivateButton(false);
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            showSnackbar("Impossible de charger l'événement", 'error');
            setLoading(false);
        }
    }, [calculateEventStatus]);

    const checkChurchAndEvents = useCallback(async () => {
        setLoading(true);
        try {
            try {
                const { data } = await api.get('/church/my-church');
                setHasChurch(true);
                const isComplete = Boolean(
                    data.church_name &&
                    data.denomination_id &&
                    (data.latitude !== null && data.latitude !== undefined && data.latitude !== '') &&
                    (data.longitude !== null && data.longitude !== undefined && data.longitude !== '') &&
                    (data.details?.address || data.address)
                );
                setIsChurchComplete(isComplete);
            } catch (err: unknown) {
                const error = err as { response?: { status?: number } };
                if (error.response && error.response.status === 404) {
                    setHasChurch(false);
                    setIsChurchComplete(false);
                    setLoading(false);
                    return;
                }
            }
            // ✅ OPTIMISÉ: Filtrage backend par statut
            const response = await api.get('/church/my-events', {
                params: {
                    status: statusFilter // Envoyer le filtre de statut au backend
                }
            });
            setEvents(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]); // ✅ Ajouter statusFilter comme dépendance

    useEffect(() => {
        if (isAdminMode && eventId) {
            loadEventForEdit(parseInt(eventId));
        } else {
            checkChurchAndEvents();
        }
    }, [isAdminMode, eventId, loadEventForEdit, checkChurchAndEvents]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [id]: checked ? 1 : 0 }));
    };

    const handleEdit = async (id: number, readOnlyMode = false) => {
        try {
            const { data } = await api.get(`/church/events/${id}`);

            // Detect if the event is all-day based on times (00:00 to 23:59)
            const isAllDay = data.start_datetime && data.end_datetime
                ? isAllDayEvent(data.start_datetime, data.end_datetime)
                : false;

            setFormData({
                ...initialFormState,
                ...data,
                start_datetime: data.start_datetime ? new Date(data.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: data.end_datetime ? new Date(data.end_datetime).toISOString().slice(0, 16) : '',
                has_parking: data.has_parking ? 1 : 0,
                is_parking_free: data.is_parking_free ? 1 : 0,
                is_free: data.is_free ? 1 : 0,
                is_all_day: isAllDay
            });
            setEditingId(id);
            setIsReadOnly(readOnlyMode);
            setShowForm(true);
            setActiveStep(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            showSnackbar("Impossible de charger l'événement", 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ne soumettre que si on est au dernier step (Récapitulatif)
        if (activeStep !== steps.length - 1) {
            return;
        }

        // Bloquer la soumission si le step vient juste de changer (protection contre les événements en cascade)
        const timeSinceStepChange = Date.now() - lastStepChangeTime;
        if (timeSinceStepChange < 500) {
            return;
        }

        setLoading(true);
        try {
            // Exclude status and cancellation fields as they're computed server-side
            const { status, cancellation_reason, cancelled_at, cancelled_by, ...eventData } = formData;

            const payload = {
                ...eventData,
                language_id: parseInt(formData.language_id) || 10,
                translation_language_ids: formData.translation_language_ids || [],
                latitude: parseFloat(formData.latitude) || 0,
                longitude: parseFloat(formData.longitude) || 0,
                has_parking: formData.has_parking === 1,
                is_parking_free: formData.is_parking_free === 1,
                is_free: formData.is_free === 1,
                max_seats: formData.max_seats ? parseInt(formData.max_seats as string) : null,
                parking_capacity: formData.parking_capacity ? parseInt(formData.parking_capacity as string) : null,
                registration_link: formData.registration_link || undefined,
                youtube_live: formData.youtube_live || undefined,
                street_number: formData.street_number || undefined,
                street_name: formData.street_name || undefined,
                postal_code: formData.postal_code || undefined,
                city: formData.city || undefined
            };

            if (isAdminMode) {
                await api.put(`/admin/events/${editingId}`, payload);
                showSnackbar('Événement mis à jour avec succès !', 'success');
                const timeoutId = setTimeout(() => navigate('/dashboard/admin/events'), 1500);
                timeoutsRef.current.push(timeoutId);
            } else {
                const churchRes = await api.get('/church/my-church');
                const churchId = churchRes.data.id;
                if (!churchId) {
                    showSnackbar("Veuillez d'abord créer votre fiche église.", 'warning');
                    setLoading(false);
                    return;
                }
                const pastorPayload = { ...payload, church_id: churchId };
                if (editingId) {
                    await api.put(`/church/events/${editingId}`, pastorPayload);
                    showSnackbar('Événement mis à jour avec succès !', 'success');
                } else {
                    await api.post('/church/events', pastorPayload);
                    showSnackbar('Événement créé avec succès !', 'success');
                }
                setShowForm(false);
                setEditingId(null);
                setFormData(initialFormState);
                setActiveStep(0);
                setIsReadOnly(false);
                checkChurchAndEvents();
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { errors?: Array<{ field: string; message: string }> } } };
            console.error('Erreur complète:', err);
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
                showSnackbar(`Erreurs de validation: ${errorMessages}`, 'error');
            } else {
                showSnackbar('Erreur lors de la création', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCancelDialog = (eventId: number) => {
        setCancelEventId(eventId);
        setCancellationReason('');
        setMenuAnchor(null);
        setCancelDialogOpen(true);
    };

    const handleCancelEvent = async () => {
        if (!cancelEventId || !cancellationReason.trim() || cancellationReason.trim().length < 10) {
            showSnackbar('Le motif d\'annulation doit contenir au moins 10 caractères', 'error');
            return;
        }

        try {
            setLoading(true);
            await api.post(`/church/events/${cancelEventId}/cancel`, {
                cancellation_reason: cancellationReason.trim()
            });
            showSnackbar('Événement annulé avec succès !', 'success');
            setCancelDialogOpen(false);
            setCancelEventId(null);
            setCancellationReason('');
            checkChurchAndEvents();
        } catch (err: any) {
            console.error('Erreur lors de l\'annulation:', err);
            showSnackbar(err.response?.data?.message || 'Erreur lors de l\'annulation de l\'événement', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReactivateEvent = async (eventId?: number) => {
        const targetEventId = eventId || editingId;

        if (!targetEventId) return;

        showConfirmDialog(
            'Confirmer la réactivation',
            'Voulez-vous vraiment réactiver cet événement ?',
            async () => {
                try {
                    setLoading(true);
                    setMenuAnchor(null);

                    // Utiliser l'endpoint admin si on est en mode admin (editing), sinon utiliser l'endpoint church
                    const endpoint = editingId && !eventId
                        ? `/admin/events/${targetEventId}/reactivate`
                        : `/church/events/${targetEventId}/reactivate`;

                    await api.post(endpoint);
                    showSnackbar('Événement réactivé avec succès !', 'success');

                    // Si on édite l'événement, recharger les données
                    if (editingId && !eventId) {
                        await loadEventForEdit(targetEventId);
                    } else {
                        // Sinon, recharger la liste des événements
                        checkChurchAndEvents();
                    }
                } catch (err: any) {
                    console.error('Erreur lors de la réactivation:', err);
                    showSnackbar(err.response?.data?.message || 'Erreur lors de la réactivation de l\'événement', 'error');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    // ✅ OPTIMISÉ: Filtre seulement par recherche (le statut est déjà filtré par le backend)
    const filteredEvents = useMemo(() => {
        return events
            .filter(event => {
                if (!searchQuery.trim()) return true;
                const query = searchQuery.toLowerCase();
                return (
                    event.title?.toLowerCase().includes(query) ||
                    event.city?.toLowerCase().includes(query) ||
                    event.description?.toLowerCase().includes(query) ||
                    event.address?.toLowerCase().includes(query)
                );
            })
            .sort((a, b) => {
                if (sortBy === 'created') {
                    // Sort by ID in descending order (newest events first)
                    return b.id - a.id;
                } else {
                    // Sort by start_datetime in ascending order (closest event first)
                    try {
                        const dateStrA = a.start_datetime?.replace?.(' ', 'T') || '';
                        const dateStrB = b.start_datetime?.replace?.(' ', 'T') || '';
                        if (!dateStrA || !dateStrB) return 0;
                        const dateA = new Date(dateStrA);
                        const dateB = new Date(dateStrB);
                        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                        return dateA.getTime() - dateB.getTime();
                    } catch {
                        return 0;
                    }
                }
            });
    }, [events, searchQuery, sortBy]); // ✅ statusFilter retiré car filtrage backend

    // Pagination logic (memoized for performance)
    const totalPages = useMemo(
        () => Math.ceil(filteredEvents.length / itemsPerPage),
        [filteredEvents.length, itemsPerPage]
    );

    const paginatedEvents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredEvents.slice(startIndex, endIndex);
    }, [filteredEvents, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper function to check if event is all-day
    const isAllDayEvent = (startDateTime: string | null | undefined, endDateTime: string | null | undefined) => {
        if (!startDateTime || !endDateTime) return false;
        try {
            const startTime = startDateTime.split('T')[1] || startDateTime.split(' ')[1];
            const endTime = endDateTime.split('T')[1] || endDateTime.split(' ')[1];
            return startTime?.startsWith('00:00') && endTime?.startsWith('23:59');
        } catch {
            return false;
        }
    };

    // Helper function to get relative time
    const getRelativeTime = (dateTimeString: string | null | undefined) => {
        if (!dateTimeString) return 'Date inconnue';
        try {
            const dateStr = typeof dateTimeString === 'string'
                ? dateTimeString.replace(' ', 'T')
                : String(dateTimeString);
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Date invalide';
            return formatDistanceToNow(date, {
                addSuffix: true,
                locale: fr
            });
        } catch {
            return 'Date invalide';
        }
    };

    // Step content renderers
    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <DescriptionIcon sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Informations Générales
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Donnez les informations de base de votre événement
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    id="title"
                                    fullWidth
                                    required
                                    label="Titre de l'événement"
                                    value={formData.title}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (touched.title) {
                                            const stepErrors = validateStep1();
                                            setErrors(prev => ({ ...prev, title: stepErrors.title || '' }));
                                        }
                                    }}
                                    onBlur={() => handleFieldBlur('title')}
                                    error={touched.title && !!errors.title}
                                    helperText={touched.title && errors.title ? errors.title : "Le titre principal qui apparaîtra sur la plateforme"}
                                    placeholder="Ex: Culte de Louange, Conférence Biblique..."
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    id="speaker_name"
                                    fullWidth
                                    required
                                    label="Intervenant / Speaker"
                                    value={formData.speaker_name}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (touched.speaker_name) {
                                            const stepErrors = validateStep1();
                                            setErrors(prev => ({ ...prev, speaker_name: stepErrors.speaker_name || '' }));
                                        }
                                    }}
                                    onBlur={() => handleFieldBlur('speaker_name')}
                                    error={touched.speaker_name && !!errors.speaker_name}
                                    helperText={touched.speaker_name && errors.speaker_name ? errors.speaker_name : "Le nom de la personne qui interviendra"}
                                    placeholder="Ex: Pasteur Jean Dupont"
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    id="description"
                                    fullWidth
                                    required
                                    multiline
                                    rows={5}
                                    label="Description détaillée"
                                    value={formData.description}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (touched.description) {
                                            const stepErrors = validateStep1();
                                            setErrors(prev => ({ ...prev, description: stepErrors.description || '' }));
                                        }
                                    }}
                                    onBlur={() => handleFieldBlur('description')}
                                    error={touched.description && !!errors.description}
                                    helperText={
                                        touched.description && errors.description
                                            ? errors.description
                                            : (() => {
                                                const charCount = formData.description.length;
                                                const wordCount = formData.description.trim() ? formData.description.trim().split(/\s+/).length : 0;
                                                const charLimit = 50000;
                                                const percentage = (charCount / charLimit) * 100;
                                                const colorStyle = percentage > 90 ? '#d32f2f' : percentage > 75 ? '#ed6c02' : '#5F6368';
                                                return (
                                                    <span>
                                                        <span style={{ color: colorStyle, fontWeight: percentage > 90 ? 500 : 400 }}>
                                                            {charCount.toLocaleString()} / {charLimit.toLocaleString()} caractères
                                                        </span>
                                                        {' • '}
                                                        <span style={{ color: '#5F6368' }}>
                                                            {wordCount.toLocaleString()} mot{wordCount > 1 ? 's' : ''}
                                                        </span>
                                                    </span>
                                                );
                                            })()
                                    }
                                    placeholder="Décrivez votre événement : thème, programme, public visé..."
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    id="image_url"
                                    fullWidth
                                    label={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            Image de couverture (URL)
                                            <Tooltip
                                                title={
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                            Comment mettre votre image en ligne ?
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                                            1. Téléchargez votre image sur un service gratuit :
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', ml: 2, mb: 0.5 }}>
                                                            • ImgBB (imgbb.com) - Recommandé
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', ml: 2, mb: 0.5 }}>
                                                            • Imgur (imgur.com)
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', ml: 2, mb: 1 }}>
                                                            • Postimages (postimages.org)
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block' }}>
                                                            2. Copiez le lien direct de l'image
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block' }}>
                                                            3. Collez le lien dans ce champ
                                                        </Typography>
                                                    </Box>
                                                }
                                                arrow
                                                placement="right"
                                            >
                                                <InfoIcon sx={{ fontSize: 18, color: 'primary.main', cursor: 'help' }} />
                                            </Tooltip>
                                        </Box>
                                    }
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="https://exemple.com/image.jpg"
                                    helperText="Lien vers une image qui représente votre événement"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {formData.image_url ? (
                                                    <Box
                                                        component="img"
                                                        src={formData.image_url}
                                                        alt="Preview"
                                                        sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                                                    />
                                                ) : (
                                                    <ImageIcon sx={{ color: 'text.secondary' }} />
                                                )}
                                            </InputAdornment>
                                        ),
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <CalendarMonthIcon sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Date & Heure
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Planifiez votre événement et définissez les langues
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.is_all_day}
                                        onChange={(e) => {
                                            const isAllDay = e.target.checked;
                                            setFormData(prev => {
                                                const newData = { ...prev, is_all_day: isAllDay };

                                                // Si "toute la journée" est coché, ajuster les heures
                                                if (isAllDay && prev.start_datetime) {
                                                    // Garder la date mais mettre l'heure à 00:00
                                                    const startDate = prev.start_datetime.split('T')[0] || prev.start_datetime.split(' ')[0];
                                                    const endDate = prev.end_datetime ? (prev.end_datetime.split('T')[0] || prev.end_datetime.split(' ')[0]) : startDate;
                                                    newData.start_datetime = `${startDate}T00:00`;
                                                    newData.end_datetime = `${endDate}T23:59`;
                                                }

                                                return newData;
                                            });
                                        }}
                                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary', mb: 0.5 }}>
                                            Événement toute la journée
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'grey.700', fontWeight: 500 }}>
                                            L'événement se déroule sur une ou plusieurs journées complètes (00:00 à 23:59)
                                        </Typography>
                                    </Box>
                                }
                                sx={{
                                    bgcolor: 'rgba(33, 150, 243, 0.08)',
                                    p: 2,
                                    borderRadius: 2,
                                    border: 1,
                                    borderColor: formData.is_all_day ? 'primary.main' : 'grey.300',
                                    m: 0,
                                    width: '100%',
                                    transition: 'all 0.3s'
                                }}
                            />
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <DateTimeInput
                                    label={formData.is_all_day ? "Date de début" : "Date et heure de début"}
                                    value={formData.start_datetime}
                                    onChange={(value) => {
                                        // Si "toute la journée", ajouter T00:00 si seulement la date
                                        const finalValue = formData.is_all_day && !value.includes('T')
                                            ? `${value}T00:00`
                                            : value;
                                        setFormData(prev => ({ ...prev, start_datetime: finalValue }));
                                        if (formData.end_datetime && finalValue && new Date(finalValue) >= new Date(formData.end_datetime)) {
                                            setDateError('La date de fin doit être après la date de début');
                                        } else {
                                            setDateError('');
                                        }
                                    }}
                                    required
                                    dateOnly={formData.is_all_day}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <DateTimeInput
                                    label={formData.is_all_day ? "Date de fin" : "Date et heure de fin"}
                                    value={formData.end_datetime}
                                    onChange={(value) => {
                                        // Si "toute la journée", ajouter T23:59 si seulement la date
                                        const finalValue = formData.is_all_day && !value.includes('T')
                                            ? `${value}T23:59`
                                            : value;
                                        setFormData(prev => ({ ...prev, end_datetime: finalValue }));
                                        if (formData.start_datetime && finalValue && new Date(finalValue) <= new Date(formData.start_datetime)) {
                                            setDateError('La date de fin doit être après la date de début');
                                        } else {
                                            setDateError('');
                                        }
                                    }}
                                    required
                                    minDateTime={formData.start_datetime}
                                    error={dateError}
                                    dateOnly={formData.is_all_day}
                                />
                            </Grid>
                        </Grid>

                        {dateError && (
                            <Alert severity="error" icon={<InfoIcon />}>
                                {dateError}
                            </Alert>
                        )}

                        <Divider sx={{ my: 2 }}>
                            <Chip label="Langues" />
                        </Divider>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Langue principale du speaker</InputLabel>
                                    <Select
                                        id="language_id"
                                        value={formData.language_id}
                                        label="Langue principale du speaker"
                                        onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                                    >
                                        {languages.map(lang => (
                                            <MenuItem key={lang.id} value={lang.id.toString()}>
                                                {lang.flag_emoji} {lang.name_fr}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        Dans quelle langue l'intervenant parlera-t-il ?
                                    </FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Traductions disponibles (optionnel)</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.translation_language_ids}
                                        label="Traductions disponibles (optionnel)"
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            translation_language_ids: e.target.value as number[]
                                        })}
                                        renderValue={(selected) =>
                                            languages
                                                .filter(l => selected.includes(l.id))
                                                .map(l => `${l.flag_emoji} ${l.name_fr}`)
                                                .join(', ')
                                        }
                                    >
                                        {languages
                                            .filter(l => l.id.toString() !== formData.language_id)
                                            .map(lang => (
                                                <MenuItem key={lang.id} value={lang.id}>
                                                    <Checkbox checked={formData.translation_language_ids.includes(lang.id)} />
                                                    {lang.flag_emoji} {lang.name_fr}
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                    <FormHelperText>
                                        Y aura-t-il des traductions simultanées ?
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <LocationOnIcon sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Lieu & Localisation
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Indiquez où se déroulera l'événement
                            </Typography>
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={useChurchAddress}
                                    onChange={async (e) => {
                                        const checked = e.target.checked;
                                        setUseChurchAddress(checked);
                                        if (checked) {
                                            try {
                                                const { data } = await api.get('/church/my-church');
                                                setChurchData(data);
                                                const addr = data.details?.address || data.address || '';
                                                const street_number = data.details?.street_number || data.street_number || '';
                                                const street_name = data.details?.street_name || data.street_name || '';
                                                const postal_code = data.details?.postal_code || data.postal_code || '';
                                                const city = data.details?.city || data.city || '';

                                                let lat = data.latitude;
                                                let lon = data.longitude;
                                                if ((!lat || !lon) && addr) {
                                                    const geo = await geocodeAddress(addr);
                                                    if (geo) {
                                                        lat = geo.latitude;
                                                        lon = geo.longitude;
                                                    }
                                                }

                                                setFormData(prev => ({
                                                    ...prev,
                                                    address: addr,
                                                    street_number: street_number || prev.street_number,
                                                    street_name: street_name || prev.street_name,
                                                    postal_code: postal_code || prev.postal_code,
                                                    city: city || prev.city,
                                                    latitude: lat ? String(lat) : prev.latitude,
                                                    longitude: lon ? String(lon) : prev.longitude
                                                }));
                                                setErrors(prev => ({ ...prev, address: '' }));
                                            } catch (err) {
                                                console.error('Failed to load church address:', err);
                                                setUseChurchAddress(false);
                                                setChurchData(null);
                                                showSnackbar('Impossible de récupérer l\'adresse de l\'église', 'error');
                                            }
                                        } else {
                                            setChurchData(null);
                                        }
                                    }}
                                />
                            }
                            label="Utiliser l'adresse de l'église"
                        />

                        {touched.address && errors.address ? (
                            <Alert severity="error" icon={<InfoIcon />}>
                                {errors.address}
                            </Alert>
                        ) : (
                            <Alert severity="info" icon={<InfoIcon />}>
                                Utilisez la recherche d'adresse ci-dessous. Les coordonnées GPS seront automatiquement calculées.
                            </Alert>
                        )}

                        {!useChurchAddress && (
                            <AddressAutocomplete
                                defaultValue={formData.address || ''}
                                onAddressSelect={(addressData) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        address: addressData.full_address,
                                        street_number: addressData.street_number,
                                        street_name: addressData.street_name,
                                        postal_code: addressData.postal_code,
                                        city: addressData.city,
                                        latitude: addressData.latitude.toString(),
                                        longitude: addressData.longitude.toString()
                                    }));
                                    setErrors(prev => ({ ...prev, address: '' }));
                                    setTouched(prev => ({ ...prev, address: true }));
                                }}
                            />
                        )}

                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Adresse décomposée
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="N°"
                                        value={formData.street_number}
                                        InputProps={{ readOnly: true }}
                                        placeholder="Auto"
                                    />
                                </Grid>
                                <Grid size={{ xs: 9 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Rue"
                                        value={formData.street_name}
                                        InputProps={{ readOnly: true }}
                                        placeholder="Auto-rempli"
                                    />
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Code Postal"
                                        value={formData.postal_code}
                                        InputProps={{ readOnly: true }}
                                        placeholder="Auto"
                                    />
                                </Grid>
                                <Grid size={{ xs: 8 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Ville"
                                        value={formData.city}
                                        InputProps={{ readOnly: true }}
                                        placeholder="Auto-remplie"
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: 2, border: 1, borderColor: 'primary.light' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Coordonnées GPS (auto-calculées)
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Latitude"
                                        value={formData.latitude}
                                        InputProps={{
                                            readOnly: true,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationOnIcon fontSize="small" color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        placeholder="Auto-calculé"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Longitude"
                                        value={formData.longitude}
                                        InputProps={{
                                            readOnly: true,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationOnIcon fontSize="small" color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        placeholder="Auto-calculé"
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Divider sx={{ my: 2 }}>
                            <Chip label="Parking" />
                        </Divider>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.has_parking === 1}
                                    onChange={(e) => handleCheckboxChange('has_parking', e.target.checked)}
                                />
                            }
                            label="Ce lieu dispose d'un parking"
                        />

                        {formData.has_parking === 1 && (
                            <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            id="parking_capacity"
                                            fullWidth
                                            type="number"
                                            label="Capacité du parking"
                                            value={formData.parking_capacity}
                                            onChange={handleChange}
                                            placeholder="Nombre de places"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            id="parking_details"
                                            fullWidth
                                            label="Informations d'accès"
                                            value={formData.parking_details}
                                            onChange={handleChange}
                                            placeholder="Code, entrée, indications..."
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.is_parking_free === 1}
                                                    onChange={(e) => handleCheckboxChange('is_parking_free', e.target.checked)}
                                                />
                                            }
                                            label="Le parking est gratuit"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}
                    </Box>
                );

            case 3:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <SettingsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Options & Détails
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Configurez les options avancées de votre événement
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    id="max_seats"
                                    fullWidth
                                    type="number"
                                    label="Nombre de places maximum"
                                    value={formData.max_seats}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (touched.max_seats) {
                                            const stepErrors = validateStep4();
                                            setErrors(prev => ({ ...prev, max_seats: stepErrors.max_seats || '' }));
                                        }
                                    }}
                                    onBlur={() => handleFieldBlur('max_seats')}
                                    error={touched.max_seats && !!errors.max_seats}
                                    helperText={touched.max_seats && errors.max_seats ? errors.max_seats : "Capacité maximale d'accueil (optionnel)"}
                                    placeholder="Ex: 100"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    id="youtube_live"
                                    fullWidth
                                    label="Lien YouTube Live"
                                    value={formData.youtube_live}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (touched.youtube_live) {
                                            const stepErrors = validateStep4();
                                            setErrors(prev => ({ ...prev, youtube_live: stepErrors.youtube_live || '' }));
                                        }
                                    }}
                                    onBlur={() => handleFieldBlur('youtube_live')}
                                    error={touched.youtube_live && !!errors.youtube_live}
                                    helperText={touched.youtube_live && errors.youtube_live ? errors.youtube_live : "Pour un événement diffusé en direct"}
                                    placeholder="https://youtube.com/watch?v=..."
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <YouTubeIcon sx={{ color: 'error.main' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }}>
                            <Chip label="Tarification" />
                        </Divider>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.is_free === 1}
                                    onChange={(e) => handleCheckboxChange('is_free', e.target.checked)}
                                />
                            }
                            label="Entrée gratuite"
                        />

                        {formData.is_free === 0 && (
                            <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <TextField
                                    id="registration_link"
                                    fullWidth
                                    label="Lien billetterie / inscription"
                                    value={formData.registration_link}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (touched.registration_link) {
                                            const stepErrors = validateStep4();
                                            setErrors(prev => ({ ...prev, registration_link: stepErrors.registration_link || '' }));
                                        }
                                    }}
                                    onBlur={() => handleFieldBlur('registration_link')}
                                    error={touched.registration_link && !!errors.registration_link}
                                    helperText={touched.registration_link && errors.registration_link ? errors.registration_link : "Lien vers la page de réservation ou d'achat de billets"}
                                    placeholder="https://..."
                                />
                            </Paper>
                        )}
                    </Box>
                );

            case 4:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <VisibilityIcon sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                Récapitulatif
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Vérifiez les informations avant de publier
                            </Typography>
                        </Box>

                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Informations générales
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Titre</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formData.title || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Description</Typography>
                                    <Typography variant="body2">{formData.description || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Speaker</Typography>
                                    <Typography variant="body2">{formData.speaker_name || '—'}</Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Date & Heure
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {formData.is_all_day ? "Date de début" : "Début"}
                                    </Typography>
                                    <Typography variant="body2">
                                        {formData.start_datetime
                                            ? (formData.is_all_day
                                                ? new Date(formData.start_datetime).toLocaleDateString('fr-FR')
                                                : new Date(formData.start_datetime).toLocaleString('fr-FR')
                                            )
                                            : '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {formData.is_all_day ? "Date de fin" : "Fin"}
                                    </Typography>
                                    <Typography variant="body2">
                                        {formData.end_datetime
                                            ? (formData.is_all_day
                                                ? new Date(formData.end_datetime).toLocaleDateString('fr-FR')
                                                : new Date(formData.end_datetime).toLocaleString('fr-FR')
                                            )
                                            : '—'}
                                    </Typography>
                                </Box>
                                {formData.is_all_day && (
                                    <Box>
                                        <Chip
                                            label="Événement toute la journée"
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Langue</Typography>
                                    <Typography variant="body2">
                                        {languages.find(l => l.id.toString() === formData.language_id)?.name_fr || '—'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Localisation
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Adresse</Typography>
                                    <Typography variant="body2">{formData.address || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Ville</Typography>
                                    <Typography variant="body2">{formData.city || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Parking</Typography>
                                    <Typography variant="body2">
                                        {formData.has_parking === 1 ? `Oui (${formData.parking_capacity || '—'} places${formData.is_parking_free === 1 ? ', gratuit' : ''})` : 'Non'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Options
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Places maximum</Typography>
                                    <Typography variant="body2">{formData.max_seats || 'Illimité'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tarification</Typography>
                                    <Typography variant="body2">{formData.is_free === 1 ? 'Gratuit' : 'Payant'}</Typography>
                                </Box>
                                {formData.youtube_live && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Diffusion en ligne</Typography>
                                        <Typography variant="body2">Oui (YouTube Live)</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Box>
                );

            default:
                return null;
        }
    };

    if (loading) return <Box sx={{ p: 4 }}><Typography>Chargement...</Typography></Box>;

    if (hasChurch === false) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3, textAlign: 'center', px: 2 }}>
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'primary.main', filter: 'blur(60px)', opacity: 0.2, borderRadius: '50%' }}></Box>
                    <Box sx={{ position: 'relative', p: 2, bgcolor: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)', borderRadius: 4, boxShadow: 8 }}>
                        <ChurchIcon sx={{ fontSize: { xs: 64, sm: 80, md: 96 }, color: 'white' }} />
                    </Box>
                </Box>
                <Box sx={{ maxWidth: 'md', px: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                        Bienvenue !
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Pour commencer à publier des événements, vous devez d'abord créer la fiche de votre église.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => window.location.href = '/dashboard/my-church'}
                    sx={{
                        px: { xs: 3, sm: 4 },
                        py: 1.5,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        fontWeight: 'bold',
                        borderRadius: 8,
                        width: { xs: '100%', sm: 'auto' },
                        maxWidth: { xs: '300px', sm: 'none' }
                    }}
                >
                    Créer mon Église
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3, md: 4 } }}>
            {isAdminMode && (
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard/admin/events')}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Retour à la liste
                </Button>
            )}

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'center' },
                gap: 2
            }}>
                <Box>
                    <Typography variant="h3" sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
                    }}>
                        {isReadOnly ? "Visualiser l'Événement" : isAdminMode ? "Modifier l'Événement" : "Mes Événements"}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {isReadOnly ? "Événement terminé - Consultation uniquement" : isAdminMode ? "Modifiez les informations de cet événement." : "Gérez votre calendrier et vos publications."}
                    </Typography>
                </Box>
                {!isAdminMode && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        alignItems: 'center'
                    }}>
                        {!showForm && (
                            <>
                                <ToggleButtonGroup
                                    value={sortBy}
                                    exclusive
                                    onChange={(_e, newSort) => {
                                        if (newSort !== null) {
                                            setSortBy(newSort);
                                            setCurrentPage(1); // Reset to first page when changing sort
                                        }
                                    }}
                                    size="small"
                                    sx={{
                                        bgcolor: 'background.paper',
                                        '& .MuiToggleButton-root': {
                                            px: { xs: 1, sm: 2 },
                                            py: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <ToggleButton value="created" aria-label="trier par date d'ajout">
                                        <SortIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Récents</Box>
                                    </ToggleButton>
                                    <ToggleButton value="event_date" aria-label="trier par date d'événement">
                                        <DateRangeIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>À venir</Box>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                <ToggleButtonGroup
                                    value={viewMode}
                                    exclusive
                                    onChange={(_e, newMode) => {
                                        if (newMode !== null) {
                                            setViewMode(newMode);
                                        }
                                    }}
                                    size="small"
                                    sx={{
                                        bgcolor: 'background.paper',
                                        '& .MuiToggleButton-root': {
                                            px: { xs: 1, sm: 2 },
                                            py: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <ToggleButton value="grid" aria-label="vue en grille">
                                        <ViewModuleIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Cartes</Box>
                                    </ToggleButton>
                                    <ToggleButton value="list" aria-label="vue en liste">
                                        <ViewListIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Liste</Box>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </>
                        )}
                        <Button
                            variant={showForm ? "outlined" : "contained"}
                            color={showForm ? "error" : "primary"}
                            startIcon={showForm ? <CloseIcon /> : <AddIcon />}
                            onClick={() => {
                                setShowForm(!showForm);
                                if (showForm) {
                                    setEditingId(null);
                                    setFormData(initialFormState);
                                    setActiveStep(0);
                                    setIsReadOnly(false);
                                }
                            }}
                            disabled={!isChurchComplete}
                            fullWidth
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            {showForm ? 'Annuler' : 'Nouvel Événement'}
                        </Button>
                    </Box>
                )}
            </Box>

            {hasChurch && !isChurchComplete && (
                <Alert severity="warning" icon={<ChurchIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Informations de l'église incomplètes
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Pour créer des événements, vous devez compléter les informations obligatoires de votre église : nom, dénomination, adresse complète et coordonnées GPS.
                    </Typography>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<ChurchIcon />}
                        onClick={() => window.location.href = '/dashboard/my-church'}
                    >
                        Compléter mon Église
                    </Button>
                </Alert>
            )}

            {/* Search Bar */}
            {!showForm && events.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Rechercher un événement (titre, ville, adresse...)"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchQuery('')}
                                        edge="end"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3
                            }
                        }}
                    />
                </Box>
            )}

            {/* Status Filter */}
            {!showForm && hasChurch && (
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        label={`Tous (${events.length})`}
                        onClick={() => handleStatusFilterChange('ALL')}
                        color={statusFilter === 'ALL' ? 'primary' : 'default'}
                        variant={statusFilter === 'ALL' ? 'filled' : 'outlined'}
                    />
                    <Chip
                        label={`À venir (${events.filter(e => e.status === 'UPCOMING').length})`}
                        icon={<ScheduleIcon />}
                        onClick={() => handleStatusFilterChange('UPCOMING')}
                        color={statusFilter === 'UPCOMING' ? 'primary' : 'default'}
                        variant={statusFilter === 'UPCOMING' ? 'filled' : 'outlined'}
                    />
                    <Chip
                        label={`En cours (${events.filter(e => e.status === 'ONGOING').length})`}
                        icon={<PlayCircleIcon />}
                        onClick={() => handleStatusFilterChange('ONGOING')}
                        color={statusFilter === 'ONGOING' ? 'success' : 'default'}
                        variant={statusFilter === 'ONGOING' ? 'filled' : 'outlined'}
                    />
                    <Chip
                        label={`Terminés (${events.filter(e => e.status === 'COMPLETED').length})`}
                        icon={<CheckCircleIcon />}
                        onClick={() => handleStatusFilterChange('COMPLETED')}
                        color={statusFilter === 'COMPLETED' ? 'default' : 'default'}
                        variant={statusFilter === 'COMPLETED' ? 'filled' : 'outlined'}
                    />
                    <Chip
                        label={`Annulés (${events.filter(e => e.status === 'CANCELLED').length})`}
                        icon={<CancelIcon />}
                        onClick={() => handleStatusFilterChange('CANCELLED')}
                        color={statusFilter === 'CANCELLED' ? 'error' : 'default'}
                        variant={statusFilter === 'CANCELLED' ? 'filled' : 'outlined'}
                    />
                </Box>
            )}

            {showForm ? (
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    onKeyDown={(e) => {
                        // Bloquer complètement la touche "Entrée" pour éviter la soumission accidentelle
                        // La soumission doit se faire uniquement via le clic sur le bouton "Publier"
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                >
                    <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                            {/* Information importante pour la création d'événement */}
                            {!editingId && !isReadOnly && (
                                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                        Information importante
                                    </Typography>
                                    <Typography variant="body2">
                                        Une fois créé, un événement ne peut pas être supprimé définitivement. Toutefois, vous aurez toujours la possibilité de l'annuler si nécessaire en indiquant un motif d'annulation. Les événements annulés restent visibles dans votre historique pour garantir la traçabilité.
                                    </Typography>
                                </Alert>
                            )}

                            {/* Read-only mode alert */}
                            {isReadOnly && eventStatus === 'COMPLETED' && (
                                <Alert severity="info" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Mode consultation uniquement
                                    </Typography>
                                    <Typography variant="body2">
                                        Cet événement est terminé et ne peut plus être modifié.
                                    </Typography>
                                </Alert>
                            )}

                            {isReadOnly && eventStatus === 'CANCELLED' && (
                                <Alert severity="warning" icon={<CancelIcon />} sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Événement annulé
                                    </Typography>
                                    <Typography variant="body2">
                                        Cet événement a été annulé. Utilisez le bouton "Réactiver l'événement" ci-dessous pour le modifier à nouveau.
                                        {formData.cancellation_reason && ` Motif d'annulation : ${formData.cancellation_reason}`}
                                    </Typography>
                                </Alert>
                            )}

                            {/* Stepper */}
                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                                {steps.map((step, index) => (
                                    <Step key={`step-${index}-${step.label}`}>
                                        <StepLabel
                                            StepIconComponent={() => <CustomStepIcon index={index} icon={step.icon} />}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: activeStep === index ? 'bold' : 'normal',
                                                    color: activeStep === index ? 'primary.main' : 'text.secondary',
                                                    display: { xs: 'none', sm: 'block' }
                                                }}
                                            >
                                                {step.label}
                                            </Typography>
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            <Divider sx={{ mb: 4 }} />

                            {/* Step Content */}
                            <Box component="fieldset" disabled={isReadOnly} sx={{ border: 'none', m: 0, p: 0 }}>
                                {renderStepContent()}
                            </Box>

                            {/* Navigation Buttons */}
                            {!isReadOnly && (
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    pt: 4,
                                    mt: 4,
                                    borderTop: 1,
                                    borderColor: 'divider'
                                }}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={handleBack}
                                        disabled={activeStep === 0}
                                        startIcon={<NavigateBeforeIcon />}
                                        fullWidth
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Précédent
                                    </Button>

                                    {activeStep === steps.length - 1 ? (
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="success"
                                            size="large"
                                            startIcon={<SaveIcon />}
                                            disabled={loading || !isStepValid(0) || !isStepValid(1) || !isStepValid(2) || !isStepValid(3)}
                                            fullWidth
                                            sx={{ width: { xs: '100%', sm: 'auto' }, px: { sm: 4 } }}
                                        >
                                            {loading ? 'Publication...' : editingId ? 'Enregistrer les modifications' : 'Publier l\'événement'}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="contained"
                                            onClick={handleNext}
                                            disabled={!isStepValid(activeStep)}
                                            endIcon={<NavigateNextIcon />}
                                            fullWidth
                                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                                        >
                                            Suivant
                                        </Button>
                                    )}
                                </Box>
                            )}

                            {/* Read-only Mode Buttons */}
                            {isReadOnly && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 4, mt: 4, borderTop: 1, borderColor: 'divider' }}>
                                    {eventStatus === 'COMPLETED' && (
                                        <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
                                            Cet événement est terminé et ne peut plus être modifié.
                                        </Alert>
                                    )}

                                    {eventStatus === 'CANCELLED' && (
                                        <Alert severity="warning" sx={{ flex: 1, mr: 2 }}>
                                            Cet événement a été annulé. Réactivez-le pour pouvoir le modifier.
                                        </Alert>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {showReactivateButton && (
                                            <Button
                                                type="button"
                                                variant="contained"
                                                color="warning"
                                                onClick={() => handleReactivateEvent()}
                                                disabled={loading}
                                                startIcon={<CheckCircleIcon />}
                                            >
                                                Réactiver l'événement
                                            </Button>
                                        )}

                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={() => navigate('/dashboard/admin/events')}
                                            startIcon={<ArrowBackIcon />}
                                        >
                                            Retour à la liste
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            ) : viewMode === 'grid' ? (
                <Grid container spacing={3}>
                    {paginatedEvents.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    {searchQuery.trim()
                                        ? `Aucun événement trouvé pour "${searchQuery}"`
                                        : `Aucun événement ${statusFilter !== 'ALL' ? `avec le statut "${
                                            statusFilter === 'UPCOMING' ? 'À venir' :
                                            statusFilter === 'ONGOING' ? 'En cours' :
                                            statusFilter === 'COMPLETED' ? 'Terminé' :
                                            statusFilter === 'CANCELLED' ? 'Annulé' : ''
                                        }"` : ''}`
                                    }
                                </Typography>
                                {searchQuery.trim() && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => setSearchQuery('')}
                                        sx={{ mt: 2 }}
                                    >
                                        Effacer la recherche
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    ) : paginatedEvents.map((event) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
                            <Card sx={{
                                overflow: 'hidden',
                                transition: 'all 0.3s',
                                opacity: event.status === 'COMPLETED' ? 0.6 : 1,
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                    borderColor: 'primary.main'
                                }
                            }}>
                                <Box sx={{ height: 192, width: '100%', bgcolor: 'grey.900', position: 'relative' }}>
                                    {event.image_url ? (
                                        <Box
                                            component="img"
                                            src={event.image_url}
                                            alt={event.title}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s',
                                                filter: event.status === 'COMPLETED' ? 'grayscale(100%)' : 'none',
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.5) 0%, rgba(156, 39, 176, 0.5) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <EventIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.2)' }} />
                                        </Box>
                                    )}
                                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuAnchor({ element: e.currentTarget, eventId: event.id });
                                            }}
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                backdropFilter: 'blur(12px)',
                                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                    transform: 'scale(1.15) rotate(90deg)',
                                                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)'
                                                }
                                            }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        {event.status === 'UPCOMING' && (
                                            <Chip
                                                label="À venir"
                                                icon={<ScheduleIcon />}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(33, 150, 243, 0.9)',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    backdropFilter: 'blur(8px)',
                                                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.4)',
                                                    '& .MuiChip-icon': { color: 'white' }
                                                }}
                                            />
                                        )}
                                        {event.status === 'ONGOING' && (
                                            <Chip
                                                label="En cours"
                                                icon={<PlayCircleIcon />}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(76, 175, 80, 0.9)',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    backdropFilter: 'blur(8px)',
                                                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                                                    '& .MuiChip-icon': { color: 'white' }
                                                }}
                                            />
                                        )}
                                        {event.status === 'CANCELLED' && (
                                            <Chip
                                                label="Annulé"
                                                icon={<CancelIcon />}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(244, 67, 54, 0.9)',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    backdropFilter: 'blur(8px)',
                                                    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
                                                    '& .MuiChip-icon': { color: 'white' }
                                                }}
                                            />
                                        )}
                                        {event.status === 'COMPLETED' && (
                                            <Chip
                                                label="Terminé"
                                                icon={<CheckCircleIcon />}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(158, 158, 158, 0.9)',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    backdropFilter: 'blur(8px)',
                                                    boxShadow: '0 2px 8px rgba(158, 158, 158, 0.4)',
                                                    '& .MuiChip-icon': { color: 'white' }
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>

                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 'bold',
                                        mb: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        '&:hover': { color: 'primary.main' },
                                        transition: 'color 0.3s'
                                    }}>
                                        {event.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {isAllDayEvent(event.start_datetime, event.end_datetime)
                                                    ? `${new Date(event.start_datetime).toLocaleDateString()}${
                                                        event.start_datetime.split('T')[0] !== event.end_datetime.split('T')[0]
                                                            ? ` - ${new Date(event.end_datetime).toLocaleDateString()}`
                                                            : ''
                                                    } (Toute la journée)`
                                                    : `${new Date(event.start_datetime).toLocaleDateString()} à ${new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
                                                        event.end_datetime
                                                            ? ` → ${new Date(event.end_datetime).toLocaleDateString()} à ${new Date(event.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                            : ''
                                                    }`
                                                }
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3, mt: 0.5 }}>
                                            <Box sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                bgcolor: 'white',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 3,
                                                border: 2,
                                                borderColor: event.status === 'UPCOMING' ? 'primary.main' : 'grey.300',
                                                boxShadow: event.status === 'UPCOMING'
                                                    ? '0 4px 12px rgba(25, 118, 210, 0.2)'
                                                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: event.status === 'UPCOMING'
                                                        ? '0 6px 16px rgba(25, 118, 210, 0.3)'
                                                        : '0 4px 12px rgba(0, 0, 0, 0.12)'
                                                }
                                            }}>
                                                <AccessTimeIcon sx={{
                                                    fontSize: 20,
                                                    color: event.status === 'UPCOMING' ? 'primary.main' : 'text.secondary'
                                                }} />
                                                <Typography sx={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    color: event.status === 'UPCOMING' ? 'primary.main' : 'text.secondary',
                                                    letterSpacing: '0.3px'
                                                }}>
                                                    {getRelativeTime(event.start_datetime)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {/* Décompte temps réel pour événements EN COURS */}
                                        {event.status === 'ONGOING' && event.end_datetime && (() => {
                                            const remaining = getRemainingTime(event.end_datetime);
                                            if (!remaining) return null;

                                            const isUrgent = remaining.totalMinutes <= 30;

                                            return (
                                                <Box
                                                    sx={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 0.8,
                                                        px: 1.5,
                                                        py: 0.8,
                                                        borderRadius: 2,
                                                        bgcolor: isUrgent ? 'error.main' : 'warning.main',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        boxShadow: isUrgent ? '0 0 15px rgba(244, 67, 54, 0.5)' : '0 0 15px rgba(255, 152, 0, 0.5)',
                                                        animation: 'pulse 2s ease-in-out infinite',
                                                        '@keyframes pulse': {
                                                            '0%, 100%': {
                                                                transform: 'scale(1)',
                                                                opacity: 1
                                                            },
                                                            '50%': {
                                                                transform: 'scale(1.05)',
                                                                opacity: 0.9
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <AccessTimeIcon sx={{ fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                                        {remaining.text}
                                                    </Typography>
                                                </Box>
                                            );
                                        })()}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {event.city || event.address || "Lieu non précisé"}
                                            </Typography>
                                        </Box>
                                        {/* Compteur de personnes intéressées */}
                                        {event.interested_count !== undefined && event.interested_count > 0 && (
                                            <Box sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                bgcolor: '#E8F5E9',
                                                color: '#2E7D32',
                                                px: 1.5,
                                                py: 0.75,
                                                borderRadius: 2,
                                                mt: 0.5,
                                                border: '1px solid #C8E6C9',
                                                width: 'fit-content',
                                            }}>
                                                <GroupIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                    {event.interested_count} {event.interested_count === 1 ? 'intéressé' : 'intéressés'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    {event.status === 'CANCELLED' && event.cancellation_reason && (
                                        <Alert severity="error" sx={{ mb: 2 }} icon={<CancelIcon />}>
                                            <Typography variant="caption" fontWeight="bold" display="block">
                                                Motif d'annulation:
                                            </Typography>
                                            <Typography variant="body2">
                                                {event.cancellation_reason}
                                            </Typography>
                                        </Alert>
                                    )}
                                    {!['COMPLETED', 'CANCELLED'].includes(event.status) ? (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => handleEdit(event.id)}
                                        >
                                            Modifier
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="info"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleEdit(event.id, true)}
                                        >
                                            Visualiser
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                        <Box
                            onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormState); setActiveStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            sx={{
                                height: '100%',
                                minHeight: 300,
                                border: 2,
                                borderStyle: 'dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'action.hover',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                bgcolor: 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <AddIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Créer un nouvel événement
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, opacity: 0.6 }}>
                                Planifiez votre prochain culte
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            ) : (
                // List View
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {paginatedEvents.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                {searchQuery.trim()
                                    ? `Aucun événement trouvé pour "${searchQuery}"`
                                    : `Aucun événement ${statusFilter !== 'ALL' ? `avec le statut "${
                                        statusFilter === 'UPCOMING' ? 'À venir' :
                                        statusFilter === 'ONGOING' ? 'En cours' :
                                        statusFilter === 'COMPLETED' ? 'Terminé' :
                                        statusFilter === 'CANCELLED' ? 'Annulé' : ''
                                    }"` : ''}`
                                }
                            </Typography>
                            {searchQuery.trim() && (
                                <Button
                                    variant="outlined"
                                    onClick={() => setSearchQuery('')}
                                    sx={{ mt: 2 }}
                                >
                                    Effacer la recherche
                                </Button>
                            )}
                        </Box>
                    ) : paginatedEvents.map((event) => (
                        <Card key={event.id} sx={{
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            opacity: event.status === 'COMPLETED' ? 0.6 : 1,
                            '&:hover': {
                                boxShadow: 4,
                                borderColor: 'primary.main'
                            }
                        }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                                {/* Image */}
                                <Box sx={{
                                    width: { xs: '100%', md: 200 },
                                    height: { xs: 180, md: 'auto' },
                                    minHeight: { md: 160 },
                                    bgcolor: 'grey.900',
                                    position: 'relative',
                                    flexShrink: 0
                                }}>
                                    {event.image_url ? (
                                        <Box
                                            component="img"
                                            src={event.image_url}
                                            alt={event.title}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                filter: event.status === 'COMPLETED' ? 'grayscale(100%)' : 'none'
                                            }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.5) 0%, rgba(156, 39, 176, 0.5) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <EventIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.2)' }} />
                                        </Box>
                                    )}
                                </Box>

                                {/* Content */}
                                <Box sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 'bold',
                                            flex: 1,
                                            '&:hover': { color: 'primary.main' },
                                            transition: 'color 0.3s'
                                        }}>
                                            {event.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}>
                                            {event.status === 'UPCOMING' && (
                                                <Chip
                                                    label="À venir"
                                                    icon={<ScheduleIcon />}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(33, 150, 243, 0.9)',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        backdropFilter: 'blur(8px)',
                                                        boxShadow: '0 2px 8px rgba(33, 150, 243, 0.4)',
                                                        '& .MuiChip-icon': { color: 'white' }
                                                    }}
                                                />
                                            )}
                                            {event.status === 'ONGOING' && (
                                                <Chip
                                                    label="En cours"
                                                    icon={<PlayCircleIcon />}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(76, 175, 80, 0.9)',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        backdropFilter: 'blur(8px)',
                                                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                                                        '& .MuiChip-icon': { color: 'white' }
                                                    }}
                                                />
                                            )}
                                            {event.status === 'CANCELLED' && (
                                                <Chip
                                                    label="Annulé"
                                                    icon={<CancelIcon />}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(244, 67, 54, 0.9)',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        backdropFilter: 'blur(8px)',
                                                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
                                                        '& .MuiChip-icon': { color: 'white' }
                                                    }}
                                                />
                                            )}
                                            {event.status === 'COMPLETED' && (
                                                <Chip
                                                    label="Terminé"
                                                    icon={<CheckCircleIcon />}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(158, 158, 158, 0.9)',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        backdropFilter: 'blur(8px)',
                                                        boxShadow: '0 2px 8px rgba(158, 158, 158, 0.4)',
                                                        '& .MuiChip-icon': { color: 'white' }
                                                    }}
                                                />
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenuAnchor({ element: e.currentTarget, eventId: event.id });
                                                }}
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    '&:hover': {
                                                        bgcolor: 'primary.dark',
                                                        transform: 'rotate(90deg)'
                                                    },
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(event.start_datetime).toLocaleDateString('fr-FR', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })} à {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {event.end_datetime && (
                                                    <>
                                                        {' → '}
                                                        {new Date(event.end_datetime).toLocaleDateString('fr-FR', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })} à {new Date(event.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </>
                                                )}
                                            </Typography>
                                            <Box sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                bgcolor: 'white',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 3,
                                                border: 2,
                                                borderColor: event.status === 'UPCOMING' ? 'primary.main' : 'grey.300',
                                                boxShadow: event.status === 'UPCOMING'
                                                    ? '0 4px 12px rgba(25, 118, 210, 0.2)'
                                                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: event.status === 'UPCOMING'
                                                        ? '0 6px 16px rgba(25, 118, 210, 0.3)'
                                                        : '0 4px 12px rgba(0, 0, 0, 0.12)'
                                                }
                                            }}>
                                                <AccessTimeIcon sx={{
                                                    fontSize: 20,
                                                    color: event.status === 'UPCOMING' ? 'primary.main' : 'text.secondary'
                                                }} />
                                                <Typography sx={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    color: event.status === 'UPCOMING' ? 'primary.main' : 'text.secondary',
                                                    letterSpacing: '0.3px'
                                                }}>
                                                    {getRelativeTime(event.start_datetime)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {/* Décompte temps réel pour événements EN COURS */}
                                        {event.status === 'ONGOING' && event.end_datetime && (() => {
                                            const remaining = getRemainingTime(event.end_datetime);
                                            if (!remaining) return null;

                                            const isUrgent = remaining.totalMinutes <= 30;

                                            return (
                                                <Box
                                                    sx={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 0.8,
                                                        px: 1.5,
                                                        py: 0.8,
                                                        mb: 0.5,
                                                        borderRadius: 2,
                                                        bgcolor: isUrgent ? 'error.main' : 'warning.main',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        boxShadow: isUrgent ? '0 0 15px rgba(244, 67, 54, 0.5)' : '0 0 15px rgba(255, 152, 0, 0.5)',
                                                        animation: 'pulse 2s ease-in-out infinite',
                                                        '@keyframes pulse': {
                                                            '0%, 100%': {
                                                                transform: 'scale(1)',
                                                                opacity: 1
                                                            },
                                                            '50%': {
                                                                transform: 'scale(1.05)',
                                                                opacity: 0.9
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <AccessTimeIcon sx={{ fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                                        {remaining.text}
                                                    </Typography>
                                                </Box>
                                            );
                                        })()}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {event.city || event.address || "Lieu non précisé"}
                                            </Typography>
                                        </Box>
                                        {event.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {event.description}
                                            </Typography>
                                        )}
                                        {/* Compteur de personnes intéressées */}
                                        {event.interested_count !== undefined && event.interested_count > 0 && (
                                            <Box sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                bgcolor: '#E8F5E9',
                                                color: '#2E7D32',
                                                px: 1.5,
                                                py: 0.75,
                                                borderRadius: 2,
                                                mt: 1,
                                                border: '1px solid #C8E6C9',
                                                width: 'fit-content',
                                            }}>
                                                <GroupIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                    {event.interested_count} {event.interested_count === 1 ? 'intéressé' : 'intéressés'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {event.status === 'CANCELLED' && event.cancellation_reason && (
                                        <Alert severity="error" sx={{ mb: 2 }} icon={<CancelIcon />}>
                                            <Typography variant="caption" fontWeight="bold" display="block">
                                                Motif d'annulation:
                                            </Typography>
                                            <Typography variant="body2">
                                                {event.cancellation_reason}
                                            </Typography>
                                        </Alert>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                        {!['COMPLETED', 'CANCELLED'].includes(event.status) ? (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleEdit(event.id)}
                                            >
                                                Modifier
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="info"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={() => handleEdit(event.id, true)}
                                            >
                                                Visualiser
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    ))}

                    {/* Add New Event Card in List View */}
                    <Card
                        onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormState); setActiveStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        sx={{
                            border: 2,
                            borderStyle: 'dashed',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        <CardContent sx={{ py: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    bgcolor: 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <AddIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                        Créer un nouvel événement
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Planifiez votre prochain culte
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Pagination */}
            {!showForm && filteredEvents.length > 0 && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        variant="outlined"
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            <Menu
                anchorEl={menuAnchor?.element}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        minWidth: 200
                    }
                }}
            >
                {/* Only show cancel option for UPCOMING events */}
                {menuAnchor && events.find(e => e.id === menuAnchor.eventId)?.status === 'UPCOMING' && (
                    <MenuItem
                        onClick={() => handleOpenCancelDialog(menuAnchor?.eventId || 0)}
                        sx={{ py: 1.5, gap: 1.5 }}
                    >
                        <ListItemIcon>
                            <CancelIcon fontSize="small" sx={{ color: '#f44336' }} />
                        </ListItemIcon>
                        <ListItemText>Annuler l'événement</ListItemText>
                    </MenuItem>
                )}
                {/* Show reactivate option for CANCELLED events that haven't ended yet */}
                {menuAnchor && (() => {
                    const event = events.find(e => e.id === menuAnchor.eventId);
                    if (!event || event.status !== 'CANCELLED') return false;
                    // Convert MySQL datetime format to ISO 8601 for consistent parsing
                    const endDateTime = new Date(event.end_datetime.replace(' ', 'T'));
                    return endDateTime > new Date();
                })() && (
                    <MenuItem
                        onClick={() => handleReactivateEvent(menuAnchor?.eventId || 0)}
                        sx={{ py: 1.5, gap: 1.5 }}
                    >
                        <ListItemIcon>
                            <CheckCircleIcon fontSize="small" sx={{ color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText>Réactiver l'événement</ListItemText>
                    </MenuItem>
                )}
                {/* Show message if no actions available (ONGOING, COMPLETED, or CANCELLED with expired date) */}
                {menuAnchor && (() => {
                    const event = events.find(e => e.id === menuAnchor.eventId);
                    if (!event) return false;

                    // Show for ONGOING or COMPLETED events
                    if (['ONGOING', 'COMPLETED'].includes(event.status)) return true;

                    // Show for CANCELLED events whose date has passed (cannot be reactivated)
                    if (event.status === 'CANCELLED') {
                        const endDateStr = typeof event.end_datetime === 'string'
                            ? event.end_datetime.replace(' ', 'T')
                            : event.end_datetime;
                        const endDateTime = new Date(endDateStr);
                        return endDateTime <= new Date();
                    }

                    return false;
                })() && (
                    <MenuItem disabled sx={{ py: 1.5 }}>
                        <ListItemText secondary="Aucune action disponible" />
                    </MenuItem>
                )}
            </Menu>

            {/* Cancel Event Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                aria-labelledby="cancel-event-title"
            >
                <DialogTitle id="cancel-event-title">Annuler l&apos;événement</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Cette action est irréversible. L'événement sera marqué comme annulé.
                        </Alert>
                        <TextField
                            autoFocus
                            fullWidth
                            multiline
                            rows={4}
                            label="Motif d'annulation"
                            placeholder="Ex: Intempéries, problème logistique, annulation de l'intervenant..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            error={cancellationReason.length > 0 && cancellationReason.length < 10}
                            helperText={
                                cancellationReason.length > 0 && cancellationReason.length < 10
                                    ? `Minimum 10 caractères (${cancellationReason.length}/10)`
                                    : "Ce motif sera visible par les participants"
                            }
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>
                        Retour
                    </Button>
                    <Button
                        onClick={handleCancelEvent}
                        color="error"
                        variant="contained"
                        disabled={!cancellationReason.trim() || cancellationReason.trim().length < 10 || loading}
                    >
                        {loading ? 'Annulation...' : 'Confirmer l\'annulation'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleConfirmDialogClose}
                maxWidth="sm"
                fullWidth
                aria-label="Confirmation"
            >
                <DialogTitle>{confirmDialogTitle}</DialogTitle>
                <DialogContent>
                    <Typography>{confirmDialogMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDialogClose}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmDialogConfirm}
                        color="primary"
                        variant="contained"
                        autoFocus
                    >
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
