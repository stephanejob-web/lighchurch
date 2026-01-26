import { Box, CircularProgress, Typography, Skeleton, Stack } from '@mui/material';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Loader({
  message = 'Chargement...',
  size = 'medium',
}: LoaderProps) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <CircularProgress size={sizeMap[size]} />
      <Typography variant="body2" color="text.secondary" sx={{ animation: 'pulse 2s infinite' }}>
        {message}
      </Typography>
    </Box>
  );
}

// Skeleton loader pour tableaux
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack spacing={2}>
      {[...Array(rows)].map((_, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="75%" height={24} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} />
        </Box>
      ))}
    </Stack>
  );
}
