import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PageHeader from '../components/common/PageHeader';
import MonthSelector from '../components/common/MonthSelector';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BudgetProgressCard from '../components/budget/BudgetProgressCard';
import BudgetFormDialog from '../components/budget/BudgetFormDialog';
import BudgetStatusChip from '../components/budget/BudgetStatusChip';
import { budgetsApi } from '../api/budgets';
import { getErrorMessage } from '../api/client';
import { useBudgetHistory, useMonthlyBudget } from '../hooks/useResources';
import { useNotify } from '../hooks/useNotify';
import { APPROACHING_PERCENT } from '../utils/budget';
import { formatCurrency, formatMonth } from '../utils/format';
import { currentMonth } from '../utils/month';

export default function BudgetPage() {
  const notify = useNotify();
  const [month, setMonth] = useState(currentMonth);
  const budget = useMonthlyBudget(month);
  const history = useBudgetHistory();
  const [formOpen, setFormOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const refresh = () => {
    budget.reload();
    history.reload();
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await budgetsApi.remove(month);
      notify('Budget removed');
      setRemoveOpen(false);
      refresh();
    } catch (err) {
      notify(getErrorMessage(err, 'Could not remove the budget.'), 'error');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Monthly budget"
        subtitle={`Set a spending limit for each month. You'll be warned once you pass ${APPROACHING_PERCENT}% of it.`}
        actions={<MonthSelector month={month} onChange={setMonth} />}
      />

      {budget.error && <ErrorState message={budget.error} onRetry={budget.reload} />}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <BudgetProgressCard
            month={month}
            summary={budget.data}
            loading={budget.loading && !budget.data}
            onEdit={() => setFormOpen(true)}
          />
          {budget.data?.budget != null && (
            <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setRemoveOpen(true)} sx={{ mt: 1 }}>
              Remove budget for {formatMonth(month)}
            </Button>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                How budget status works
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                  <li>
                    <strong>Within budget</strong> — you've used less than {APPROACHING_PERCENT}% of your budget.
                  </li>
                  <li>
                    <strong>Approaching limit</strong> — you've used {APPROACHING_PERCENT}–100%.
                  </li>
                  <li>
                    <strong>Over budget</strong> — your spending is higher than the budget.
                  </li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardHeader title="Budget history" slotProps={{ title: { variant: 'subtitle1', fontWeight: 600 } }} />
            {history.error && <ErrorState message={history.error} onRetry={history.reload} />}
            {history.data && history.data.length === 0 ? (
              <EmptyState title="No budgets yet" description="Budgets you set will be listed here month by month." />
            ) : (
              <TableContainer>
                <Table size="small" aria-label="Budget history">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Budget</TableCell>
                      <TableCell align="right">Spent</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: '25%' }}>Used</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(history.data ?? []).map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        selected={row.month === month}
                        onClick={() => setMonth(row.month)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatMonth(row.month)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.totalSpent)}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(row.percentUsed ?? 0, 100)}
                            color={
                              row.status === 'over' ? 'error' : row.status === 'approaching' ? 'warning' : 'success'
                            }
                            sx={{ height: 6, borderRadius: 3 }}
                            aria-label={`${row.percentUsed ?? 0}% used`}
                          />
                        </TableCell>
                        <TableCell>
                          <BudgetStatusChip status={row.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      <BudgetFormDialog
        open={formOpen}
        month={month}
        currentAmount={budget.data?.budget ?? null}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          notify('Budget saved');
          refresh();
        }}
      />
      <ConfirmDialog
        open={removeOpen}
        title="Remove budget?"
        message={`Your budget for ${formatMonth(month)} will be removed. Your expenses are not affected.`}
        confirmLabel="Remove"
        loading={removing}
        onConfirm={handleRemove}
        onClose={() => setRemoveOpen(false)}
      />
    </>
  );
}
