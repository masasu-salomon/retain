import { Box, Typography } from '@mui/material';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box component="img" src="/favicon.svg" alt="" sx={{ width: 32, height: 32, display: 'block' }} />
      {!compact && (
        <Typography variant="h6" component="span" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          Retain
        </Typography>
      )}
    </Box>
  );
}
