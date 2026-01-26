import { Box, LinearProgress, Typography } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: 'Au moins 8 caractères',
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: 'Au moins une majuscule',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: 'Au moins une minuscule',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: 'Au moins un chiffre',
    test: (pwd) => /[0-9]/.test(pwd),
  },
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const validRequirements = requirements.filter((req) => req.test(password)).length;
  const strength = (validRequirements / requirements.length) * 100;

  const getStrengthColor = (): 'error' | 'warning' | 'success' => {
    if (strength === 100) return 'success';
    if (strength >= 50) return 'warning';
    return 'error';
  };

  const getStrengthLabel = () => {
    if (strength === 100) return 'Fort';
    if (strength >= 50) return 'Moyen';
    return 'Faible';
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Barre de progression */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Force du mot de passe
          </Typography>
          <Typography variant="caption" fontWeight={500} color={`${getStrengthColor()}.main`}>
            {getStrengthLabel()}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={strength}
          color={getStrengthColor()}
          sx={{ height: 6, borderRadius: 1 }}
        />
      </Box>

      {/* Liste des critères */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {requirements.map((req) => {
          const isValid = req.test(password);
          return (
            <Box key={req.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isValid ? (
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: isValid ? 'success.main' : 'text.secondary',
                }}
              >
                {req.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// Fonction utilitaire pour vérifier si le mot de passe est valide
export function isPasswordValid(password: string): boolean {
  return requirements.every((req) => req.test(password));
}
