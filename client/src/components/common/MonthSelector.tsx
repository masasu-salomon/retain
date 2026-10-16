import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { formatMonth } from '../../utils/format';
import { currentMonth, shiftMonth } from '../../utils/month';

interface MonthSelectorProps {
  month: string;
  onChange: (month: string) => void;
}

/** Previous / next month switcher. Future months are not selectable. */
export default function MonthSelector({ month, onChange }: MonthSelectorProps) {
  const isCurrent = month >= currentMonth();

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Tooltip title="Previous month">
        <IconButton onClick={() => onChange(shiftMonth(month, -1))} aria-label="Previous month" size="small">
          <ChevronLeftIcon />
        </IconButton>
      </Tooltip>
      <Typography sx={{ minWidth: 130, textAlign: 'center', fontWeight: 600 }} aria-live="polite">
        {formatMonth(month)}
      </Typography>
      <Tooltip title="Next month">
        <span>
          <IconButton
            onClick={() => onChange(shiftMonth(month, 1))}
            aria-label="Next month"
            size="small"
            disabled={isCurrent}
          >
            <ChevronRightIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
