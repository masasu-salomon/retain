import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';
import { NotificationContext } from './notificationContext';

interface Notification {
  id: number;
  message: string;
  severity: AlertColor;
}

/** App-wide toast messages (e.g. "Expense saved"). */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback((message: string, severity: AlertColor = 'success') => {
    setCurrent({ id: Date.now(), message, severity });
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.id}
        open={open}
        autoHideDuration={4000}
        onClose={(_event, reason) => reason !== 'clickaway' && setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={current?.severity ?? 'info'}
          variant="filled"
          onClose={() => setOpen(false)}
          sx={{ width: '100%' }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
