import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordField from '../components/common/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { useNotify } from '../hooks/useNotify';
import { getErrorMessage, getFieldErrors } from '../api/client';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validate = (form: RegisterForm): Partial<Record<keyof RegisterForm, string>> => {
  const errors: Partial<Record<keyof RegisterForm, string>> = {};
  if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
    errors.password = 'Password must contain a letter and a number';
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clientErrors = touched ? validate(form) : {};
  const errors: Record<string, string | undefined> = { ...serverErrors, ...clientErrors };

  const update = (field: keyof RegisterForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    setServerErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    setError(null);
    if (Object.keys(validate(form)).length > 0) return;

    setSubmitting(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      notify('Welcome to Retain! Start by setting a monthly budget.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerErrors(getFieldErrors(err));
      setError(getErrorMessage(err, 'Could not create your account.'));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start recording expenses and stay on budget.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Full name"
            autoComplete="name"
            value={form.name}
            onChange={update('name')}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            autoFocus
            size="medium"
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={Boolean(errors.email)}
            helperText={errors.email}
            required
            size="medium"
          />
          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            error={Boolean(errors.password)}
            helperText={errors.password ?? 'At least 8 characters, with a letter and a number'}
            required
            size="medium"
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            required
            size="medium"
          />
          <Button type="submit" variant="contained" size="large" loading={submitting}>
            Create account
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
