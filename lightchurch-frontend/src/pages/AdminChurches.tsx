import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    Grid
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/Loader';

export default function AdminChurches() {
    const navigate = useNavigate();
    const [churches, setChurches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<any>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    // Filters and Search
    const [search, setSearch] = useState('');
    const [denominationFilter, setDenominationFilter] = useState('ALL');
    const [cityFilter, setCityFilter] = useState('ALL');

    // Reference data
    const [denominations, setDenominations] = useState<any[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    useEffect(() => {
        fetchRefData();
    }, []);

    const fetchChurches = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/churches', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search,
                    denomination: denominationFilter,
                    city: cityFilter
                }
            });
            setChurches(data.churches);
            setTotal(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [currentPage, search, denominationFilter, cityFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchChurches();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchChurches]);

    const fetchRefData = async () => {
        try {
            const [denominationsRes, citiesRes] = await Promise.all([
                api.get('/settings/denominations'),
                api.get('/admin/cities')
            ]);
            setDenominations(denominationsRes.data);
            setCities(citiesRes.data);
        } catch (e) { console.error(e); }
    };

    const handleEdit = (id: number) => {
        // Rediriger vers la page d'édition (même interface que les pasteurs)
        navigate(`/dashboard/admin/churches/${id}/edit`);
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            await api.put(`/admin/churches/${editingId}`, formData);
            alert('Sauvegardé !');
            setEditingId(null);
            fetchChurches();
        } catch (e) { alert('Erreur sauvegarde'); }
    };

    const updateField = (field: string, value: any) => setFormData({ ...formData, [field]: value });

    const addSocial = () => updateField('socials', [...formData.socials, { platform: 'FACEBOOK', url: '' }]);
    const updateSocial = (idx: number, key: string, val: string) => {
        const copy = [...formData.socials];
        copy[idx] = { ...copy[idx], [key]: val };
        updateField('socials', copy);
    };
    const removeSocial = (idx: number) => updateField('socials', formData.socials.filter((_: any, i: number) => i !== idx));

    if (editingId && formData) {
        return (
            <Dialog
                open={true}
                onClose={() => setEditingId(null)}
                maxWidth="md"
                fullWidth
                aria-labelledby="edit-church-title"
                PaperProps={{
                    sx: { maxHeight: '90vh' }
                }}
            >
                <DialogTitle id="edit-church-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Édition Église #{editingId}</Typography>
                    <IconButton onClick={() => setEditingId(null)} size="small" aria-label="Fermer">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* GENERAL */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    value={formData.church_name}
                                    onChange={e => updateField('church_name', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Dénomination</InputLabel>
                                    <Select
                                        value={formData.denomination_id}
                                        label="Dénomination"
                                        onChange={e => updateField('denomination_id', e.target.value)}
                                    >
                                        {denominations.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Latitude"
                                    value={formData.latitude}
                                    onChange={e => updateField('latitude', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Longitude"
                                    value={formData.longitude}
                                    onChange={e => updateField('longitude', e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        {/* DETAILS */}
                        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Détails de contact</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Adresse"
                                        value={formData.address}
                                        onChange={e => updateField('address', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Téléphone"
                                        value={formData.phone}
                                        onChange={e => updateField('phone', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Site Web"
                                        value={formData.website}
                                        onChange={e => updateField('website', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Pasteur Principal"
                                        value={formData.pastor_name}
                                        onChange={e => updateField('pastor_name', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        multiline
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => updateField('description', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* SOCIALS */}
                        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Réseaux Sociaux</Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={addSocial}
                                >
                                    Ajouter
                                </Button>
                            </Box>
                            {formData.socials.map((s: any, i: number) => (
                                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    <Select
                                        value={s.platform}
                                        onChange={e => updateSocial(i, 'platform', e.target.value)}
                                        size="small"
                                        sx={{ minWidth: 120 }}
                                    >
                                        <MenuItem value="FACEBOOK">Facebook</MenuItem>
                                        <MenuItem value="INSTAGRAM">Instagram</MenuItem>
                                        <MenuItem value="YOUTUBE">Youtube</MenuItem>
                                    </Select>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={s.url}
                                        onChange={e => updateSocial(i, 'url', e.target.value)}
                                    />
                                    <IconButton size="small" color="error" onClick={() => removeSocial(i)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>

                        {/* ÉVÉNEMENTS */}
                        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Événements associés ({formData.events?.length || 0})
                            </Typography>
                            {formData.events && formData.events.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 300, overflow: 'auto' }}>
                                    {formData.events.map((event: any) => (
                                        <Card key={event.id} variant="outlined" sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {event.title}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        px: 1,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        bgcolor: event.status === 'PUBLISHED' ? 'success.main' : event.status === 'DRAFT' ? 'warning.main' : 'error.main',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {event.status}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                📅 {new Date(event.start_datetime).toLocaleString('fr-FR')} → {new Date(event.end_datetime).toLocaleString('fr-FR')}
                                            </Typography>
                                            {event.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    {event.description.substring(0, 100)}{event.description.length > 100 ? '...' : ''}
                                                </Typography>
                                            )}
                                        </Card>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Aucun événement associé à cette église
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingId(null)}>Annuler</Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                Gestion des Églises
            </Typography>

            {/* Filters and Search */}
            <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={2}>
                        {/* Search */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                placeholder="Nom d'église, ville, pasteur..."
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

                        {/* Denomination Filter */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Dénomination</InputLabel>
                                <Select
                                    value={denominationFilter}
                                    label="Dénomination"
                                    onChange={(e) => setDenominationFilter(e.target.value)}
                                >
                                    <MenuItem value="ALL">Toutes les dénominations</MenuItem>
                                    {denominations.map(d => (
                                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* City Filter */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Ville</InputLabel>
                                <Select
                                    value={cityFilter}
                                    label="Ville"
                                    onChange={(e) => setCityFilter(e.target.value)}
                                >
                                    <MenuItem value="ALL">Toutes les villes</MenuItem>
                                    {cities.map(city => (
                                        <MenuItem key={city} value={city}>{city}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Liste Complète ({total})
                    </Typography>
                    {loading ? (
                        <TableSkeleton rows={itemsPerPage} />
                    ) : (
                        <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary' }}>Nom</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Ville</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Dénomination</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Pasteur (Compte)</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {churches.map(church => (
                                        <TableRow
                                            key={church.id}
                                            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                        >
                                            <TableCell sx={{ fontWeight: 'medium' }}>{church.church_name}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>{church.city || '-'}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>{church.denomination}</TableCell>
                                            <TableCell sx={{ color: 'primary.main', fontFamily: 'monospace' }}>
                                                {church.first_name} {church.last_name}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                                                    onClick={() => handleEdit(church.id)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
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
        </Box>
    );
}
