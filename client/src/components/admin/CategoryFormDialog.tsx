import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { categoriesApi } from '../../api/categories';
import { getErrorMessage, getFieldErrors } from '../../api/client';
import type { Category } from '../../types';

const SWATCHES = [
  '#f97316',
  '#0ea5e9',
  '#6366f1',
  '#14b8a6',
  '#ec4899',
  '#22c55e',
  '#a855f7',
  '#eab308',
  '#06b6d4',
  '#64748b',
];

interface CategoryFormDialogProps {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
  onSaved: (category: Category, mode: 'created' | 'updated') => void;
}

export default function CategoryFormDialog({ open, onClose, ...formProps }: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <CategoryForm onClose={onClose} {...formProps} />
    </Dialog>
  );
}

function CategoryForm({ category, onClose, onSaved }: Omit<CategoryFormDialogProps, 'open'>) {
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? SWATCHES[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setErrors({ name: 'Name must be at least 2 characters' });
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      const input = { name: name.trim(), color };
      const saved = category ? await categoriesApi.update(category.id, input) : await categoriesApi.create(input);
      onSaved(saved, category ? 'updated' : 'created');
    } catch (err) {
      setErrors(getFieldErrors(err));
      setSubmitError(getErrorMessage(err, 'Could not save the category.'));
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <TextField
            label="Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors({});
            }}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            autoFocus
            slotProps={{ htmlInput: { maxLength: 40 } }}
          />
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Color
            </Typography>
            <Box
              role="radiogroup"
              aria-label="Category color"
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
            >
              {SWATCHES.map((swatch) => (
                <Box
                  key={swatch}
                  component="button"
                  type="button"
                  role="radio"
                  aria-checked={color === swatch}
                  aria-label={swatch}
                  onClick={() => setColor(swatch)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: swatch,
                    cursor: 'pointer',
                    border: 2,
                    borderColor: 'background.paper',
                    outline: color === swatch ? 2 : 0,
                    outlineColor: 'text.primary',
                    outlineStyle: 'solid',
                  }}
                />
              ))}
              <Box
                component="input"
                type="color"
                value={color}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setColor(event.target.value)}
                aria-label="Custom color"
                sx={{ width: 36, height: 30, p: 0, border: 0, bgcolor: 'transparent', cursor: 'pointer' }}
              />
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={saving}>
          {category ? 'Save changes' : 'Create category'}
        </Button>
      </DialogActions>
    </Box>
  );
}
