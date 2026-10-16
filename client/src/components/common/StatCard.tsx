import type { ReactNode } from 'react';
import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  /** Theme palette key used for the icon badge. */
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
}

export default function StatCard({ label, value, helper, icon, tone = 'primary', loading = false }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
            {loading ? <Skeleton width="70%" /> : value}
          </Typography>
          {helper && (
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
              {loading ? <Skeleton width="50%" /> : helper}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            aria-hidden
            sx={(theme) => ({
              display: 'grid',
              placeItems: 'center',
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 2,
              color: theme.vars ? theme.vars.palette[tone].main : theme.palette[tone].main,
              bgcolor: theme.vars ? `rgba(${theme.vars.palette[tone].mainChannel} / 0.12)` : theme.palette.action.hover,
            })}
          >
            {icon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
