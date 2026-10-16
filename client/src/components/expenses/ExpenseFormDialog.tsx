import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { expensesApi } from '../../api/expenses';
import { getErrorMessage, getFieldErrors } from '../../api/client';
import { config } from '../../config';
import { PAYMENT_METHODS, type Category, type Expense, type ExpenseInput, type PaymentMethod } from '../../types';
import { PAYMENT_METHOD_LABELS } from '../../utils/format';
import { today } from '../../utils/month';

interface ExpenseFormDialogProps {
  open: boolean;
  /** When provided the dialog edits this expense; otherwise it creates a new one. */
  expense?: Expense | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (expense: Expense, mode: 'created' | 'updated') => void;
}

interface FormState {
  title: string;
  amount: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm = (): FormState => ({
  title: '',
  amount: '',
  categoryId: '',
  date: today(),
  paymentMethod: 'CARD',
  notes: '',
});

const fromExpense = (expense: Expense): FormState => ({
  title: expense.title,
  amount: String(expense.amount),
  categoryId: expense.categoryId,
  date: expense.date,
  paymentMethod: expense.paymentMethod,
  notes: expense.notes ?? '',
});

const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {};
  const amount = Number(form.amount);
  if (!form.title.trim()) errors.title = 'Title is required';
  if (form.amount.trim() === '' || !Number.isFinite(amount)) errors.amount = 'Enter an amount';
  else if (amount <= 0) errors.amount = 'Amount must be greater than 0';
  if (!form.categoryId) errors.categoryId = 'Select a category';
  if (!form.date) errors.date = 'Select a date';
  else if (form.date > today()) errors.date = 'Date cannot be in the future';
  return errors;
};

export default function ExpenseFormDialog({ open, onClose, ...formProps }: ExpenseFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  // The form only mounts while open, so its state starts fresh every time.
  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <ExpenseForm onClose={onClose} {...formProps} />
    </Dialog>
  );
}

function ExpenseForm({ expense, categories, onClose, onSaved }: Omit<ExpenseFormDialogProps, 'open'>) {
  const isEdit = Boolean(expense);

  const [form, setForm] = useState<FormState>(() => (expense ? fromExpense(expense) : emptyForm()));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: ExpenseInput = {
      title: form.title.trim(),
      amount: Math.round(Number(form.amount) * 100) / 100,
      categoryId: form.categoryId,
      date: form.date,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    setSubmitError(null);
    try {
      const saved = expense ? await expensesApi.update(expense.id, payload) : await expensesApi.create(payload);
      onSaved(saved, expense ? 'updated' : 'created');
    } catch (err) {
      setErrors(getFieldErrors(err) as FormErrors);
      setSubmitError(getErrorMessage(err, 'Could not save the expense.'));
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle>{isEdit ? 'Edit expense' : 'Add expense'}</DialogTitle>
      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="Title"
              value={form.title}
              onChange={update('title')}
              error={Boolean(errors.title)}
              helperText={errors.title}
              required
              autoFocus
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={update('amount')}
              error={Boolean(errors.amount)}
              helperText={errors.amount}
              required
              slotProps={{
                htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' },
                input: { startAdornment: <InputAdornment position="start">{config.currency}</InputAdornment> },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={update('date')}
              error={Boolean(errors.date)}
              helperText={errors.date}
              required
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: today() } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Category"
              value={form.categoryId}
              onChange={update('categoryId')}
              error={Boolean(errors.categoryId)}
              helperText={errors.categoryId ?? (categories.length === 0 ? 'No categories available yet' : undefined)}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Box
                    component="span"
                    sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: category.color, mr: 1.5, flexShrink: 0 }}
                  />
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Payment method"
              value={form.paymentMethod}
              onChange={update('paymentMethod')}
              required
            >
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Notes (optional)"
              value={form.notes}
              onChange={update('notes')}
              multiline
              minRows={3}
              error={Boolean(errors.notes)}
              helperText={errors.notes ?? `${form.notes.length}/1000`}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={saving}>
          {isEdit ? 'Save changes' : 'Add expense'}
        </Button>
      </DialogActions>
    </Box>
  );
}
