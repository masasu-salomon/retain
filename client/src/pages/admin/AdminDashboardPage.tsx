import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import CategoryBreakdown from '../../components/charts/CategoryBreakdown';
import RecentExpensesList from '../../components/expenses/RecentExpensesList';
import { useAdminInsights } from '../../hooks/useResources';
import type { CategorySpending } from '../../types';
import { formatCurrency, formatDateTime, formatMonth } from '../../utils/format';

const cardTitle = { title: { variant: 'subtitle1' as const, fontWeight: 600 } };

function RankedCategories({ items }: { items: CategorySpending[] }) {
  if (items.length === 0) return <EmptyState title="No categories yet" />;
  return (
    <List dense disablePadding>
      {items.map((item, index) => (
        <ListItem key={item.categoryId} divider disableGutters>
          <Typography
            sx={{ width: 28, fontWeight: 700, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
            aria-label={`Rank ${index + 1}`}
          >
            {index + 1}
          </Typography>
          <Box
            aria-hidden
            sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, mr: 1.5, flexShrink: 0 }}
          />
          <ListItemText
            primary={item.name}
            secondary={formatCurrency(item.total)}
            slotProps={{ primary: { noWrap: true } }}
            sx={{ minWidth: 0 }}
          />
          <Chip size="small" label={`${item.count} use${item.count === 1 ? '' : 's'}`} variant="outlined" />
        </ListItem>
      ))}
    </List>
  );
}

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useAdminInsights();
  const isInitialLoad = loading && !data;
  const totals = data?.totals;

  return (
    <>
      <PageHeader
        title="Platform insights"
        subtitle={data ? `Activity across all users · ${formatMonth(data.month)}` : 'Activity across all users'}
        actions={
          <>
            <Button
              component={RouterLink}
              to="/admin/categories"
              variant="outlined"
              startIcon={<CategoryOutlinedIcon />}
            >
              Manage categories
            </Button>
            <Button onClick={reload} startIcon={<RefreshIcon />} loading={loading && Boolean(data)}>
              Refresh
            </Button>
          </>
        }
      />

      {error && <ErrorState message={error} onRetry={reload} />}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Registered users"
            value={totals?.users ?? 0}
            helper={`${totals?.newUsersThisMonth ?? 0} joined this month · ${totals?.admins ?? 0} admin${totals?.admins === 1 ? '' : 's'}`}
            icon={<PeopleOutlineIcon />}
            loading={isInitialLoad}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Expenses recorded"
            value={totals?.expenses ?? 0}
            helper={`Across ${totals?.categories ?? 0} categories`}
            icon={<ReceiptLongOutlinedIcon />}
            tone="secondary"
            loading={isInitialLoad}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total value recorded"
            value={formatCurrency(totals?.expenseValue ?? 0)}
            helper="All expenses, all users"
            icon={<PaymentsOutlinedIcon />}
            tone="success"
            loading={isInitialLoad}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Recorded this month"
            value={totals?.expensesThisMonth ?? 0}
            helper={`${formatCurrency(totals?.expenseValueThisMonth ?? 0)} added this month`}
            icon={<EventOutlinedIcon />}
            tone="info"
            loading={isInitialLoad}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Total spending per category" slotProps={cardTitle} />
            <CardContent sx={{ pt: 0 }}>
              {data && <CategoryBreakdown data={data.spendingPerCategory} showCount />}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Top 5 most used" slotProps={cardTitle} />
            <CardContent sx={{ pt: 0 }}>{data && <RankedCategories items={data.topCategories} />}</CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Bottom 5 least used" slotProps={cardTitle} />
            <CardContent sx={{ pt: 0 }}>{data && <RankedCategories items={data.bottomCategories} />}</CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Recently added expenses" slotProps={cardTitle} />
            <CardContent sx={{ pt: 0 }}>
              {data && data.recentExpenses.length > 0 ? (
                <RecentExpensesList expenses={data.recentExpenses} showOwner />
              ) : (
                data && <EmptyState title="No expenses recorded yet" />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Recently registered users" slotProps={cardTitle} />
            <CardContent sx={{ pt: 0 }}>
              <List disablePadding>
                {data?.recentUsers.map((user) => (
                  <ListItem key={user.id} divider disableGutters>
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="span"
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {user.name}
                          </Box>
                          {user.role === 'ADMIN' && <Chip label="Admin" size="small" color="secondary" />}
                        </Box>
                      }
                      secondary={`${user.email} · joined ${formatDateTime(user.createdAt)}`}
                      slotProps={{ secondary: { noWrap: true } }}
                      sx={{ minWidth: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
