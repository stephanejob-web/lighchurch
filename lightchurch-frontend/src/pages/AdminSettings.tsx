import { useState, useEffect } from 'react';
import api from '../lib/axios';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    IconButton,
    Tabs,
    Tab,
    List,
    ListItem,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon
} from '@mui/icons-material';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState(0);

    // Data
    const [languages, setLanguages] = useState<any[]>([]);
    const [activityTypes, setActivityTypes] = useState<any[]>([]);
    const [denominations, setDenominations] = useState<any[]>([]);
    const [churchUnions, setChurchUnions] = useState<any[]>([]);

    // Inputs
    const [langInput, setLangInput] = useState({ code: '', name_native: '', name_fr: '', flag_emoji: '' });
    const [typeInput, setTypeInput] = useState({ name: '', label_fr: '', icon: '' });
    const [denomInput, setDenomInput] = useState({ name: '', abbreviation: '', union_id: '', is_active: 1 });

    // Editing states
    const [editingLangId, setEditingLangId] = useState<number | null>(null);
    const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
    const [editingDenomId, setEditingDenomId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [langRes, typeRes, denomRes, unionRes] = await Promise.all([
                api.get('/settings/languages'),
                api.get('/settings/activity_types'),
                api.get('/settings/denominations'),
                api.get('/settings/church_unions')
            ]);
            setLanguages(langRes.data);
            setActivityTypes(typeRes.data);
            setDenominations(denomRes.data);
            setChurchUnions(unionRes.data);
        } catch (e) { console.error(e); }
    };

    const createLanguage = async () => {
        if (!langInput.code) return;
        try {
            if (editingLangId) {
                await api.put(`/settings/languages/${editingLangId}`, langInput);
                setEditingLangId(null);
            } else {
                await api.post('/settings/languages', langInput);
            }
            setLangInput({ code: '', name_native: '', name_fr: '', flag_emoji: '' });
            fetchData();
        } catch (e) { alert('Erreur sauvegarde langue'); }
    };

    const createType = async () => {
        if (!typeInput.name) return;
        try {
            if (editingTypeId) {
                await api.put(`/settings/activity_types/${editingTypeId}`, typeInput);
                setEditingTypeId(null);
            } else {
                await api.post('/settings/activity_types', typeInput);
            }
            setTypeInput({ name: '', label_fr: '', icon: '' });
            fetchData();
        } catch (e) { alert('Erreur sauvegarde type'); }
    };

    const createDenomination = async () => {
        if (!denomInput.name) return;
        try {
            if (editingDenomId) {
                await api.put(`/settings/denominations/${editingDenomId}`, denomInput);
                setEditingDenomId(null);
            } else {
                await api.post('/settings/denominations', denomInput);
            }
            setDenomInput({ name: '', abbreviation: '', union_id: '', is_active: 1 });
            fetchData();
        } catch (e) { alert('Erreur sauvegarde dénomination'); }
    };

    const editLanguage = (lang: any) => {
        setLangInput({
            code: lang.code,
            name_native: lang.name_native,
            name_fr: lang.name_fr,
            flag_emoji: lang.flag_emoji
        });
        setEditingLangId(lang.id);
    };

    const editType = (type: any) => {
        setTypeInput({
            name: type.name,
            label_fr: type.label_fr,
            icon: type.icon
        });
        setEditingTypeId(type.id);
    };

    const editDenomination = (denom: any) => {
        setDenomInput({
            name: denom.name,
            abbreviation: denom.abbreviation || '',
            union_id: denom.union_id || '',
            is_active: denom.is_active
        });
        setEditingDenomId(denom.id);
    };

    const cancelEdit = (type: 'lang' | 'type' | 'denom') => {
        if (type === 'lang') {
            setLangInput({ code: '', name_native: '', name_fr: '', flag_emoji: '' });
            setEditingLangId(null);
        } else if (type === 'type') {
            setTypeInput({ name: '', label_fr: '', icon: '' });
            setEditingTypeId(null);
        } else {
            setDenomInput({ name: '', abbreviation: '', union_id: '', is_active: 1 });
            setEditingDenomId(null);
        }
    };

    const deleteItem = async (table: string, id: number) => {
        if (!confirm('Supprimer ?')) return;
        try {
            await api.delete(`/settings/${table}/${id}`);
            fetchData();
        } catch (e) { alert('Erreur suppression'); }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                Configuration Globale
            </Typography>

            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                <Tab label="Langues" />
                <Tab label="Types d'activités" />
                <Tab label="Dénominations" />
            </Tabs>

            {/* LANGUAGES */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    {editingLangId ? 'Modifier Langue' : 'Nouvelle Langue'}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Code ISO (ex: en)"
                                        value={langInput.code}
                                        onChange={e => setLangInput({ ...langInput, code: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Nom Natif (ex: English)"
                                        value={langInput.name_native}
                                        onChange={e => setLangInput({ ...langInput, name_native: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Nom Français (ex: Anglais)"
                                        value={langInput.name_fr}
                                        onChange={e => setLangInput({ ...langInput, name_fr: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Emoji Drapeau"
                                        value={langInput.flag_emoji}
                                        onChange={e => setLangInput({ ...langInput, flag_emoji: e.target.value })}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={editingLangId ? <SaveIcon /> : <AddIcon />}
                                            onClick={createLanguage}
                                        >
                                            {editingLangId ? 'Sauvegarder' : 'Ajouter'}
                                        </Button>
                                        {editingLangId && (
                                            <IconButton onClick={() => cancelEdit('lang')}>
                                                <CloseIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Langues Actives</Typography>
                                <List>
                                    {languages.map(l => (
                                        <ListItem
                                            key={l.id}
                                            secondaryAction={
                                                <Box>
                                                    <IconButton size="small" color="primary" onClick={() => editLanguage(l)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => deleteItem('languages', l.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            }
                                        >
                                            {l.flag_emoji} {l.name_fr} ({l.code})
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* ACTIVITY TYPES */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    {editingTypeId ? 'Modifier Type d\'Activité' : 'Nouveau Type d\'Activité'}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Nom technique (ex: SUNDAY_SERVICE)"
                                        value={typeInput.name}
                                        onChange={e => setTypeInput({ ...typeInput, name: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Label FR (ex: Culte du Dimanche)"
                                        value={typeInput.label_fr}
                                        onChange={e => setTypeInput({ ...typeInput, label_fr: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Nom Icône (ex: User)"
                                        value={typeInput.icon}
                                        onChange={e => setTypeInput({ ...typeInput, icon: e.target.value })}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={editingTypeId ? <SaveIcon /> : <AddIcon />}
                                            onClick={createType}
                                        >
                                            {editingTypeId ? 'Sauvegarder' : 'Ajouter'}
                                        </Button>
                                        {editingTypeId && (
                                            <IconButton onClick={() => cancelEdit('type')}>
                                                <CloseIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Types Actifs</Typography>
                                <List>
                                    {activityTypes.map(t => (
                                        <ListItem
                                            key={t.id}
                                            secondaryAction={
                                                <Box>
                                                    <IconButton size="small" color="primary" onClick={() => editType(t)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => deleteItem('activity_types', t.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            }
                                        >
                                            {t.label_fr}
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* DENOMINATIONS */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    {editingDenomId ? 'Modifier Dénomination' : 'Nouvelle Dénomination'}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Nom complet (ex: Assemblées de Dieu)"
                                        value={denomInput.name}
                                        onChange={e => setDenomInput({ ...denomInput, name: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Abréviation (ex: ADD)"
                                        value={denomInput.abbreviation}
                                        onChange={e => setDenomInput({ ...denomInput, abbreviation: e.target.value })}
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel>Union (optionnel)</InputLabel>
                                        <Select
                                            value={denomInput.union_id}
                                            label="Union (optionnel)"
                                            onChange={e => setDenomInput({ ...denomInput, union_id: e.target.value })}
                                        >
                                            <MenuItem value="">Aucune</MenuItem>
                                            {churchUnions.map(u => (
                                                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={denomInput.is_active === 1}
                                                onChange={e => setDenomInput({ ...denomInput, is_active: e.target.checked ? 1 : 0 })}
                                            />
                                        }
                                        label="Active"
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={editingDenomId ? <SaveIcon /> : <AddIcon />}
                                            onClick={createDenomination}
                                        >
                                            {editingDenomId ? 'Sauvegarder' : 'Ajouter'}
                                        </Button>
                                        {editingDenomId && (
                                            <IconButton onClick={() => cancelEdit('denom')}>
                                                <CloseIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Dénominations Actives ({denominations.filter(d => d.is_active).length})
                                </Typography>
                                <List>
                                    {denominations.map(d => (
                                        <ListItem
                                            key={d.id}
                                            sx={{ opacity: d.is_active ? 1 : 0.5 }}
                                            secondaryAction={
                                                <Box>
                                                    <IconButton size="small" color="primary" onClick={() => editDenomination(d)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => deleteItem('denominations', d.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            }
                                        >
                                            <Box>
                                                <Typography variant="body1">{d.name}</Typography>
                                                {d.abbreviation && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        ({d.abbreviation})
                                                    </Typography>
                                                )}
                                                {!d.is_active && (
                                                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                                        Inactive
                                                    </Typography>
                                                )}
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}
