import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../lib/axios';
import { registerSchema, type RegisterFormData } from '../lib/validationSchemas';
import FormError, { BackendErrors } from '../components/FormError';
import PasswordStrength from '../components/PasswordStrength';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  InputAdornment,
  IconButton,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff, Church, Upload as UploadIcon, CheckCircle as CheckCircleIcon, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Register() {
  const [success, setSuccess] = useState('');
  const [backendErrors, setBackendErrors] = useState<
    Array<{ field: string; message: string }>
  >([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [documentSirenePath, setDocumentSirenePath] = useState('');
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentFileName, setDocumentFileName] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format non autorisé. Seuls les PDF, JPG et PNG sont acceptés.');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale : 10MB');
      return;
    }

    try {
      setDocumentUploading(true);
      const formData = new FormData();
      formData.append('document', file);

      const { data } = await api.post('/upload/sirene', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDocumentSirenePath(data.path);
      setDocumentFileName(file.name);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload du document');
    } finally {
      setDocumentUploading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setBackendErrors([]);
    setSuccess('');

    // Vérifier que le document SIRENE a été uploadé
    if (!documentSirenePath) {
      setBackendErrors([{
        field: 'document',
        message: 'Le document SIRENE est obligatoire'
      }]);
      return;
    }

    try {
      await api.post('/auth/register', {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        document_sirene_path: documentSirenePath,
      });

      setSuccess('Inscription réussie ! Votre compte est en attente de validation par un administrateur.');
      reset();
      setDocumentSirenePath('');
      setDocumentFileName('');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setBackendErrors(err.response.data.errors);
      } else {
        setBackendErrors([
          {
            field: 'général',
            message: err.response?.data?.message || 'Une erreur est survenue',
          },
        ]);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        px: 2,
        py: 4,
        position: 'relative'
      }}
    >
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBack />}
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          color: 'white',
          textTransform: 'none',
          fontWeight: 500,
          opacity: 0.8,
          '&:hover': {
            opacity: 1,
            bgcolor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        Retour à l'accueil
      </Button>

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
                  mb: 2,
                }}
              >
                <Church sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Rejoindre Light Church
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Créez votre compte pasteur
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Backend Errors */}
              <BackendErrors errors={backendErrors} />

              {/* Success Message */}
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#60A5FA',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Se connecter
                  </Link>
                </Alert>
              )}

              {/* First Name & Last Name */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        Prénom <span style={{ color: '#EF4444' }}>*</span>
                      </>
                    }
                    {...register('first_name')}
                    error={!!errors.first_name}
                  />
                  <FormError error={errors.first_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        Nom <span style={{ color: '#EF4444' }}>*</span>
                      </>
                    }
                    {...register('last_name')}
                    error={!!errors.last_name}
                  />
                  <FormError error={errors.last_name} />
                </Grid>
              </Grid>

              {/* Email */}
              <TextField
                fullWidth
                label={
                  <>
                    Email <span style={{ color: '#EF4444' }}>*</span>
                  </>
                }
                type="email"
                {...register('email')}
                error={!!errors.email}
                sx={{ mb: 2.5 }}
                autoComplete="email"
              />
              <FormError error={errors.email} />

              {/* Password */}
              <TextField
                fullWidth
                label={
                  <>
                    Mot de passe <span style={{ color: '#EF4444' }}>*</span>
                  </>
                }
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                sx={{ mb: 1 }}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormError error={errors.password} />
              <PasswordStrength password={password} />

              {/* Confirm Password */}
              <TextField
                fullWidth
                label={
                  <>
                    Confirmer le mot de passe <span style={{ color: '#EF4444' }}>*</span>
                  </>
                }
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                sx={{ mb: 1, mt: 2.5 }}
                autoComplete="new-password"
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
              <FormError error={errors.confirmPassword} />

              {/* Document SIRENE Upload */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                  Document SIRENE <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Téléversez votre Avis de situation SIRENE (PDF, JPG ou PNG, max 10MB)
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={documentSirenePath ? <CheckCircleIcon /> : <UploadIcon />}
                  disabled={documentUploading}
                  sx={{
                    py: 1.5,
                    borderColor: documentSirenePath ? '#10B981' : undefined,
                    color: documentSirenePath ? '#10B981' : undefined,
                    '&:hover': {
                      borderColor: documentSirenePath ? '#059669' : undefined,
                    }
                  }}
                >
                  {documentUploading ? 'Upload en cours...' :
                   documentSirenePath ? `✓ ${documentFileName}` :
                   'Choisir le document SIRENE'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                    disabled={documentUploading}
                  />
                </Button>

                {!documentSirenePath && (
                  <FormHelperText error>
                    Le document SIRENE est obligatoire pour valider votre inscription
                  </FormHelperText>
                )}

                <Alert severity="info" sx={{ mt: 2, fontSize: '0.875rem' }}>
                  <Typography variant="caption">
                    <strong>Qu'est-ce que l'Avis de situation SIRENE ?</strong><br />
                    C'est un document officiel attestant de l'existence de votre église en tant qu'association.
                    Vous pouvez l'obtenir gratuitement sur le site de l'INSEE.
                  </Typography>
                </Alert>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1E40AF 0%, #6D28D9 100%)',
                  },
                }}
              >
                {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
              </Button>

              {/* Login Link */}
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 3 }}
              >
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#60A5FA',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
