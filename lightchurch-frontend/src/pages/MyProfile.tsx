import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../lib/axios';
import { changePasswordSchema, type ChangePasswordFormData } from '../lib/validationSchemas';
import PasswordStrength from '../components/PasswordStrength';
import FormError from '../components/FormError';

interface ProfileData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  document_sirene_path: string | null;
  created_at: string;
}

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // États pour l'email
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // États pour afficher/masquer les mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États pour le mot de passe
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // États pour le document
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentMessage, setDocumentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // React Hook Form pour le changement de mot de passe
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword', '');

  // Charger le profil au montage
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      setNewEmail(response.data.email);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modifier l'email
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);
    setEmailLoading(true);

    try {
      const response = await api.put('/profile/email', { email: newEmail });

      setEmailMessage({ type: 'success', text: response.data.message });
      fetchProfile(); // Recharger le profil
    } catch (error: any) {
      setEmailMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'email',
      });
    } finally {
      setEmailLoading(false);
    }
  };

  // Changer le mot de passe avec validation Zod
  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordMessage(null);

    try {
      const response = await api.put('/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setPasswordMessage({ type: 'success', text: response.data.message });
      reset(); // Réinitialiser le formulaire
    } catch (error: any) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe',
      });
    }
  };

  // Mettre à jour le document
  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocumentMessage(null);

    if (!documentFile) {
      setDocumentMessage({ type: 'error', text: 'Veuillez sélectionner un fichier' });
      return;
    }

    setDocumentLoading(true);

    try {
      // Upload du fichier
      const formData = new FormData();
      formData.append('document', documentFile);

      const uploadResponse = await api.post('/upload/sirene', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const documentPath = uploadResponse.data.path;

      // Mise à jour du profil avec le nouveau chemin
      const response = await api.put('/profile/document', {
        document_sirene_path: documentPath,
      });

      setDocumentMessage({ type: 'success', text: response.data.message });
      setDocumentFile(null);
      fetchProfile(); // Recharger le profil
    } catch (error: any) {
      setDocumentMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erreur lors de la mise à jour du document',
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Mon Profil
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gérez vos informations personnelles et paramètres de compte
      </Typography>

      {profile && (
        <Stack spacing={3}>
          {/* Informations de base */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Informations de base
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Prénom
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {profile.first_name}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Nom
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {profile.last_name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Rôle
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {profile.role.replace('_', ' ')}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Statut
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {profile.status}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Modifier l'email */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Modifier l'email
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Email actuel: {profile.email}
                </Typography>
                <Box component="form" onSubmit={handleUpdateEmail}>
                  <TextField
                    fullWidth
                    label="Nouvel email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                  />
                  {emailMessage && (
                    <Alert severity={emailMessage.type} sx={{ mb: 2 }}>
                      {emailMessage.text}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={emailLoading || newEmail === profile.email}
                  >
                    {emailLoading ? <CircularProgress size={24} /> : 'Mettre à jour l\'email'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Changer le mot de passe */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Changer le mot de passe
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onPasswordSubmit)}>
                  <Stack spacing={2}>
                    {/* Mot de passe actuel */}
                    <Box>
                      <TextField
                        fullWidth
                        label="Mot de passe actuel"
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...register('currentPassword')}
                        error={!!errors.currentPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                                size="small"
                              >
                                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormError error={errors.currentPassword} />
                    </Box>

                    {/* Nouveau mot de passe */}
                    <Box>
                      <TextField
                        fullWidth
                        label="Nouveau mot de passe"
                        type={showNewPassword ? 'text' : 'password'}
                        {...register('newPassword')}
                        error={!!errors.newPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                                size="small"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormError error={errors.newPassword} />
                    </Box>

                    {/* Afficher la force du mot de passe */}
                    <PasswordStrength password={newPassword} />

                    {/* Confirmer le nouveau mot de passe */}
                    <Box>
                      <TextField
                        fullWidth
                        label="Confirmer le nouveau mot de passe"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmNewPassword')}
                        error={!!errors.confirmNewPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                size="small"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormError error={errors.confirmNewPassword} />
                    </Box>

                    {passwordMessage && (
                      <Alert severity={passwordMessage.type}>
                        {passwordMessage.text}
                      </Alert>
                    )}

                    <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
                      {isSubmitting ? <CircularProgress size={24} /> : 'Changer le mot de passe'}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Mettre à jour le document SIRENE */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Document SIRENE
              </Typography>
              {profile.document_sirene_path && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Document actuel:{' '}
                  <a
                    href={profile.document_sirene_path}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir le document
                  </a>
                </Alert>
              )}
              <Box component="form" onSubmit={handleUpdateDocument}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Téléchargez un nouveau document SIRENE pour mettre à jour votre dossier. Aucune revalidation
                  n'est nécessaire.
                </Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                  {documentFile ? documentFile.name : 'Choisir un fichier'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  />
                </Button>
                {documentMessage && (
                  <Alert severity={documentMessage.type} sx={{ mb: 2 }}>
                    {documentMessage.text}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={documentLoading || !documentFile}
                >
                  {documentLoading ? <CircularProgress size={24} /> : 'Mettre à jour le document'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
