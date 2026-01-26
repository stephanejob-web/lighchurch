import { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Stack,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Card,
    CardContent,
    Button,
    Skeleton
} from '@mui/material';
import {
    Close as CloseIcon,
    Church as ChurchIcon,
    LocationOn as LocationOnIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Schedule as ScheduleIcon,
    LocalParking as ParkingIcon,
    EventSeat as AccessibilityIcon,
    Description as DescriptionIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    YouTube as YouTubeIcon,
    WhatsApp as WhatsAppIcon,
    LinkedIn as LinkedInIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import TikTokIcon from './icons/TikTokIcon';

interface ChurchDetailsDrawerProps {
    open: boolean;
    onClose: () => void;
    churchData: {
        id: number;
        church_name: string;
        denomination_name?: string;
        longitude?: number;
        latitude?: number;
        details?: {
            pastor_first_name?: string;
            pastor_last_name?: string;
            description?: string;
            address?: string;
            street_number?: string;
            street_name?: string;
            city?: string;
            postal_code?: string;
            phone?: string;
            phone_number?: string;
            email?: string;
            website?: string;
            has_parking?: boolean;
            parking_capacity?: number;
            is_parking_free?: boolean;
            parking_info?: string;
            accessibility_info?: string;
            vision?: string;
        };
        schedules?: Array<{
            id: number;
            day_of_week: string;
            start_time: string;
            activity_type?: string;
        }>;
        socials?: Array<{
            id: number;
            platform: string;
            url: string;
        }>;
    } | null;
}

const ChurchDetailsDrawer: React.FC<ChurchDetailsDrawerProps> = ({
    open,
    onClose,
    churchData
}) => {
    const [loading] = useState(false);

    const getSocialIcon = (platform: string) => {
        const platformUpper = platform.toUpperCase();
        if (platformUpper === 'FACEBOOK') return <FacebookIcon sx={{ color: '#1877F2' }} />;
        if (platformUpper === 'INSTAGRAM') return <InstagramIcon sx={{ color: '#E4405F' }} />;
        if (platformUpper === 'YOUTUBE') return <YouTubeIcon sx={{ color: '#FF0000' }} />;
        if (platformUpper === 'WHATSAPP') return <WhatsAppIcon sx={{ color: '#25D366' }} />;
        if (platformUpper === 'TWITTER' || platformUpper === 'X') return <LanguageIcon sx={{ color: '#1DA1F2' }} />;
        if (platformUpper === 'TIKTOK') return <TikTokIcon sx={{ color: '#000000' }} />;
        if (platformUpper === 'LINKEDIN') return <LinkedInIcon sx={{ color: '#0A66C2' }} />;
        return <LanguageIcon />;
    };

    const formatSchedulesByDay = () => {
        if (!churchData?.schedules || churchData.schedules.length === 0) return {};

        const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const grouped: { [key: string]: typeof churchData.schedules } = {};

        churchData.schedules.forEach(schedule => {
            if (!grouped[schedule.day_of_week]) {
                grouped[schedule.day_of_week] = [];
            }
            grouped[schedule.day_of_week].push(schedule);
        });

        // Sort by day order
        const sorted: { [key: string]: typeof churchData.schedules } = {};
        dayOrder.forEach(day => {
            if (grouped[day]) {
                sorted[day] = grouped[day];
            }
        });

        return sorted;
    };

    if (!churchData) return null;

    const schedulesByDay = formatSchedulesByDay();

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 500 },
                    maxWidth: '100%',
                    height: '100%'
                }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box
                    sx={{
                        p: { xs: 2, sm: 3 },
                        borderBottom: 1,
                        borderColor: 'divider',
                        backgroundColor: 'primary.main',
                        color: 'white'
                    }}
                >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                        <Box sx={{ flex: 1, mr: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <ChurchIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    {churchData.church_name}
                                </Typography>
                            </Stack>
                            {churchData.denomination_name && (
                                <Chip
                                    label={churchData.denomination_name}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white'
                                    }}
                                />
                            )}
                        </Box>
                        <IconButton
                            onClick={onClose}
                            sx={{ color: 'white' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
                    {loading ? (
                        <Stack spacing={2}>
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                        </Stack>
                    ) : (
                        <Stack spacing={3}>
                            {/* Coordonnées */}
                            {churchData.details && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon color="primary" />
                                            Coordonnées
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {/* Pasteur responsable */}
                                            {(churchData.details.pastor_first_name || churchData.details.pastor_last_name) && (
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pasteur responsable
                                                    </Typography>
                                                    <Typography fontWeight={500}>
                                                        {churchData.details.pastor_first_name} {churchData.details.pastor_last_name}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Adresse complète */}
                                            {(churchData.details.street_number || churchData.details.street_name || churchData.details.address || churchData.details.postal_code || churchData.details.city) && (
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Adresse
                                                    </Typography>
                                                    {/* Afficher soit l'adresse complète, soit la construction numéro + rue */}
                                                    {churchData.details.address ? (
                                                        <Typography>{churchData.details.address}</Typography>
                                                    ) : (churchData.details.street_number || churchData.details.street_name) ? (
                                                        <Typography>
                                                            {churchData.details.street_number} {churchData.details.street_name}
                                                        </Typography>
                                                    ) : null}

                                                    {/* Code postal et ville */}
                                                    {(churchData.details.postal_code || churchData.details.city) && (
                                                        <Typography>
                                                            {churchData.details.postal_code} {churchData.details.city}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}

                                            {/* Téléphone */}
                                            {churchData.details.phone && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PhoneIcon fontSize="small" color="action" />
                                                    <Typography>
                                                        <a href={`tel:${churchData.details.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                            {churchData.details.phone}
                                                        </a>
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Email */}
                                            {churchData.details.email && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <EmailIcon fontSize="small" color="action" />
                                                    <Typography>
                                                        <a href={`mailto:${churchData.details.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                            {churchData.details.email}
                                                        </a>
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Site web */}
                                            {churchData.details.website && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LanguageIcon fontSize="small" color="action" />
                                                    <Typography>
                                                        <a href={churchData.details.website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                            {churchData.details.website}
                                                        </a>
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Bouton Google Maps */}
                                            {(churchData.longitude && churchData.latitude) && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<LocationOnIcon />}
                                                        href={`https://www.google.com/maps?q=${churchData.latitude},${churchData.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        fullWidth
                                                        sx={{
                                                            width: { xs: '100%', sm: 'auto' }
                                                        }}
                                                    >
                                                        Ouvrir dans Google Maps
                                                    </Button>
                                                </Box>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Description */}
                            {churchData.details?.description && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DescriptionIcon color="primary" />
                                            Description
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {churchData.details.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Vision */}
                            {churchData.details?.vision && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ChurchIcon color="primary" />
                                            Vision
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {churchData.details.vision}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Horaires */}
                            {Object.keys(schedulesByDay).length > 0 && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ScheduleIcon color="primary" />
                                            Horaires
                                        </Typography>
                                        <List disablePadding>
                                            {Object.entries(schedulesByDay).map(([day, schedules], index) => (
                                                <Box key={day}>
                                                    {index > 0 && <Divider sx={{ my: 1.5 }} />}
                                                    <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <Typography variant="body2" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                                                            {day}
                                                        </Typography>
                                                        {schedules.map((schedule) => (
                                                            <Box key={schedule.id} sx={{ ml: 2, mb: 0.5, width: '100%' }}>
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                    <Typography variant="body2">
                                                                        {schedule.activity_type || 'Activité'}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {schedule.start_time.slice(0, 5)}
                                                                    </Typography>
                                                                </Stack>
                                                            </Box>
                                                        ))}
                                                    </ListItem>
                                                </Box>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Informations pratiques */}
                            {(churchData.details?.has_parking || churchData.details?.parking_info || churchData.details?.accessibility_info) && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            Informations pratiques
                                        </Typography>
                                        <Stack spacing={2}>
                                            {/* Stationnement */}
                                            {(churchData.details.has_parking || churchData.details.parking_info) && (
                                                <Box>
                                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                                        <ParkingIcon color="action" fontSize="small" />
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                Stationnement
                                                            </Typography>

                                                            {churchData.details.has_parking && (
                                                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                                    <Chip
                                                                        label="Parking disponible"
                                                                        size="small"
                                                                        color="success"
                                                                        variant="outlined"
                                                                    />
                                                                    {churchData.details.parking_capacity && (
                                                                        <Chip
                                                                            label={`${churchData.details.parking_capacity} places`}
                                                                            size="small"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                    {churchData.details.is_parking_free && (
                                                                        <Chip
                                                                            label="Gratuit"
                                                                            size="small"
                                                                            color="success"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                </Stack>
                                                            )}

                                                            {churchData.details.parking_info && (
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                    {churchData.details.parking_info}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            )}

                                            {/* Accessibilité */}
                                            {churchData.details.accessibility_info && (
                                                <Box>
                                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                                        <AccessibilityIcon color="action" fontSize="small" />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                Accessibilité
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {churchData.details.accessibility_info}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Réseaux sociaux */}
                            {churchData.socials && churchData.socials.length > 0 && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            Réseaux sociaux
                                        </Typography>
                                        <List disablePadding>
                                            {churchData.socials.map((social) => (
                                                <ListItem key={social.id} disablePadding sx={{ mb: 1 }}>
                                                    <ListItemButton
                                                        component="a"
                                                        href={social.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{ borderRadius: 1, border: 1, borderColor: 'divider' }}
                                                    >
                                                        <ListItemIcon>
                                                            {getSocialIcon(social.platform)}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={social.platform}
                                                            secondary={social.url}
                                                            secondaryTypographyProps={{
                                                                sx: {
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            )}
                        </Stack>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default ChurchDetailsDrawer;
