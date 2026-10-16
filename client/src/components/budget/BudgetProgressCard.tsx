import { Box, Button, Card, CardContent, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import type { BudgetSummary } from '../../types';
import { BUDGET_STATUS_META, formatCurrency, formatMonth } from '../../utils/format';
import BudgetStatusChip from './BudgetStatusChip';

interface BudgetProgressCardProps {
  month: string;
  summary: BudgetSummary | null;
  loading?: boolean;
  onEdit?: () => void;
}

/** Spent vs. budget for a month: progress meter, remaining amount and status. */
export default function BudgetProgressCard({ month, summary, loading = false, onEdit }: BudgetProgressCardProps) {
  if (loading || !summary) {
    return (
      <Card>
        <CardContent>
          <Skeleton width="40%" />
          <Skeleton height={48} />
          <Skeleton height={16} />
        </CardContent>
      </Card>
    );
  }

  const hasBudget = summary.budget !== null;
  const percent = summary.percentUsed ?? 0;
  const meta = BUDGET_STATUS_META[summary.status];
  const progressColor = meta.color === 'default' ? 'primary' : meta.color;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Budget for {formatMonth(month)}
            </Typography>
            <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
              {hasBudget ? formatCurrency(summary.budget as number) : 'Not set'}
            </Typography>
          </Box>
          <BudgetStatusChip status={summary.status} />
        </Stack>

        {hasBudget ? (
          <>
            <LinearProgress
              variant="determinate"
              value={Math.min(percent, 100)}
              color={progressColor}
              sx={{ height: 10, borderRadius: 5 }}
              aria-label={`${percent}% of budget used`}
            />
            <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1, gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                Spent <strong>{formatCurrency(summary.totalSpent)}</strong> ({percent}%)
              </Typography>
              <Typography variant="body2" color={summary.status === 'over' ? 'error.main' : 'text.secondary'}>
                {summary.status === 'over' ? 'Over by ' : 'Remaining '}
                <strong>{formatCurrency(Math.abs(summary.remaining ?? 0))}</strong>
              </Typography>
            </Stack>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            You have spent <strong>{formatCurrency(summary.totalSpent)}</strong> this month. Set a budget to track how
            much you have left.
          </Typography>
        )}

        {onEdit && (
          <Button
            onClick={onEdit}
            startIcon={hasBudget ? <EditOutlinedIcon /> : <AddIcon />}
            variant={hasBudget ? 'text' : 'contained'}
            size="small"
            sx={{ mt: 2 }}
          >
            {hasBudget ? 'Update budget' : 'Set budget'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
