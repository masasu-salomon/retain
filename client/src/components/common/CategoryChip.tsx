import { Chip, type ChipProps } from '@mui/material';
import type { CategorySummary } from '../../types';

interface CategoryChipProps {
  category?: CategorySummary;
  size?: ChipProps['size'];
}

export default function CategoryChip({ category, size = 'small' }: CategoryChipProps) {
  if (!category) return null;
  return (
    <Chip
      size={size}
      label={category.name}
      variant="outlined"
      sx={{ borderColor: category.color, color: 'text.primary', '& .MuiChip-label': { px: 1 } }}
      icon={
        <span
          aria-hidden
          style={{ width: 8, height: 8, borderRadius: '50%', background: category.color, marginLeft: 8 }}
        />
      }
    />
  );
}
