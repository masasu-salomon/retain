import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Box, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { formatCompactCurrency, formatCurrency, formatDate } from '../../utils/format';

interface DailySpendingChartProps {
  month: string;
  data: { date: string; total: number }[];
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: { date: string; total: number } }[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {formatDate(point.date)}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {formatCurrency(point.total)}
      </Typography>
    </Paper>
  );
}

/** Spending per day for one month. Days without expenses are shown as zero. */
export default function DailySpendingChart({ month, data }: DailySpendingChartProps) {
  const series = useMemo(() => {
    const totals = new Map(data.map((point) => [point.date, point.total]));
    const start = dayjs(`${month}-01`);
    return Array.from({ length: start.daysInMonth() }, (_, index) => {
      const date = start.add(index, 'day').format('YYYY-MM-DD');
      return { date, day: index + 1, total: totals.get(date) ?? 0 };
    });
  }, [month, data]);

  return (
    <Box sx={{ width: '100%', height: 240 }} role="img" aria-label="Bar chart of spending per day this month">
      <ResponsiveContainer>
        <BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="var(--mui-palette-divider)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={12}
            tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
            tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--mui-palette-action-hover)' }} />
          <Bar
            dataKey="total"
            fill="var(--mui-palette-primary-main)"
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
            animationDuration={400}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
