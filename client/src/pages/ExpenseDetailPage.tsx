import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import CategoryChip from '../components/common/CategoryChip';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ExpenseFormDialog from '../components/expenses/ExpenseFormDialog';
import { expensesApi } from '../api/expenses';
import { getErrorMessage } from '../api/client';
import { useCategories, useExpense } from '../hooks/useResources';
import { useNotify } from '../hooks/useNotify';
import { formatCurrency, formatDate, formatDateTime, PAYMENT_METHOD_LABELS } from '../utils/format';

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography component="div">{children}</Typography>
    </Box>
  );
}

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notify = useNotify();
  const { data: expense, loading, error, reload, mutate } = useExpense(id);
  const categories = useCategories();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const backButton = (
    <Button component={RouterLink} to="/expenses" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
      Back to expenses
    </Button>
  );

  if (loading && !expense) return <LoadingState label="Loading expense..." />;
  if (error || !expense) {
    return (
      <>
        {backButton}
        <ErrorState message={error ?? 'Expense not found'} onRetry={error ? reload : undefined} />
      </>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await expensesApi.remove(expense.id);
      notify('Expense deleted');
      navigate('/expenses', { replace: true });
    } catch (err) {
      notify(getErrorMessage(err, 'Could not delete the expense.'), 'error');
      setDeleting(false);
    }
  };

  return (
    <>
      {backButton}
      <Card sx={{ maxWidth: 760 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' }, gap: 2 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" component="h1" sx={{ wordBreak: 'break-word' }}>
                {expense.title}
              </Typography>
              <Typography variant="h4" component="p" color="primary" sx={{ mt: 1 }}>
                {formatCurrency(expense.amount)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Detail label="Category">
                <CategoryChip category={expense.category} size="medium" />
              </Detail>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Detail label="Payment method">{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</Detail>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Detail label="Date">{formatDate(expense.date)}</Detail>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Detail label="Last updated">{formatDateTime(expense.updatedAt)}</Detail>
            </Grid>
            <Grid size={12}>
              <Detail label="Notes">
                {expense.notes ? (
                  <Box component="span" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {expense.notes}
                  </Box>
                ) : (
                  <Typography color="text.secondary" component="span">
                    No notes
                  </Typography>
                )}
              </Detail>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={editOpen}
        expense={expense}
        categories={categories.data ?? []}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          setEditOpen(false);
          notify('Expense updated');
          mutate(updated);
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete expense?"
        message={`"${expense.title}" will be permanently deleted.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
