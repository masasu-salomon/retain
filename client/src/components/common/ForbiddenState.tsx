import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmptyState from './EmptyState';

export default function ForbiddenState() {
  return (
    <EmptyState
      icon={<LockOutlinedIcon fontSize="inherit" />}
      title="You don't have access to this page"
      description="This area is only available to administrators."
      action={
        <Button component={RouterLink} to="/dashboard" variant="contained">
          Back to dashboard
        </Button>
      }
    />
  );
}
