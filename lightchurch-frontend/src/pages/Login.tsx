import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Church, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
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
        position: 'relative' // Ensure relative positioning for absolute child
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
                Light Church
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connectez-vous à votre espace
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pasteur@eglise.com"
                required
                sx={{ mb: 2.5 }}
                autoComplete="email"
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoComplete="current-password"
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

              <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#60A5FA',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Mot de passe oublié ?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1E40AF 0%, #6D28D9 100%)',
                  },
                }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>

              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 3 }}
              >
                Pas encore de compte ?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#60A5FA',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  S'inscrire
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
