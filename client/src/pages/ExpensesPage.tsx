import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import PageHeader from '../components/common/PageHeader';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseFormDialog from '../components/expenses/ExpenseFormDialog';
import { expensesApi } from '../api/expenses';
import { getErrorMessage } from '../api/client';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useResources';
import { useNotify } from '../hooks/useNotify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearFilters, selectHasAnyFilter, setPage } from '../store/expenseFiltersSlice';
import type { Expense } from '../types';
import { formatCurrency } from '../utils/format';

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const notify = useNotify();
  const hasAnyFilter = useAppSelector(selectHasAnyFilter);
  const { data, loading, error, reload } = useExpenses();
  const categories = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // If the current page becomes empty (e.g. after deleting its last item), step back a page.
  useEffect(() => {
    if (data && data.data.length === 0 && data.pagination.page > 1) {
      dispatch(setPage(data.pagination.totalPages));
    }
  }, [data, dispatch]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await expensesApi.remove(deleting.id);
      notify(`Deleted "${deleting.title}"`);
      setDeleting(null);
      reload();
    } catch (err) {
      notify(getErrorMessage(err, 'Could not delete the expense.'), 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  const renderBody = () => {
    if (!data) {
      return loading ? <LoadingState label="Loading expenses..." /> : null;
    }
    if (data.pagination.total === 0) {
      return hasAnyFilter ? (
        <EmptyState
          icon={<SearchOffIcon fontSize="inherit" />}
          title="No expenses match your filters"
          description="Try a different search term or clear some filters."
          action={<Button onClick={() => dispatch(clearFilters())}>Clear filters</Button>}
        />
      ) : (
        <EmptyState
          title="No expenses yet"
          description="Add your first expense to start tracking where your money goes."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Add expense
            </Button>
          }
        />
      );
    }
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 0.5, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {data.pagination.total} expense{data.pagination.total === 1 ? '' : 's'}
            {hasAnyFilter ? ' match your filters' : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: <strong>{formatCurrency(data.summary.totalAmount)}</strong>
          </Typography>
        </Box>
        <ExpenseList
          expenses={data.data}
          pagination={data.pagination}
          loading={loading}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="Search, filter and manage everything you've spent."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add expense
          </Button>
        }
      />

      <ExpenseFilters categories={categories.data ?? []} />
      {error && <ErrorState message={error} onRetry={reload} />}
      {renderBody()}

      <ExpenseFormDialog
        open={formOpen}
        expense={editing}
        categories={categories.data ?? []}
        onClose={() => setFormOpen(false)}
        onSaved={(_expense, mode) => {
          setFormOpen(false);
          notify(mode === 'created' ? 'Expense added' : 'Expense updated');
          reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete expense?"
        message={
          deleting ? `"${deleting.title}" (${formatCurrency(deleting.amount)}) will be permanently deleted.` : ''
        }
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
