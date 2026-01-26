import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
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
    Tabs,
    Tab,
    IconButton,
    Alert,
    Grid,
    FormHelperText,
    Badge
} from '@mui/material';
import {
    Save as SaveIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    LocationOn as LocationOnIcon,
    ArrowBack as ArrowBackIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { ImageUpload } from '../components/ImageUpload';
import { churchSchema, type ChurchFormData } from '../lib/validationSchemas';
import FormError, { BackendErrors } from '../components/FormError';
import AddressAutocomplete from '../components/AddressAutocomplete';

// Types for reference data
interface Denomination { id: number; name: string; }
interface ActivityType { id: number; label_fr: string; }

export default function MyChurch() {
    const { churchId } = useParams<{ churchId: string }>();
    const navigate = useNavigate();
    const isAdminMode = !!churchId; // Mode admin si churchId existe
    const [activeTab, setActiveTab] = useState(0);
    const [success, setSuccess] = useState('');
    const [backendErrors, setBackendErrors] = useState<Array<{ field: string; message: string }>>([]);
    const [myChurchId, setMyChurchId] = useState<number | null>(null); // Store church ID for preview

    // Reference Data
    const [denominations, setDenominations] = useState<Denomination[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);

    // React Hook Form with Zod validation
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<ChurchFormData>({
        resolver: zodResolver(churchSchema),
        mode: 'all', // Validation complète en temps réel
        defaultValues: {
            socials: [],
            schedules: [],
            allow_network_visibility: true,
        }
    });

    // useFieldArray for dynamic arrays
    const { fields: socialFields, append: appendSocial, remove: removeSocial, replace: replaceSocials } = useFieldArray({
        control,
        name: 'socials',
    });

    const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule, replace: replaceSchedules } = useFieldArray({
        control,
        name: 'schedules',
    });

    const has_parking = watch('has_parking');

    // Compter les erreurs par onglet
    const getTabErrorCount = (tabIndex: number): number => {
        const errorKeys = Object.keys(errors);
        let count = 0;

        switch (tabIndex) {
            case 0: // Général
                const generalFields = ['church_name', 'denomination_id', 'address', 'street_number', 'street_name', 'postal_code', 'city', 'latitude', 'longitude', 'description', 'logo_url'];
                count = errorKeys.filter(key => generalFields.includes(key)).length;
                break;
            case 1: // Détails & Infos
                const detailsFields = ['pastor_first_name', 'pastor_last_name', 'phone', 'website', 'has_parking', 'parking_capacity', 'is_parking_free'];
                count = errorKeys.filter(key => detailsFields.includes(key)).length;
                break;
            case 2: // Réseaux Sociaux
                if (errors.socials) {
                    if (Array.isArray(errors.socials)) {
                        // Compter les erreurs dans les éléments du tableau
                        count = errors.socials.filter(e => e).length;
                    } else {
                        // Erreur au niveau du tableau (ex: validation globale)
                        count = 1;
                    }
                }
                break;
            case 3: // Horaires
                if (errors.schedules) {
                    if (Array.isArray(errors.schedules)) {
                        // Compter les erreurs dans les éléments du tableau
                        count = errors.schedules.filter(e => e).length;
                    } else {
                        // Erreur au niveau du tableau (ex: min 1 horaire obligatoire)
                        count = 1;
                    }
                }
                break;
        }

        return count;
    };

    useEffect(() => {
        fetchReferences();
        fetchChurchData();
    }, []);

    const fetchReferences = async () => {
        try {
            const [denoms, types] = await Promise.all([
                api.get('/settings/denominations'),
                api.get('/settings/activity_types')
            ]);
            setDenominations(Array.isArray(denoms.data) ? denoms.data : []);
            setActivityTypes(Array.isArray(types.data) ? types.data : []);
        } catch (err) {
            console.error('Error fetching refs', err);
            setDenominations([]);
            setActivityTypes([]);
        }
    };

    const fetchChurchData = async () => {
        try {
            // Mode admin: charger une église spécifique par ID
            // Mode pastor: charger l'église du pasteur connecté
            const endpoint = isAdminMode
                ? `/admin/churches/${churchId}`
                : '/church/my-church';

            const { data } = await api.get(endpoint);

            if (data && data.id) {
                // Store church ID for preview button
                setMyChurchId(data.id);

                // Normaliser les horaires: convertir HH:MM:SS en HH:MM
                const normalizedSchedules = (data.schedules || []).map((schedule: any) => ({
                    ...schedule,
                    start_time: schedule.start_time?.substring(0, 5) || '' // HH:MM:SS -> HH:MM
                }));

                // Reset form with fetched data
                reset({
                    church_name: data.church_name,
                    description: data.details.description || '',
                    denomination_id: data.denomination_id,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: data.details.address || '',
                    street_number: data.details.street_number || '',
                    street_name: data.details.street_name || '',
                    postal_code: data.details.postal_code || '',
                    city: data.details.city || '',
                    phone: data.details.phone || '',
                    website: data.details.website || '',
                    pastor_first_name: data.details.pastor_first_name || '',
                    pastor_last_name: data.details.pastor_last_name || '',
                    has_parking: !!data.details.has_parking,
                    parking_capacity: data.details.parking_capacity || null,
                    is_parking_free: !!data.details.is_parking_free,
                    logo_url: data.details.logo_url || '',
                    allow_network_visibility: !!data.allow_network_visibility,
                    socials: data.socials || [],
                    schedules: normalizedSchedules,
                });

                // ✅ FIX: Forcer la mise à jour de useFieldArray avec replace()
                // C'est nécessaire car reset() ne met pas toujours à jour les fields automatiquement
                replaceSocials(data.socials || []);
                replaceSchedules(normalizedSchedules);

                // Forcer la validation complète après le chargement des données
                setTimeout(() => trigger(), 100);
            }
        } catch (err) {
            console.error('Error fetching church:', err);
        }
    };

    const onSubmit = async (formData: ChurchFormData) => {
        setBackendErrors([]);
        setSuccess('');

        try {
            // Mode admin: modifier une église spécifique
            // Mode pastor: modifier son église
            if (isAdminMode) {
                await api.put(`/admin/churches/${churchId}`, formData);
            } else {
                await api.post('/church/my-church', formData);
            }
            setSuccess('Sauvegardé avec succès !');

            // En mode admin, retourner à la liste après sauvegarde
            if (isAdminMode) {
                setTimeout(() => navigate('/dashboard/admin/churches'), 1500);
            }
        } catch (err: unknown) {
            // Handle structured backend errors
            const error = err as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };
            if (error.response?.data?.errors) {
                setBackendErrors(error.response.data.errors);
            } else {
                setBackendErrors([{ field: 'général', message: error.response?.data?.message || 'Une erreur est survenue' }]);
            }
        }
    };

    const platforms = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'WHATSAPP', 'LINKEDIN'];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    // Traduction des jours en français
    const daysTranslation: Record<string, string> = {
        MONDAY: 'Lundi',
        TUESDAY: 'Mardi',
        WEDNESDAY: 'Mercredi',
        THURSDAY: 'Jeudi',
        FRIDAY: 'Vendredi',
        SATURDAY: 'Samedi',
        SUNDAY: 'Dimanche'
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto', pb: { xs: 12, sm: 4 } }}>
            {/* Bouton Retour en mode admin */}
            {isAdminMode && (
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard/admin/churches')}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Retour à la liste
                </Button>
            )}

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2
            }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' } }}>
                    {isAdminMode ? "Modifier l'Église" : "Mon Église"}
                </Typography>
                {/* Boutons desktop uniquement */}
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, flexDirection: 'row', width: 'auto' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                            const targetChurchId = isAdminMode ? churchId : myChurchId;
                            const url = targetChurchId ? `/map?church_id=${targetChurchId}` : '/map';
                            window.open(url, '_blank');
                        }}
                        disabled={!myChurchId && !churchId}
                    >
                        Aperçu Public
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || Object.keys(errors).length > 0}
                        variant="contained"
                        color="success"
                        size="large"
                        startIcon={<SaveIcon />}
                        sx={{ px: 4 }}
                    >
                        {isSubmitting ? 'Sauvegarde...' : 'Tout Sauvegarder'}
                    </Button>
                </Box>
            </Box>

            {/* Backend Errors */}
            <BackendErrors errors={backendErrors} />

            {/* Success Message */}
            {success && (
                <Alert severity="success">{success}</Alert>
            )}

            {/* Tabs Header */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: { xs: -1.5, sm: 0 } }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTab-root': {
                            minWidth: { xs: 80, sm: 120 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            px: { xs: 1, sm: 2 }
                        }
                    }}
                >
                    <Tab
                        label={
                            <Badge
                                badgeContent={getTabErrorCount(0)}
                                color="error"
                                sx={{ '& .MuiBadge-badge': { right: { xs: -8, sm: -12 }, top: 2, fontSize: { xs: '0.65rem', sm: '0.75rem' } } }}
                            >
                                Général
                            </Badge>
                        }
                    />
                    <Tab
                        label={
                            <Badge
                                badgeContent={getTabErrorCount(1)}
                                color="error"
                                sx={{ '& .MuiBadge-badge': { right: { xs: -8, sm: -12 }, top: 2, fontSize: { xs: '0.65rem', sm: '0.75rem' } } }}
                            >
                                Détails
                            </Badge>
                        }
                    />
                    <Tab
                        label={
                            <Badge
                                badgeContent={getTabErrorCount(2)}
                                color="error"
                                sx={{ '& .MuiBadge-badge': { right: { xs: -8, sm: -12 }, top: 2, fontSize: { xs: '0.65rem', sm: '0.75rem' } } }}
                            >
                                Réseaux
                            </Badge>
                        }
                    />
                    <Tab
                        label={
                            <Badge
                                badgeContent={getTabErrorCount(3)}
                                color="error"
                                sx={{ '& .MuiBadge-badge': { right: { xs: -8, sm: -12 }, top: 2, fontSize: { xs: '0.65rem', sm: '0.75rem' } } }}
                            >
                                Horaires
                            </Badge>
                        }
                    />
                </Tabs>
            </Box>

            <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                {/* GENERAL TAB */}
                {activeTab === 0 && (
                    <Card elevation={0} sx={{ border: { xs: 0, sm: 1 }, borderColor: 'divider' }}>
                        <CardContent sx={{ p: { xs: 1.5, sm: 3, md: 4 } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 4 } }}>
                                {/* SECTION 1: ADRESSE (PRIORITAIRE) */}
                                <Box sx={{ pb: { xs: 2, sm: 4 }, borderBottom: 1, borderColor: 'divider' }}>
                                    <Typography variant="h5" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                                        <LocationOnIcon sx={{ fontSize: { xs: 20, sm: 24 } }} /> Localisation de l'Église
                                    </Typography>
                                    <Alert severity="info" sx={{ mb: 3, py: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        Utilisez la recherche d'adresse ci-dessous. Tous les champs d'adresse et coordonnées GPS seront remplis automatiquement.
                                    </Alert>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {/* Autocomplete d'adresse */}
                                        <AddressAutocomplete
                                            defaultValue={watch('address') || ''}
                                            onAddressSelect={(addressData) => {
                                                setValue('address', addressData.full_address, { shouldValidate: true });
                                                setValue('street_number', addressData.street_number, { shouldValidate: true });
                                                setValue('street_name', addressData.street_name, { shouldValidate: true });
                                                setValue('postal_code', addressData.postal_code, { shouldValidate: true });
                                                setValue('city', addressData.city, { shouldValidate: true });
                                                setValue('latitude', addressData.latitude, { shouldValidate: true });
                                                setValue('longitude', addressData.longitude, { shouldValidate: true });
                                            }}
                                            error={errors.address?.message}
                                        />

                                        {/* Champs d'adresse détaillés (lecture seule, auto-remplis) */}
                                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 3 }}>
                                                    <TextField
                                                        {...register('street_number')}
                                                        fullWidth
                                                        size="small"
                                                        label="N°"
                                                        InputProps={{ readOnly: true }}
                                                        InputLabelProps={{ shrink: true }}
                                                        placeholder="Auto"
                                                        error={!!errors.street_number}
                                                        helperText={errors.street_number?.message}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 9 }}>
                                                    <TextField
                                                        {...register('street_name')}
                                                        fullWidth
                                                        size="small"
                                                        label="Rue *"
                                                        InputProps={{ readOnly: true }}
                                                        InputLabelProps={{ shrink: true }}
                                                        placeholder="Auto-rempli"
                                                        error={!!errors.street_name}
                                                        helperText={errors.street_name?.message}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 3 }}>
                                                    <TextField
                                                        {...register('postal_code')}
                                                        fullWidth
                                                        size="small"
                                                        label="Code Postal *"
                                                        InputProps={{ readOnly: true }}
                                                        InputLabelProps={{ shrink: true }}
                                                        placeholder="Auto"
                                                        error={!!errors.postal_code}
                                                        helperText={errors.postal_code?.message}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 9 }}>
                                                    <TextField
                                                        {...register('city')}
                                                        fullWidth
                                                        size="small"
                                                        label="Ville *"
                                                        InputProps={{ readOnly: true }}
                                                        InputLabelProps={{ shrink: true }}
                                                        placeholder="Auto-remplie"
                                                        error={!!errors.city}
                                                        helperText={errors.city?.message}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Coordonnées GPS (lecture seule, auto-remplies) */}
                                        <Box sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1, border: 1, borderColor: 'info.light' }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        {...register('latitude', { valueAsNumber: true })}
                                                        fullWidth
                                                        size="small"
                                                        label="Latitude *"
                                                        InputProps={{ readOnly: true }}
                                                        InputLabelProps={{ shrink: true }}
                                                        placeholder="Auto-calculé"
                                                        error={!!errors.latitude}
                                                        helperText={errors.latitude?.message}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        {...register('longitude', { valueAsNumber: true })}
                                                        fullWidth
                                                        size="small"
                                                        label="Longitude *"
                                                        InputProps={{ readOnly: true }}
                                                        InputLabelProps={{ shrink: true }}
                                                        placeholder="Auto-calculé"
                                                        error={!!errors.longitude}
                                                        helperText={errors.longitude?.message}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* SECTION 2: INFORMATIONS DE BASE */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
                                    <Typography variant="h5" sx={{ color: 'text.primary', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                                        Informations Générales
                                    </Typography>

                                    <TextField
                                        {...register('church_name')}
                                        fullWidth
                                        label="Nom de l'église *"
                                        error={!!errors.church_name}
                                        helperText={errors.church_name?.message}
                                    />
                                    <FormError error={errors.church_name} />

                                    <FormControl fullWidth error={!!errors.denomination_id}>
                                        <InputLabel>Dénomination *</InputLabel>
                                        <Select
                                            label="Dénomination *"
                                            value={watch('denomination_id') ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value as string | number;
                                                setValue('denomination_id', val === '' ? 0 : Number(val), { shouldValidate: true });
                                            }}
                                        >
                                            <MenuItem value="">Choisir...</MenuItem>
                                            {denominations.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                                        </Select>
                                        {errors.denomination_id && (
                                            <FormHelperText>{errors.denomination_id.message}</FormHelperText>
                                        )}
                                    </FormControl>

                                    <TextField
                                        {...register('description')}
                                        fullWidth
                                        label="Description Courte"
                                        InputLabelProps={{ shrink: true }}
                                        placeholder="Présentez votre église en quelques mots..."
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />
                                    <FormError error={errors.description} />

                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                            Logo de l'Église
                                        </Typography>
                                        <ImageUpload
                                            value={watch('logo_url') || ''}
                                            onChange={(url) => setValue('logo_url', url)}
                                        />
                                        <FormError error={errors.logo_url} />
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* DETAILS TAB */}
                {activeTab === 1 && (
                    <Card elevation={0} sx={{ border: { xs: 0, sm: 1 }, borderColor: 'divider' }}>
                        <CardContent sx={{ p: { xs: 1.5, sm: 3, md: 4 } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    Pasteur Principal
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            {...register('pastor_first_name')}
                                            fullWidth
                                            label="Prénom *"
                                            InputLabelProps={{ shrink: true }}
                                            placeholder="Jean"
                                            error={!!errors.pastor_first_name}
                                            helperText={errors.pastor_first_name?.message}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            {...register('pastor_last_name')}
                                            fullWidth
                                            label="Nom *"
                                            InputLabelProps={{ shrink: true }}
                                            placeholder="Dupont"
                                            error={!!errors.pastor_last_name}
                                            helperText={errors.pastor_last_name?.message}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            {...register('phone')}
                                            fullWidth
                                            label="Téléphone *"
                                            InputLabelProps={{ shrink: true }}
                                            placeholder="+33 1 23 45 67 89"
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            {...register('website')}
                                            fullWidth
                                            label="Site Web"
                                            InputLabelProps={{ shrink: true }}
                                            placeholder="https://..."
                                            error={!!errors.website}
                                            helperText={errors.website?.message}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ pt: { xs: 2, sm: 3 }, borderTop: 1, borderColor: 'divider' }}>
                                    <Typography variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                        Parking
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                {...register('has_parking')}
                                                style={{ width: 20, height: 20, marginRight: 8 }}
                                            />
                                            <Typography>Dispose d'un parking ?</Typography>
                                        </Box>
                                        {has_parking && (
                                            <Box sx={{ pl: 4 }}>
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <TextField
                                                            {...register('parking_capacity', { valueAsNumber: true })}
                                                            fullWidth
                                                            type="number"
                                                            label="Capacité (places)"
                                                            error={!!errors.parking_capacity}
                                                            helperText={errors.parking_capacity?.message}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <input
                                                                type="checkbox"
                                                                {...register('is_parking_free')}
                                                                style={{ width: 20, height: 20, marginRight: 8 }}
                                                            />
                                                            <Typography>Gratuit ?</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                <Box sx={{ pt: { xs: 2, sm: 3 }, borderTop: 1, borderColor: 'divider' }}>
                                    <Typography variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                        Réseau Pastoral
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <input
                                                type="checkbox"
                                                {...register('allow_network_visibility')}
                                                style={{ width: 20, height: 20, marginRight: 8, marginTop: 2 }}
                                            />
                                            <Box>
                                                <Typography sx={{ fontWeight: 500 }}>
                                                    Apparaître dans le réseau pastoral
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    En activant cette option, votre nom, prénom, email, téléphone et les informations de votre église seront visibles par les autres pasteurs du réseau. Vous pouvez désactiver cette option à tout moment.
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* SOCIALS TAB */}
                {activeTab === 2 && (
                    <Card elevation={0} sx={{ border: { xs: 0, sm: 1 }, borderColor: 'divider' }}>
                        <CardContent sx={{ p: { xs: 1.5, sm: 3, md: 4 } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {socialFields.map((field, idx) => (
                                    <Box key={field.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                        <FormControl sx={{ minWidth: 200 }}>
                                            <InputLabel>Plateforme</InputLabel>
                                            <Select
                                                {...register(`socials.${idx}.platform` as const)}
                                                label="Plateforme"
                                                value={watch(`socials.${idx}.platform`) || 'FACEBOOK'}
                                            >
                                                {platforms.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            {...register(`socials.${idx}.url` as const)}
                                            fullWidth
                                            label="URL"
                                            InputLabelProps={{ shrink: true }}
                                            placeholder="https://..."
                                            error={!!errors.socials?.[idx]?.url}
                                            helperText={errors.socials?.[idx]?.url?.message}
                                        />
                                        <IconButton
                                            color="error"
                                            onClick={() => removeSocial(idx)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<AddIcon />}
                                onClick={() => appendSocial({ platform: 'FACEBOOK', url: '' })}
                                sx={{ mt: 3, borderStyle: 'dashed' }}
                            >
                                Ajouter un réseau
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* SCHEDULES TAB */}
                {activeTab === 3 && (
                    <Card elevation={0} sx={{ border: { xs: 0, sm: 1 }, borderColor: 'divider' }}>
                        <CardContent sx={{ p: { xs: 1.5, sm: 3, md: 4 } }}>
                            <Alert severity="info" sx={{ mb: 3, py: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Au moins un horaire est obligatoire pour votre église.
                            </Alert>
                            {errors.schedules && !Array.isArray(errors.schedules) && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {errors.schedules.message}
                                </Alert>
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {scheduleFields.map((field, idx) => (
                                    <Box key={field.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, flexWrap: 'wrap' }}>
                                        <FormControl sx={{ minWidth: 150 }}>
                                            <InputLabel>Jour *</InputLabel>
                                            <Select
                                                {...register(`schedules.${idx}.day_of_week` as const)}
                                                label="Jour *"
                                                value={watch(`schedules.${idx}.day_of_week`) || 'SUNDAY'}
                                            >
                                                {days.map(d => <MenuItem key={d} value={d}>{daysTranslation[d]}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            {...register(`schedules.${idx}.start_time` as const)}
                                            type="time"
                                            label="Heure *"
                                            sx={{ width: 150 }}
                                            error={!!errors.schedules?.[idx]?.start_time}
                                            helperText={errors.schedules?.[idx]?.start_time?.message}
                                        />
                                        <FormControl sx={{ minWidth: 200, flex: 1 }}>
                                            <InputLabel>Type d'activité *</InputLabel>
                                            <Select
                                                {...register(`schedules.${idx}.activity_type_id` as const, { valueAsNumber: true })}
                                                label="Type d'activité *"
                                                value={watch(`schedules.${idx}.activity_type_id`) || activityTypes[0]?.id || 1}
                                            >
                                                {activityTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.label_fr}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                        <IconButton
                                            color="error"
                                            onClick={() => removeSchedule(idx)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<AddIcon />}
                                onClick={() => appendSchedule({ day_of_week: 'SUNDAY', start_time: '10:00', activity_type_id: activityTypes[0]?.id || 1 })}
                                sx={{ mt: 3, borderStyle: 'dashed' }}
                            >
                                Ajouter un horaire
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* Boutons sticky en bas pour mobile */}
            <Box
                sx={{
                    display: { xs: 'flex', sm: 'none' },
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1.5,
                    bgcolor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
                    gap: 1.5,
                    zIndex: 1200,
                    flexDirection: 'column'
                }}
            >
                <Button
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                    variant="contained"
                    color="success"
                    size="medium"
                    startIcon={<SaveIcon sx={{ fontSize: 20 }} />}
                    fullWidth
                    sx={{ py: 1.25, fontWeight: 600 }}
                >
                    {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<VisibilityIcon sx={{ fontSize: 18 }} />}
                    onClick={() => {
                        const targetChurchId = isAdminMode ? churchId : myChurchId;
                        const url = targetChurchId ? `/map?church_id=${targetChurchId}` : '/map';
                        window.open(url, '_blank');
                    }}
                    disabled={!myChurchId && !churchId}
                    fullWidth
                    sx={{ py: 0.75 }}
                >
                    Aperçu Public
                </Button>
            </Box>
        </Box>
    );
}
