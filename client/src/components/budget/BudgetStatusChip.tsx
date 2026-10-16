import type { ReactElement } from 'react';
import { Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import type { BudgetStatus } from '../../types';
import { BUDGET_STATUS_META } from '../../utils/format';

const ICONS: Record<BudgetStatus, ReactElement> = {
  within: <CheckCircleOutlineIcon />,
  approaching: <WarningAmberIcon />,
  over: <ErrorOutlineIcon />,
  none: <HelpOutlineIcon />,
};

/** Status is always shown with an icon and a label, never by color alone. */
export default function BudgetStatusChip({
  status,
  size = 'small',
}: {
  status: BudgetStatus;
  size?: 'small' | 'medium';
}) {
  const meta = BUDGET_STATUS_META[status];
  return <Chip icon={ICONS[status]} label={meta.label} color={meta.color} size={size} variant="outlined" />;
}
