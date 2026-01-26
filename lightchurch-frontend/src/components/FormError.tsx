import { Box, Typography, Alert, AlertTitle } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import type { FieldError } from 'react-hook-form';

interface FormErrorProps {
  error?: FieldError | { message?: string };
}

export default function FormError({ error }: FormErrorProps) {
  if (!error || !error.message) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
      <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />
      <Typography variant="caption" color="error.main">
        {error.message}
      </Typography>
    </Box>
  );
}

// Composant pour afficher plusieurs erreurs (erreurs backend structurées)
interface BackendErrorsProps {
  errors?: Array<{ field: string; message: string }>;
}

export function BackendErrors({ errors }: BackendErrorsProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>Erreurs de validation</AlertTitle>
      <Box component="ul" sx={{ pl: 2, m: 0 }}>
        {errors.map((error) => (
          <li key={`${error.field}-${error.message}`}>
            <Typography variant="body2">
              <strong>{error.field}</strong> : {error.message}
            </Typography>
          </li>
        ))}
      </Box>
    </Alert>
  );
}
