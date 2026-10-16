import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@mui/material';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';
import EmptyState from '../components/common/EmptyState';

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={<ExploreOffOutlinedIcon fontSize="inherit" />}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={
        <Button component={RouterLink} to="/" variant="contained">
          Go home
        </Button>
      }
    />
  );
}
