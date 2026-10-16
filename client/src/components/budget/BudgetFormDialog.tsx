import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  TextField,
} from '@mui/material';
import { budgetsApi } from '../../api/budgets';
import { getErrorMessage } from '../../api/client';
import { config } from '../../config';
import type { MonthlyBudget } from '../../types';
import { formatMonth } from '../../utils/format';

interface BudgetFormDialogProps {
  open: boolean;
  month: string;
  currentAmount: number | null;
  onClose: () => void;
  onSaved: (budget: MonthlyBudget) => void;
}

export default function BudgetFormDialog({ open, onClose, ...formProps }: BudgetFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <BudgetForm onClose={onClose} {...formProps} />
    </Dialog>
  );
}

function BudgetForm({ month, currentAmount, onClose, onSaved }: Omit<BudgetFormDialogProps, 'open'>) {
  const [amount, setAmount] = useState(currentAmount ? String(currentAmount) : '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(amount);
    if (amount.trim() === '' || !Number.isFinite(value) || value <= 0) {
      setError('Enter a budget greater than 0');
      return;
    }
    setSaving(true);
    try {
      onSaved(await budgetsApi.save(month, Math.round(value * 100) / 100));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save the budget.'));
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle>{currentAmount ? 'Update budget' : 'Set budget'}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>How much do you plan to spend in {formatMonth(month)}?</DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Monthly budget"
          type="number"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setError(null);
          }}
          autoFocus
          required
          slotProps={{
            htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' },
            input: { startAdornment: <InputAdornment position="start">{config.currency}</InputAdornment> },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={saving}>
          Save budget
        </Button>
      </DialogActions>
    </Box>
  );
}
