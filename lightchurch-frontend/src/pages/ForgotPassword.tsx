import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { Church, Email, ContentCopy, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ADMIN_EMAIL = 'admin@lightchurch.fr';

export default function ForgotPassword() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ADMIN_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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
      }}
    >
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
                Mot de passe oublié ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pas de problème, nous sommes là pour vous aider
              </Typography>
            </Box>

            {/* Information Alert */}
            <Alert
              severity="info"
              sx={{
                mb: 3,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: 'rgba(37, 99, 235, 0.3)',
                '& .MuiAlert-icon': {
                  color: '#60A5FA',
                },
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                Pour réinitialiser votre mot de passe, veuillez contacter l'administrateur de Light Church.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                L'administrateur vous aidera à retrouver l'accès à votre compte.
              </Typography>
            </Alert>

            {/* Admin Email */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ color: '#60A5FA', mr: 1.5, fontSize: 24 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Contacter l'administrateur
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#60A5FA',
                    fontWeight: 500,
                    fontFamily: 'monospace',
                  }}
                >
                  {ADMIN_EMAIL}
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={handleCopyEmail}
                  sx={{
                    minWidth: 'auto',
                    color: copied ? '#10B981' : '#60A5FA',
                  }}
                >
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
              </Box>
            </Box>

            {/* Success Message */}
            {copied && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Email copié dans le presse-papiers !
              </Alert>
            )}

            {/* Instructions */}
            <Box sx={{ mb: 3, p: 2, borderRadius: 1, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Comment procéder ?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                1. Envoyez un email à l'adresse ci-dessus
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                2. Indiquez votre nom, prénom et l'email de votre compte
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. L'administrateur vous répondra dans les plus brefs délais
              </Typography>
            </Box>

            {/* Back to Login */}
            <Button
              component={Link}
              to="/login"
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              sx={{
                py: 1.5,
                borderColor: 'rgba(96, 165, 250, 0.5)',
                color: '#60A5FA',
                '&:hover': {
                  borderColor: '#60A5FA',
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                },
              }}
            >
              Retour à la connexion
            </Button>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
