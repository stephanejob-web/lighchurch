import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    Stack,
    IconButton,
    CircularProgress,
    Alert,
    Link,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {
    Close as CloseIcon,
    Event as EventIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Place as PlaceIcon,
    Church as ChurchIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Language as WebsiteIcon,
    AccessTime as ScheduleIcon,
    LocalParking as ParkingIcon,
    Accessible as AccessibleIcon,
    Chair as ChairIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    YouTube as YouTubeIcon,
    Twitter as TwitterIcon,
    WhatsApp as WhatsAppIcon,
    LinkedIn as LinkedInIcon,
    Translate as TranslateIcon,
    EventSeat as EventSeatIcon,
    MoneyOff as MoneyOffIcon,
    AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { fetchEventDetails } from '../../services/publicMapService';
import type { EventDetails } from '../../types/publicMap';
import TikTokIcon from '../icons/TikTokIcon';

interface EventDetailsModalProps {
    open: boolean;
    onClose: () => void;
    eventId: number | null;
}

/**
 * Modal professionnel affichant tous les détails d'un événement
 */
const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
    open,
    onClose,
    eventId
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [event, setEvent] = useState<EventDetails | null>(null);

    useEffect(() => {
        if (!open || !eventId) {
            setEvent(null);
            setError(null);
            return;
        }

        const loadEventDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchEventDetails(eventId);
                setEvent(data);
            } catch (err: any) {
                console.error('Error loading event details:', err);
                setError(err.message || 'Erreur lors du chargement des détails');
            } finally {
                setLoading(false);
            }
        };

        loadEventDetails();
    }, [open, eventId]);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSocialIcon = (platform: string) => {
        const platformUpper = platform.toUpperCase();
        switch (platformUpper) {
            case 'FACEBOOK':
                return <FacebookIcon sx={{ color: '#1877F2' }} />;
            case 'INSTAGRAM':
                return <InstagramIcon sx={{ color: '#E4405F' }} />;
            case 'YOUTUBE':
                return <YouTubeIcon sx={{ color: '#FF0000' }} />;
            case 'TWITTER':
            case 'X':
                return <TwitterIcon sx={{ color: '#1DA1F2' }} />;
            case 'WHATSAPP':
                return <WhatsAppIcon sx={{ color: '#25D366' }} />;
            case 'TIKTOK':
                return <TikTokIcon sx={{ color: '#000000' }} />;
            case 'LINKEDIN':
                return <LinkedInIcon sx={{ color: '#0A66C2' }} />;
            default:
                return <WebsiteIcon />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            aria-labelledby="event-details-title"
        >
            {/* En-tête */}
            <DialogTitle
                id="event-details-title"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <EventIcon color="secondary" />
                    <Typography variant="h6" component="span">
                        Détails de l'événement
                    </Typography>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            {/* Contenu */}
            <DialogContent>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && !loading && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {event && !loading && (
                    <Stack spacing={3}>
                        {/* Image de couverture */}
                        {event.details?.image_url && (
                            <Box
                                component="img"
                                src={event.details.image_url}
                                alt={event.title}
                                sx={{
                                    width: '100%',
                                    maxHeight: 300,
                                    objectFit: 'cover',
                                    borderRadius: 2
                                }}
                            />
                        )}

                        {/* Titre de l'événement */}
                        <Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {event.title}
                            </Typography>

                            {/* Badges d'informations rapides */}
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                                {event.details?.is_free !== undefined && (
                                    <Chip
                                        icon={event.details.is_free ? <MoneyOffIcon /> : <AttachMoneyIcon />}
                                        label={event.details.is_free ? 'Entrée gratuite' : 'Payant'}
                                        color={event.details.is_free ? 'success' : 'default'}
                                        size="small"
                                    />
                                )}
                                {event.details?.max_seats && (
                                    <Chip
                                        icon={<EventSeatIcon />}
                                        label={`${event.details.max_seats} places max`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                {event.primary_language && (
                                    <Chip
                                        label={`${event.primary_language.flag || ''} ${event.primary_language.name}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        </Box>

                        {/* Date et heure */}
                        <Card variant="outlined">
                            <CardContent>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <CalendarIcon color="secondary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Date et heure
                                    </Typography>
                                </Stack>

                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TimeIcon fontSize="small" color="action" />
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                                Début
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDateTime(event.start_datetime)}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {event.end_datetime && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <TimeIcon fontSize="small" color="action" />
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    Fin
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDateTime(event.end_datetime)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Église organisatrice */}
                        {event.church_name && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <ChurchIcon color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Église organisatrice
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" fontWeight={500}>
                                        {event.church_name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}

                        {/* Organisateur et Intervenant */}
                        {(event.organizer_name || event.details?.speaker_name) && (
                            <Card variant="outlined">
                                <CardContent>
                                    {event.organizer_name && (
                                        <Box sx={{ mb: event.details?.speaker_name ? 2 : 0 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <PersonIcon color="action" />
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Organisé par
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body1" fontWeight={500}>
                                                {event.organizer_name}
                                            </Typography>
                                        </Box>
                                    )}

                                    {event.details?.speaker_name && (
                                        <Box>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <PersonIcon color="primary" />
                                                <Typography variant="subtitle2" color="primary">
                                                    Intervenant
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body1" fontWeight={600}>
                                                {event.details.speaker_name}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Langues et traductions */}
                        {(event.primary_language || (event.translations && event.translations.length > 0)) && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <TranslateIcon color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Langues
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={2}>
                                        {event.primary_language && (
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Langue principale
                                                </Typography>
                                                <Chip
                                                    label={`${event.primary_language.flag || ''} ${event.primary_language.name}`}
                                                    color="primary"
                                                />
                                            </Box>
                                        )}

                                        {event.translations && event.translations.length > 0 && (
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Traductions disponibles
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                    {event.translations.map((translation) => (
                                                        <Chip
                                                            key={`translation-${translation.code || translation.name}`}
                                                            label={`${translation.flag || ''} ${translation.name}`}
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Parking */}
                        {event.details?.has_parking !== undefined && event.details.has_parking && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <ParkingIcon color="success" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Parking disponible
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={1}>
                                        {event.details.parking_capacity && (
                                            <Typography variant="body2">
                                                Capacité: {event.details.parking_capacity} places
                                            </Typography>
                                        )}
                                        {event.details.is_parking_free !== undefined && (
                                            <Chip
                                                label={event.details.is_parking_free ? 'Parking gratuit' : 'Parking payant'}
                                                color={event.details.is_parking_free ? 'success' : 'default'}
                                                size="small"
                                                sx={{ width: 'fit-content' }}
                                            />
                                        )}
                                        {event.details.parking_details && (
                                            <Typography variant="body2" color="text.secondary">
                                                {event.details.parking_details}
                                            </Typography>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Lieu */}
                        {event.details && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <PlaceIcon color="secondary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Lieu
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={1}>
                                        {event.details.address && (
                                            <Typography variant="body2">
                                                {event.details.address}
                                            </Typography>
                                        )}
                                        {event.details.city && (
                                            <Typography variant="body2">
                                                {event.details.postal_code} {event.details.city}
                                            </Typography>
                                        )}
                                        {event.details.country && (
                                            <Typography variant="body2" color="text.secondary">
                                                {event.details.country}
                                            </Typography>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        {event.details?.description && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {event.details.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}

                        {/* Informations supplémentaires */}
                        {event.details && (event.details.contact_email || event.details.contact_phone) && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Contact
                                    </Typography>
                                    <Stack spacing={1}>
                                        {event.details.contact_email && (
                                            <Link href={`mailto:${event.details.contact_email}`} underline="hover">
                                                {event.details.contact_email}
                                            </Link>
                                        )}
                                        {event.details.contact_phone && (
                                            <Link href={`tel:${event.details.contact_phone}`} underline="hover">
                                                {event.details.contact_phone}
                                            </Link>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Informations sur l'église */}
                        {event.church && (
                            <>
                                <Divider sx={{ my: 2 }}>
                                    <Chip label="Informations sur l'église" color="primary" />
                                </Divider>

                                {/* Informations du pasteur */}
                                <Card variant="outlined">
                                    <CardContent>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                            <PersonIcon color="primary" />
                                            <Typography variant="h6" fontWeight={600}>
                                                Pasteur
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body1" fontWeight={500}>
                                            {event.church.pastor_first_name} {event.church.pastor_last_name}
                                        </Typography>
                                        {event.church.pastor_email && (
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                                <EmailIcon fontSize="small" color="action" />
                                                <Link href={`mailto:${event.church.pastor_email}`} underline="hover">
                                                    {event.church.pastor_email}
                                                </Link>
                                            </Stack>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Coordonnées de l'église */}
                                {event.church.details && (
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                                Coordonnées de l'église
                                            </Typography>
                                            <Stack spacing={2}>
                                                {/* Adresse */}
                                                {event.church.details.address && (
                                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                                        <PlaceIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {event.church.details.address}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {event.church.details.postal_code} {event.church.details.city}
                                                            </Typography>
                                                            {event.church.details.country && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {event.church.details.country}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                )}

                                                {/* Téléphone */}
                                                {event.church.details.phone && (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <PhoneIcon fontSize="small" color="action" />
                                                        <Link href={`tel:${event.church.details.phone}`} underline="hover">
                                                            {event.church.details.phone}
                                                        </Link>
                                                    </Stack>
                                                )}

                                                {/* Site web */}
                                                {event.church.details.website && (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <WebsiteIcon fontSize="small" color="action" />
                                                        <Link
                                                            href={event.church.details.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            underline="hover"
                                                        >
                                                            {event.church.details.website}
                                                        </Link>
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Horaires de l'église */}
                                {event.church.schedules && event.church.schedules.length > 0 && (
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <ScheduleIcon color="primary" />
                                                <Typography variant="h6" fontWeight={600}>
                                                    Horaires des cultes
                                                </Typography>
                                            </Stack>
                                            <List dense>
                                                {event.church.schedules.map((schedule) => (
                                                    <ListItem key={`schedule-${schedule.day_of_week}-${schedule.start_time}`} disableGutters>
                                                        <ListItemText
                                                            primary={schedule.day_of_week}
                                                            secondary={`${schedule.start_time.slice(0, 5)} - ${schedule.activity_type || 'Culte'}`}
                                                            primaryTypographyProps={{ fontWeight: 500 }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Équipements de l'église */}
                                {event.church.details && (
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                                Équipements et services
                                            </Typography>
                                            <Stack spacing={2}>
                                                {event.church.details.seating_capacity && (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <ChairIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            Capacité: {event.church.details.seating_capacity} places
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                {event.church.details.has_parking !== null && event.church.details.has_parking !== undefined && (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <ParkingIcon
                                                            fontSize="small"
                                                            color={event.church.details.has_parking ? 'success' : 'disabled'}
                                                        />
                                                        <Typography variant="body2">
                                                            Parking: {event.church.details.has_parking ? 'Oui' : 'Non'}
                                                        </Typography>
                                                    </Stack>
                                                )}

                                                {event.church.details.accessibility_features !== null && event.church.details.accessibility_features !== undefined && (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <AccessibleIcon
                                                            fontSize="small"
                                                            color={event.church.details.accessibility_features ? 'success' : 'disabled'}
                                                        />
                                                        <Typography variant="body2">
                                                            Accès PMR: {event.church.details.accessibility_features ? 'Oui' : 'Non'}
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Stack>

                                            {/* Description de l'église */}
                                            {event.church.details.description && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" color="text.secondary" paragraph>
                                                        {event.church.details.description}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Réseaux sociaux de l'église */}
                                {event.church.socials && event.church.socials.length > 0 && (
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                                Réseaux sociaux
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                {event.church.socials.map((social) => (
                                                    <Chip
                                                        key={`social-${social.platform}-${social.url}`}
                                                        icon={getSocialIcon(social.platform)}
                                                        label={social.platform}
                                                        component="a"
                                                        href={social.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        clickable
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </Stack>
                )}
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained" color="secondary">
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EventDetailsModal;
