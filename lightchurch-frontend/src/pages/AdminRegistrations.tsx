import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    useTheme,
    useMediaQuery,
    Stack,
    Divider,
    Avatar
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '../lib/axios';

interface Registration {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    document_sirene_path: string;
    rejection_reason?: string;
    created_at: string;
}

export default function AdminRegistrations() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/pending-registrations');
            setRegistrations(data);
        } catch (error) {
            console.error('Erreur lors du chargement des demandes:', error);
            alert('Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir valider cette demande ?')) return;

        try {
            await api.post(`/admin/validate-registration/${id}`);
            alert('Demande validée avec succès!');
            loadRegistrations();
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            alert('Erreur lors de la validation');
        }
    };

    const handleReject = async () => {
        if (!selectedRegistration || !rejectionReason.trim()) {
            alert('Veuillez fournir une raison de refus');
            return;
        }

        try {
            await api.post(`/admin/reject-registration/${selectedRegistration.id}`, {
                reason: rejectionReason
            });
            alert('Demande rejetée');
            setRejectDialogOpen(false);
            setRejectionReason('');
            setSelectedRegistration(null);
            loadRegistrations();
        } catch (error) {
            console.error('Erreur lors du rejet:', error);
            alert('Erreur lors du rejet');
        }
    };

    const openRejectDialog = (registration: Registration) => {
        setSelectedRegistration(registration);
        setRejectDialogOpen(true);
    };

    const getStatusChip = (status: string) => {
        const colors: Record<string, { color: any; label: string }> = {
            PENDING: { color: 'warning', label: 'En attente' },
            VALIDATED: { color: 'success', label: 'Validé' },
            REJECTED: { color: 'error', label: 'Rejeté' },
            SUSPENDED: { color: 'default', label: 'Suspendu' }
        };

        const statusInfo = colors[status] || { color: 'default', label: status };
        return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />;
    };

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Chargement...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                Demandes d'inscription
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Liste des comptes en attente de validation ou rejetés. Les comptes validés apparaissent dans l'onglet Utilisateurs.
            </Typography>

            {registrations.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" align="center">
                            Aucune demande en attente
                        </Typography>
                    </CardContent>
                </Card>
            ) : isMobile ? (
                /* Vue Mobile - Cartes */
                <Stack spacing={2}>
                    {registrations.map((registration) => (
                        <Card key={registration.id} elevation={2}>
                            <CardContent>
                                <Stack spacing={2}>
                                    {/* En-tête */}
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                            {registration.first_name.charAt(0)}{registration.last_name.charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {registration.first_name} {registration.last_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                                {registration.email}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Divider />

                                    {/* Informations */}
                                    <Stack spacing={1}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="caption" color="text.secondary">Rôle:</Typography>
                                            <Chip label={registration.role} size="small" color="primary" />
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="caption" color="text.secondary">Statut:</Typography>
                                            {getStatusChip(registration.status)}
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="caption" color="text.secondary">Date:</Typography>
                                            <Typography variant="body2">
                                                {new Date(registration.created_at).toLocaleDateString('fr-FR')}
                                            </Typography>
                                        </Stack>
                                        {registration.document_sirene_path && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => window.open(registration.document_sirene_path, '_blank')}
                                                fullWidth
                                            >
                                                Voir le document
                                            </Button>
                                        )}
                                    </Stack>

                                    {/* Actions */}
                                    {registration.status === 'PENDING' && (
                                        <>
                                            <Divider />
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => handleValidate(registration.id)}
                                                    fullWidth
                                                >
                                                    Valider
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => openRejectDialog(registration)}
                                                    fullWidth
                                                >
                                                    Rejeter
                                                </Button>
                                            </Stack>
                                        </>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            ) : (
                /* Vue Desktop - Table */
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Nom</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Rôle</strong></TableCell>
                                <TableCell><strong>Statut</strong></TableCell>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell><strong>Document</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {registrations.map((registration) => (
                                <TableRow key={registration.id}>
                                    <TableCell>
                                        {registration.first_name} {registration.last_name}
                                    </TableCell>
                                    <TableCell>{registration.email}</TableCell>
                                    <TableCell>{registration.role}</TableCell>
                                    <TableCell>{getStatusChip(registration.status)}</TableCell>
                                    <TableCell>
                                        {new Date(registration.created_at).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell>
                                        {registration.document_sirene_path ? (
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => window.open(registration.document_sirene_path, '_blank')}
                                                title="Voir le document"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        ) : (
                                            <Typography variant="caption" color="error">
                                                Aucun document
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {registration.status === 'PENDING' && (
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => handleValidate(registration.id)}
                                                >
                                                    Valider
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => openRejectDialog(registration)}
                                                >
                                                    Rejeter
                                                </Button>
                                            </Box>
                                        )}
                                        {registration.status === 'REJECTED' && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                                                {registration.rejection_reason && (
                                                    <Typography variant="caption" color="error" sx={{ fontStyle: 'italic' }}>
                                                        Raison: {registration.rejection_reason}
                                                    </Typography>
                                                )}
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => handleValidate(registration.id)}
                                                >
                                                    Valider quand même
                                                </Button>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog de rejet */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Rejeter la demande</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Demande de: {selectedRegistration?.first_name} {selectedRegistration?.last_name}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Raison du refus"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Ex: Le document SIRENE fourni n'est pas valide ou lisible..."
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Annuler</Button>
                    <Button
                        onClick={handleReject}
                        variant="contained"
                        color="error"
                        disabled={!rejectionReason.trim()}
                    >
                        Confirmer le refus
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
