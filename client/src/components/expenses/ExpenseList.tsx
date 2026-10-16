import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  PAGE_SIZE_OPTIONS,
  selectExpenseFilters,
  setPage,
  setPageSize,
  toggleSort,
} from '../../store/expenseFiltersSlice';
import type { Expense, Pagination, SortField } from '../../types';
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from '../../utils/format';
import CategoryChip from '../common/CategoryChip';

interface ExpenseListProps {
  expenses: Expense[];
  pagination: Pagination;
  loading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

/** Expense table on larger screens, compact cards on phones. Sorting and paging dispatch to Redux. */
export default function ExpenseList({ expenses, pagination, loading, onEdit, onDelete }: ExpenseListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sortBy, order } = useAppSelector(selectExpenseFilters);

  const actions = (expense: Expense) => (
    <Stack direction="row" spacing={0.5} onClick={(event) => event.stopPropagation()}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => onEdit(expense)} aria-label={`Edit ${expense.title}`}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" color="error" onClick={() => onDelete(expense)} aria-label={`Delete ${expense.title}`}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  const sortHeader = (field: SortField, label: string, align?: 'right') => (
    <TableCell align={align} sortDirection={sortBy === field ? order : false}>
      <TableSortLabel
        active={sortBy === field}
        direction={sortBy === field ? order : 'desc'}
        onClick={() => dispatch(toggleSort(field))}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  const pager = (
    <TablePagination
      component="div"
      count={pagination.total}
      page={pagination.page - 1}
      rowsPerPage={pagination.limit}
      rowsPerPageOptions={[...PAGE_SIZE_OPTIONS]}
      onPageChange={(_event, page) => dispatch(setPage(page + 1))}
      onRowsPerPageChange={(event) => dispatch(setPageSize(Number(event.target.value)))}
      labelRowsPerPage={isMobile ? 'Rows' : 'Rows per page'}
    />
  );

  return (
    <Card sx={{ position: 'relative' }}>
      {loading && (
        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} aria-label="Loading expenses" />
      )}

      {isMobile ? (
        <List disablePadding>
          {expenses.map((expense) => (
            <ListItemButton
              key={expense.id}
              divider
              onClick={() => navigate(`/expenses/${expense.id}`)}
              sx={{ alignItems: 'flex-start', gap: 1, py: 1.5 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {expense.title}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, flexShrink: 0 }}>{formatCurrency(expense.amount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
                  <CategoryChip category={expense.category} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(expense.date)} · {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
                  </Typography>
                </Box>
              </Box>
              {actions(expense)}
            </ListItemButton>
          ))}
        </List>
      ) : (
        <TableContainer>
          <Table size="medium" aria-label="Expenses">
            <TableHead>
              <TableRow>
                {sortHeader('title', 'Title')}
                <TableCell>Category</TableCell>
                <TableCell>Payment</TableCell>
                {sortHeader('date', 'Date')}
                {sortHeader('amount', 'Amount', 'right')}
                <TableCell align="right" sx={{ width: 96 }}>
                  <Box component="span" sx={visuallyHidden}>
                    Actions
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow
                  key={expense.id}
                  hover
                  onClick={() => navigate(`/expenses/${expense.id}`)}
                  sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                >
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {expense.title}
                    </Typography>
                    {expense.notes && (
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {expense.notes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <CategoryChip category={expense.category} />
                  </TableCell>
                  <TableCell>{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(expense.date)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell align="right">{actions(expense)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {pager}
    </Card>
  );
}
