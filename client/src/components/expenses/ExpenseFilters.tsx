import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import ClearIcon from '@mui/icons-material/Clear';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  clearFilters,
  selectActiveFilterCount,
  selectExpenseFilters,
  selectHasAnyFilter,
  setAmountRange,
  setCategoryFilter,
  setDateRange,
  setPaymentMethodFilter,
  setSearch,
  setSort,
} from '../../store/expenseFiltersSlice';
import { PAYMENT_METHODS, type Category, type PaymentMethod, type SortField, type SortOrder } from '../../types';
import { PAYMENT_METHOD_LABELS } from '../../utils/format';
import { currentMonth, monthBounds, shiftMonth } from '../../utils/month';
import dayjs from 'dayjs';

const SORT_OPTIONS: { value: `${SortField}:${SortOrder}`; label: string }[] = [
  { value: 'date:desc', label: 'Newest first' },
  { value: 'date:asc', label: 'Oldest first' },
  { value: 'amount:desc', label: 'Amount: high to low' },
  { value: 'amount:asc', label: 'Amount: low to high' },
  { value: 'title:asc', label: 'Title: A to Z' },
];

interface ExpenseFiltersProps {
  categories: Category[];
}

/** Search, filter and sort controls. All state lives in the Redux `expenseFilters` slice. */
export default function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectExpenseFilters);
  const activeCount = useAppSelector(selectActiveFilterCount);
  const hasAnyFilter = useAppSelector(selectHasAnyFilter);
  const [expanded, setExpanded] = useState(activeCount > 0);

  const applyPreset = (preset: 'this-month' | 'last-month' | 'last-30') => {
    if (preset === 'last-30') {
      dispatch(
        setDateRange({
          startDate: dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
          endDate: dayjs().format('YYYY-MM-DD'),
        }),
      );
      return;
    }
    const month = preset === 'this-month' ? currentMonth() : shiftMonth(currentMonth(), -1);
    dispatch(setDateRange(monthBounds(month)));
  };

  const sortValue = `${filters.sortBy}:${filters.order}`;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            placeholder="Search by title, notes or category"
            value={filters.search}
            onChange={(event) => dispatch(setSearch(event.target.value))}
            slotProps={{
              htmlInput: { 'aria-label': 'Search expenses' },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <ClearIcon
                      fontSize="small"
                      role="button"
                      aria-label="Clear search"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => dispatch(setSearch(''))}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            label="Sort by"
            value={sortValue}
            onChange={(event) => {
              const [sortBy, order] = event.target.value.split(':') as [SortField, SortOrder];
              dispatch(setSort({ sortBy, order }));
            }}
            sx={{ minWidth: { sm: 200 }, width: { sm: 'auto' } }}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant={expanded ? 'contained' : 'outlined'}
            onClick={() => setExpanded((value) => !value)}
            startIcon={
              <Badge badgeContent={activeCount} color="secondary">
                <TuneIcon />
              </Badge>
            }
            aria-expanded={expanded}
            sx={{ flexShrink: 0 }}
          >
            Filters
          </Button>
        </Stack>

        <Collapse in={expanded} unmountOnExit>
          <Grid container spacing={1.5} sx={{ mt: 0.5, pt: 1.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Category"
                value={filters.categoryId}
                onChange={(event) => dispatch(setCategoryFilter(event.target.value))}
              >
                <MenuItem value="">All categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Payment method"
                value={filters.paymentMethod}
                onChange={(event) => dispatch(setPaymentMethodFilter(event.target.value as PaymentMethod | ''))}
              >
                <MenuItem value="">All methods</MenuItem>
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                label="From"
                type="date"
                value={filters.startDate}
                onChange={(event) => dispatch(setDateRange({ startDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filters.endDate || undefined } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                label="To"
                type="date"
                value={filters.endDate}
                onChange={(event) => dispatch(setDateRange({ endDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filters.startDate || undefined } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                label="Min amount"
                type="number"
                value={filters.minAmount}
                onChange={(event) => dispatch(setAmountRange({ minAmount: event.target.value }))}
                slotProps={{ htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                label="Max amount"
                type="number"
                value={filters.maxAmount}
                onChange={(event) => dispatch(setAmountRange({ maxAmount: event.target.value }))}
                slotProps={{ htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', height: '100%' }}>
                <Chip label="This month" onClick={() => applyPreset('this-month')} variant="outlined" />
                <Chip label="Last month" onClick={() => applyPreset('last-month')} variant="outlined" />
                <Chip label="Last 30 days" onClick={() => applyPreset('last-30')} variant="outlined" />
              </Box>
            </Grid>
          </Grid>
        </Collapse>

        {hasAnyFilter && (
          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" startIcon={<ClearIcon />} onClick={() => dispatch(clearFilters())}>
              Clear all filters
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
