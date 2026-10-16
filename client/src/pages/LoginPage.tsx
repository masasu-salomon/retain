import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate, type Location } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordField from '../components/common/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage, getFieldErrors } from '../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      navigate(from ?? (user.role === 'ADMIN' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err, 'Could not sign you in.'));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to track your spending and budgets.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            required
            autoFocus
            size="medium"
          />
          <PasswordField
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
            required
            size="medium"
          />
          <Button type="submit" variant="contained" size="large" loading={submitting} disabled={!email || !password}>
            Sign in
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            New to Retain?{' '}
            <Link component={RouterLink} to="/register" state={location.state}>
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
