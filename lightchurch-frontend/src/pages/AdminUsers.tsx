import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    Grid,
    useTheme,
    useMediaQuery,
    Stack,
    Divider,
    Avatar
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Block as BlockIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Church as ChurchIcon
} from '@mui/icons-material';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/Loader';

// Types
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    church_id: number | null;
    created_at: string;
}

interface ChurchDetails {
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    pastor_name?: string;
    has_parking?: boolean;
    parking_capacity?: number;
}

interface ChurchSocial {
    platform: string;
    url: string;
}

interface Church {
    id: number;
    church_name: string;
    latitude: number;
    longitude: number;
    details: ChurchDetails;
    socials?: ChurchSocial[];
}

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    // Filters and Search
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Church View Modal
    const [viewingChurch, setViewingChurch] = useState<Church | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search,
                    role: roleFilter
                }
            });
            setUsers(data.users);
            setTotal(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, roleFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleViewChurch = async (churchId: number) => {
        try {
            const { data } = await api.get(`/admin/churches/${churchId}`);
            setViewingChurch(data);
        } catch (err) {
            console.error(err);
            alert('Erreur lors du chargement de l\'église');
        }
    };

    const updateUserStatus = async (id: number, status: string) => {
        try {
            await api.put(`/admin/users/${id}`, { status });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Erreur mise à jour');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Erreur suppression');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'VALIDATED':
                return <Chip label="Validé" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'PENDING':
                return <Chip label="En attente" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'SUSPENDED':
                return <Chip label="Suspendu" sx={{ bgcolor: 'orange.main', color: 'white', fontWeight: 'bold' }} size="small" />;
            case 'REJECTED':
                return <Chip label="Rejeté" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
            default:
                return status;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
            <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                    Utilisateurs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Liste des utilisateurs validés. Les demandes en attente ou rejetées sont dans l'onglet "Demandes d'inscription".
                </Typography>
            </Box>

            {/* Filters and Search */}
            <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={2}>
                        {/* Search */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                placeholder="Nom, prénom, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                label="Rechercher"
                            />
                        </Grid>

                        {/* Role Filter */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Rôle</InputLabel>
                                <Select
                                    value={roleFilter}
                                    label="Rôle"
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <MenuItem value="ALL">Tous les rôles</MenuItem>
                                    <MenuItem value="PASTOR">Pasteur</MenuItem>
                                    <MenuItem value="USER">Utilisateur</MenuItem>
                                    <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                        Liste Complète ({total})
                    </Typography>
                    {loading ? (
                        <TableSkeleton rows={itemsPerPage} />
                    ) : isMobile ? (
                        /* Vue Mobile - Cartes */
                        <Stack spacing={2}>
                            {users.map(user => {
                                const isOwnAccount = currentUser?.id === user.id;
                                return (
                                    <Card key={user.id} elevation={2}>
                                        <CardContent>
                                            <Stack spacing={2}>
                                                {/* En-tête */}
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {user.first_name} {user.last_name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                                            {user.email}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <Divider />

                                                {/* Informations */}
                                                <Stack spacing={1}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="caption" color="text.secondary">Rôle:</Typography>
                                                        <Chip label={user.role} color="primary" size="small" sx={{ fontFamily: 'monospace' }} />
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="caption" color="text.secondary">Statut:</Typography>
                                                        {getStatusBadge(user.status)}
                                                    </Stack>
                                                    {user.role === 'PASTOR' && user.church_id && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<ChurchIcon />}
                                                            onClick={() => handleViewChurch(user.church_id!)}
                                                            fullWidth
                                                        >
                                                            Voir l'église
                                                        </Button>
                                                    )}
                                                </Stack>

                                                {/* Actions */}
                                                {!isOwnAccount && (
                                                    <>
                                                        <Divider />
                                                        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                                                            {user.status === 'PENDING' && (
                                                                <>
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                                                                        onClick={() => updateUserStatus(user.id, 'VALIDATED')}
                                                                    >
                                                                        <CheckIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => updateUserStatus(user.id, 'REJECTED')}
                                                                    >
                                                                        <CloseIcon fontSize="small" />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                            {user.status === 'VALIDATED' && (
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{ bgcolor: 'orange', color: 'white', '&:hover': { bgcolor: 'darkorange' } }}
                                                                    onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                                                                    title="Suspendre"
                                                                >
                                                                    <BlockIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                            {(user.status === 'SUSPENDED' || user.status === 'REJECTED') && (
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                                                                    onClick={() => updateUserStatus(user.id, 'VALIDATED')}
                                                                    title="Réactiver"
                                                                >
                                                                    <RefreshIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDelete(user.id)}
                                                                title="Supprimer"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    </>
                                                )}
                                                {isOwnAccount && (
                                                    <>
                                                        <Divider />
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                                                            Votre compte
                                                        </Typography>
                                                    </>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    ) : (
                        /* Vue Desktop - Table */
                        <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary' }}>Nom</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Email</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Rôle</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Statut</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Église</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow
                                            key={user.id}
                                            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                        >
                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                {user.first_name} {user.last_name}
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>
                                                {user.email}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ fontFamily: 'monospace' }}
                                                />
                                            </TableCell>
                                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                                            <TableCell>
                                                {user.role === 'PASTOR' && user.church_id ? (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => user.church_id && handleViewChurch(user.church_id)}
                                                        title="Voir l'église"
                                                        sx={{
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'primary.dark' }
                                                        }}
                                                    >
                                                        <ChurchIcon fontSize="small" />
                                                    </IconButton>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {(() => {
                                                    const isOwnAccount = currentUser?.id === user.id;

                                                    if (isOwnAccount) {
                                                        return (
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                                Votre compte
                                                            </Typography>
                                                        );
                                                    }

                                                    return (
                                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                            {user.status === 'PENDING' && (
                                                                <>
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                                                                        onClick={() => updateUserStatus(user.id, 'VALIDATED')}
                                                                    >
                                                                        <CheckIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => updateUserStatus(user.id, 'REJECTED')}
                                                                    >
                                                                        <CloseIcon fontSize="small" />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                            {user.status === 'VALIDATED' && (
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{ bgcolor: 'orange', color: 'white', '&:hover': { bgcolor: 'darkorange' } }}
                                                                    onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                                                                    title="Suspendre"
                                                                >
                                                                    <BlockIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                            {(user.status === 'SUSPENDED' || user.status === 'REJECTED') && (
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                                                                    onClick={() => updateUserStatus(user.id, 'VALIDATED')}
                                                                    title="Réactiver"
                                                                >
                                                                    <RefreshIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDelete(user.id)}
                                                                title="Supprimer"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    );
                                                })()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pagination */}
                    {!loading && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Church View Modal */}
            <Dialog
                open={!!viewingChurch}
                onClose={() => setViewingChurch(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChurchIcon />
                    {viewingChurch?.church_name}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" color="text.secondary">Adresse</Typography>
                            <Typography>{viewingChurch?.details?.address || '-'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                            <Typography>{viewingChurch?.details?.phone || '-'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" color="text.secondary">Site Web</Typography>
                            <Typography>{viewingChurch?.details?.website || '-'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" color="text.secondary">Pasteur Principal</Typography>
                            <Typography>{viewingChurch?.details?.pastor_name || '-'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" color="text.secondary">Position</Typography>
                            <Typography variant="body2">
                                Lat: {viewingChurch?.latitude?.toFixed(6)}, Lng: {viewingChurch?.longitude?.toFixed(6)}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" color="text.secondary">Parking</Typography>
                            <Typography>
                                {viewingChurch?.details?.has_parking ? 'Oui' : 'Non'}
                                {viewingChurch?.details?.has_parking && viewingChurch?.details?.parking_capacity &&
                                    ` (${viewingChurch.details.parking_capacity} places)`}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">Description</Typography>
                            <Typography variant="body2">
                                {viewingChurch?.details?.description || 'Aucune description'}
                            </Typography>
                        </Grid>
                        {viewingChurch?.socials && viewingChurch.socials.length > 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" color="text.secondary">Réseaux Sociaux</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                    {viewingChurch.socials.map((social: any, idx: number) => (
                                        <Chip
                                            key={idx}
                                            label={social.platform}
                                            component="a"
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            clickable
                                            color="primary"
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewingChurch(null)}>Fermer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
