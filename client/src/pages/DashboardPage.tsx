import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, Grid, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import MonthSelector from '../components/common/MonthSelector';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import BudgetProgressCard from '../components/budget/BudgetProgressCard';
import BudgetFormDialog from '../components/budget/BudgetFormDialog';
import CategoryBreakdown from '../components/charts/CategoryBreakdown';
import DailySpendingChart from '../components/charts/DailySpendingChart';
import RecentExpensesList from '../components/expenses/RecentExpensesList';
import ExpenseFormDialog from '../components/expenses/ExpenseFormDialog';
import { useAuth } from '../hooks/useAuth';
import { useNotify } from '../hooks/useNotify';
import { useCategories, useDashboard } from '../hooks/useResources';
import { formatCurrency, formatDate, formatMonth } from '../utils/format';
import { currentMonth } from '../utils/month';

export default function DashboardPage() {
  const { user } = useAuth();
  const notify = useNotify();
  const [month, setMonth] = useState(currentMonth);
  const { data, loading, error, reload } = useDashboard(month);
  const categories = useCategories();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const isInitialLoad = loading && !data;
  const budget = data?.budget;
  const firstName = user?.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`Hi ${firstName ?? 'there'}`}
        subtitle={`Here's how your spending looks for ${formatMonth(month)}.`}
        actions={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
            <MonthSelector month={month} onChange={setMonth} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setExpenseOpen(true)}>
              Add expense
            </Button>
          </Stack>
        }
      />

      {error && <ErrorState message={error} onRetry={reload} />}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total spent"
            value={formatCurrency(data?.totalSpent ?? 0)}
            helper={`${data?.expenseCount ?? 0} expenses · avg ${formatCurrency(data?.averageExpense ?? 0)}`}
            icon={<PaymentsOutlinedIcon />}
            loading={isInitialLoad}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Remaining budget"
            value={budget?.remaining != null ? formatCurrency(budget.remaining) : 'No budget'}
            helper={budget?.budget != null ? `of ${formatCurrency(budget.budget)}` : 'Set a budget to track this'}
            icon={<AccountBalanceWalletOutlinedIcon />}
            tone={budget?.status === 'over' ? 'error' : budget?.status === 'approaching' ? 'warning' : 'success'}
            loading={isInitialLoad}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Highest expense"
            value={data?.highestExpense ? formatCurrency(data.highestExpense.amount) : '—'}
            helper={
              data?.highestExpense
                ? `${data.highestExpense.title} · ${formatDate(data.highestExpense.date)}`
                : 'No expenses this month'
            }
            icon={<TrendingUpIcon />}
            tone="secondary"
            loading={isInitialLoad}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Top category"
            value={data?.spendingByCategory[0]?.name ?? '—'}
            helper={
              data?.spendingByCategory[0]
                ? `${formatCurrency(data.spendingByCategory[0].total)} · ${data.spendingByCategory[0].percentage}% of spending`
                : 'No expenses this month'
            }
            icon={<ReceiptOutlinedIcon />}
            tone="info"
            loading={isInitialLoad}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <BudgetProgressCard
            month={month}
            summary={budget ?? null}
            loading={isInitialLoad}
            onEdit={() => setBudgetOpen(true)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Daily spending" slotProps={{ title: { variant: 'subtitle1', fontWeight: 600 } }} />
            <CardContent sx={{ pt: 0 }}>
              <DailySpendingChart month={month} data={data?.dailySpending ?? []} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Spending by category" slotProps={{ title: { variant: 'subtitle1', fontWeight: 600 } }} />
            <CardContent sx={{ pt: 0 }}>
              {data && data.spendingByCategory.length > 0 ? (
                <CategoryBreakdown data={data.spendingByCategory} showCount />
              ) : (
                <EmptyState title="Nothing spent yet" description="Category totals appear once you add expenses." />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Recent expenses"
              slotProps={{ title: { variant: 'subtitle1', fontWeight: 600 } }}
              action={
                <Button component={RouterLink} to="/expenses" size="small">
                  View all
                </Button>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {data && data.recentExpenses.length > 0 ? (
                <RecentExpensesList expenses={data.recentExpenses} />
              ) : (
                <EmptyState
                  title="No expenses yet"
                  description="Record your first expense to see it here."
                  action={
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setExpenseOpen(true)}>
                      Add expense
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <BudgetFormDialog
        open={budgetOpen}
        month={month}
        currentAmount={budget?.budget ?? null}
        onClose={() => setBudgetOpen(false)}
        onSaved={() => {
          setBudgetOpen(false);
          notify('Budget saved');
          reload();
        }}
      />
      <ExpenseFormDialog
        open={expenseOpen}
        categories={categories.data ?? []}
        onClose={() => setExpenseOpen(false)}
        onSaved={() => {
          setExpenseOpen(false);
          notify('Expense added');
          reload();
        }}
      />
    </>
  );
}
