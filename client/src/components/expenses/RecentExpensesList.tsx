import { Link as RouterLink } from 'react-router-dom';
import { Avatar, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import type { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

interface RecentExpensesListProps {
  expenses: Expense[];
  /** Admin view shows who recorded each expense and doesn't link to the owner's detail page. */
  showOwner?: boolean;
}

export default function RecentExpensesList({ expenses, showOwner = false }: RecentExpensesListProps) {
  return (
    <List disablePadding>
      {expenses.map((expense) => {
        const linkProps = showOwner ? {} : { component: RouterLink, to: `/expenses/${expense.id}` };
        return (
          <ListItemButton key={expense.id} divider disableGutters sx={{ px: 1, borderRadius: 1 }} {...linkProps}>
            <ListItemAvatar sx={{ minWidth: 48 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 600,
                  bgcolor: expense.category?.color ?? 'grey.500',
                  color: '#fff',
                }}
              >
                {expense.category?.name.charAt(0) ?? '?'}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={expense.title}
              secondary={
                showOwner
                  ? `${expense.user?.name ?? 'Unknown user'} · ${expense.category?.name ?? ''} · ${formatDate(expense.date)}`
                  : `${expense.category?.name ?? ''} · ${formatDate(expense.date)}`
              }
              slotProps={{ primary: { noWrap: true, sx: { fontWeight: 500 } }, secondary: { noWrap: true } }}
              sx={{ minWidth: 0, mr: 1 }}
            />
            <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(expense.amount)}</Typography>
          </ListItemButton>
        );
      })}
    </List>
  );
}
