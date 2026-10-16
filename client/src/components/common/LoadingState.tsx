import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingState({ label = 'Loading...', fullScreen = false }: LoadingStateProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 8,
        minHeight: fullScreen ? '100vh' : undefined,
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
