import { Box, Stack, Tooltip, Typography } from '@mui/material';
import type { CategorySpending } from '../../types';
import { formatCurrency } from '../../utils/format';

interface CategoryBreakdownProps {
  data: CategorySpending[];
  /** Show the number of expenses next to each category. */
  showCount?: boolean;
}

/**
 * Ranked horizontal bars of spending per category. Built from plain HTML so it reads
 * as both a chart and a table: every row carries its label and exact value, and
 * category color only marks identity (the dot), never the value.
 */
export default function CategoryBreakdown({ data, showCount = false }: CategoryBreakdownProps) {
  const max = Math.max(...data.map((row) => row.total), 0);
  const sum = data.reduce((total, row) => total + row.total, 0);

  return (
    <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {data.map((row) => {
        const share = sum > 0 ? Math.round((row.total / sum) * 1000) / 10 : 0;
        return (
          <Tooltip
            key={row.categoryId}
            title={`${row.name}: ${formatCurrency(row.total)} · ${row.count} expense${row.count === 1 ? '' : 's'} · ${share}%`}
            placement="top"
          >
            <Box component="li">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box
                  aria-hidden
                  sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }}
                />
                <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {row.name}
                  {showCount && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}
                      · {row.count}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(row.total)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ width: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                >
                  {share}%
                </Typography>
              </Box>
              <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    width: max > 0 ? `${(row.total / max) * 100}%` : 0,
                    minWidth: row.total > 0 ? 4 : 0,
                    borderRadius: 4,
                    bgcolor: 'primary.main',
                    transition: 'width 300ms ease',
                  }}
                />
              </Box>
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}
