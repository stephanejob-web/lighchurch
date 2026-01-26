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
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    Link,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {
    Close as CloseIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Language as WebsiteIcon,
    Place as PlaceIcon,
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
    Person as PersonIcon,
    Church as ChurchIcon
} from '@mui/icons-material';
import { fetchChurchDetails } from '../../services/publicMapService';
import type { ChurchDetails } from '../../types/publicMap';
import TikTokIcon from '../icons/TikTokIcon';

interface ChurchDetailsModalProps {
    open: boolean;
    onClose: () => void;
    churchId: number | null;
}

/**
 * Modal professionnel affichant tous les détails d'une église
 * Informations complètes : coordonnées, horaires, équipements, réseaux sociaux
 */
const ChurchDetailsModal: React.FC<ChurchDetailsModalProps> = ({
    open,
    onClose,
    churchId
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [church, setChurch] = useState<ChurchDetails | null>(null);

    useEffect(() => {
        if (!open || !churchId) {
            setChurch(null);
            setError(null);
            return;
        }

        const loadChurchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchChurchDetails(churchId);
                setChurch(data);
            } catch (err: any) {
                console.error('Error loading church details:', err);
                setError(err.message || 'Erreur lors du chargement des détails');
            } finally {
                setLoading(false);
            }
        };

        loadChurchDetails();
    }, [open, churchId]);

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
            aria-labelledby="church-details-title"
        >
            {/* En-tête */}
            <DialogTitle
                id="church-details-title"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <ChurchIcon color="primary" />
                    <Typography variant="h6" component="span">
                        Détails de l'église
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

                {church && !loading && (
                    <Stack spacing={3}>
                        {/* Nom de l'église */}
                        <Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {church.church_name}
                            </Typography>
                            {church.denomination_name && (
                                <Chip
                                    label={church.denomination_name}
                                    color="primary"
                                    size="small"
                                />
                            )}
                        </Box>

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
                                    {church.first_name} {church.last_name}
                                </Typography>
                                {church.email && (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                        <EmailIcon fontSize="small" color="action" />
                                        <Link href={`mailto:${church.email}`} underline="hover">
                                            {church.email}
                                        </Link>
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>

                        {/* Coordonnées */}
                        {church.details && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Coordonnées
                                    </Typography>
                                    <Stack spacing={2}>
                                        {/* Adresse */}
                                        {church.details.address && (
                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                <PlaceIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                                                <Box>
                                                    <Typography variant="body2">
                                                        {church.details.address}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {church.details.postal_code} {church.details.city}
                                                    </Typography>
                                                    {church.details.country && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {church.details.country}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        )}

                                        {/* Téléphone */}
                                        {church.details.phone && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <PhoneIcon fontSize="small" color="action" />
                                                <Link href={`tel:${church.details.phone}`} underline="hover">
                                                    {church.details.phone}
                                                </Link>
                                            </Stack>
                                        )}

                                        {/* Site web */}
                                        {church.details.website && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <WebsiteIcon fontSize="small" color="action" />
                                                <Link
                                                    href={church.details.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    underline="hover"
                                                >
                                                    {church.details.website}
                                                </Link>
                                            </Stack>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Horaires */}
                        {church.schedules && church.schedules.length > 0 && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <ScheduleIcon color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Horaires des cultes
                                        </Typography>
                                    </Stack>
                                    <List dense>
                                        {church.schedules.map((schedule) => (
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

                        {/* Équipements et services */}
                        {church.details && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Équipements et services
                                    </Typography>
                                    <Stack spacing={2}>
                                        {church.details.seating_capacity && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <ChairIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    Capacité: {church.details.seating_capacity} places
                                                </Typography>
                                            </Stack>
                                        )}

                                        {church.details.has_parking !== null && church.details.has_parking !== undefined && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <ParkingIcon
                                                    fontSize="small"
                                                    color={church.details.has_parking ? 'success' : 'disabled'}
                                                />
                                                <Typography variant="body2">
                                                    Parking: {church.details.has_parking ? 'Oui' : 'Non'}
                                                </Typography>
                                            </Stack>
                                        )}

                                        {church.details.accessibility_features !== null && church.details.accessibility_features !== undefined && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <AccessibleIcon
                                                    fontSize="small"
                                                    color={church.details.accessibility_features ? 'success' : 'disabled'}
                                                />
                                                <Typography variant="body2">
                                                    Accès PMR: {church.details.accessibility_features ? 'Oui' : 'Non'}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Stack>

                                    {/* Description */}
                                    {church.details.description && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {church.details.description}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Réseaux sociaux */}
                        {church.socials && church.socials.length > 0 && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Réseaux sociaux
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                        {church.socials.map((social) => (
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
                    </Stack>
                )}
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained">
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChurchDetailsModal;
