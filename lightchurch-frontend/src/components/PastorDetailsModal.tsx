import { useState, useEffect } from 'react';
import api from '../lib/axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Stack,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import {
    Close as CloseIcon,
    Email as EmailIcon,
    Church as ChurchIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import ChurchDetailsDrawer from './ChurchDetailsDrawer';

interface PastorDetailsModalProps {
    open: boolean;
    onClose: () => void;
    pastorId: number;
}

interface PastorDetails {
    pastor: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    church: {
        id: number;
        church_name: string;
        denomination_name?: string;
        details: any;
        schedules: any[];
        socials: any[];
    };
}

const PastorDetailsModal = ({ open, onClose, pastorId }: PastorDetailsModalProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pastorDetails, setPastorDetails] = useState<PastorDetails | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (open && pastorId) {
            fetchPastorDetails();
        }
    }, [open, pastorId]);

    const fetchPastorDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get(`/pastor/network/${pastorId}`);

            // Ensure schedules and socials are always arrays
            if (data && data.church) {
                data.church.schedules = Array.isArray(data.church.schedules) ? data.church.schedules : [];
                data.church.socials = Array.isArray(data.church.socials) ? data.church.socials : [];
            }

            setPastorDetails(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des détails');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDrawer = () => {
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    const formatDaySchedules = () => {
        if (!pastorDetails?.church.schedules || pastorDetails.church.schedules.length === 0) {
            return null;
        }

        const schedulesByDay: { [key: string]: any[] } = {};
        pastorDetails.church.schedules.forEach((schedule) => {
            if (!schedulesByDay[schedule.day_of_week]) {
                schedulesByDay[schedule.day_of_week] = [];
            }
            schedulesByDay[schedule.day_of_week].push(schedule);
        });

        return schedulesByDay;
    };

    const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                aria-labelledby="pastor-details-title"
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle
                    id="pastor-details-title"
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: 1,
                        borderColor: 'divider',
                        pb: 2
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon color="primary" />
                        <Typography variant="h6" component="div">
                            Détails du Pasteur
                        </Typography>
                    </Stack>
                    <IconButton onClick={onClose} size="small" aria-label="Fermer la fenêtre">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : pastorDetails ? (
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    {pastorDetails.pastor.first_name} {pastorDetails.pastor.last_name}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        <a href={`mailto:${pastorDetails.pastor.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {pastorDetails.pastor.email}
                                        </a>
                                    </Typography>
                                </Stack>
                            </Box>

                            <Divider />

                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <ChurchIcon color="primary" />
                                    <Typography variant="h6">
                                        {pastorDetails.church.church_name}
                                    </Typography>
                                </Stack>

                                {pastorDetails.church.denomination_name && (
                                    <Chip
                                        label={pastorDetails.church.denomination_name}
                                        color="primary"
                                        variant="outlined"
                                        sx={{ mb: 2 }}
                                    />
                                )}

                                {pastorDetails.church.details?.phone_number && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        <strong>Téléphone:</strong> {pastorDetails.church.details.phone_number}
                                    </Typography>
                                )}

                                {pastorDetails.church.details?.city && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Ville:</strong> {pastorDetails.church.details.city} ({pastorDetails.church.details.postal_code})
                                    </Typography>
                                )}
                            </Box>

                            <Divider />

                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <ScheduleIcon color="primary" />
                                    <Typography variant="h6">
                                        Horaires des cultes
                                    </Typography>
                                </Stack>

                                {pastorDetails.church.schedules.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Aucun horaire renseigné
                                    </Typography>
                                ) : (
                                    <List dense>
                                        {Object.entries(formatDaySchedules() || {})
                                            .sort(([dayA], [dayB]) => dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB))
                                            .map(([day, schedules]) => (
                                                <ListItem key={day} sx={{ px: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                        <ScheduleIcon fontSize="small" color="action" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {day}
                                                            </Typography>
                                                        }
                                                        secondary={schedules.map((s: any, idx: number) => (
                                                            <Box key={idx} component="span" display="block">
                                                                {s.activity_type}: {s.start_time?.slice(0, 5) || 'N/A'} - {s.end_time?.slice(0, 5) || 'N/A'}
                                                                {s.recurrence && ` (${s.recurrence})`}
                                                            </Box>
                                                        ))}
                                                    />
                                                </ListItem>
                                            ))}
                                    </List>
                                )}
                            </Box>
                        </Stack>
                    ) : null}
                </DialogContent>

                <DialogActions sx={{ borderTop: 1, borderColor: 'divider', px: 3, py: 2 }}>
                    <Button onClick={onClose} variant="outlined">
                        Fermer
                    </Button>
                    {pastorDetails && (
                        <Button
                            onClick={handleOpenDrawer}
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                        >
                            Voir l'église complète
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {pastorDetails && (
                <ChurchDetailsDrawer
                    open={drawerOpen}
                    onClose={handleCloseDrawer}
                    churchData={pastorDetails.church}
                />
            )}
        </>
    );
};

export default PastorDetailsModal;
