import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryFormDialog from '../../components/admin/CategoryFormDialog';
import { categoriesApi } from '../../api/categories';
import { getErrorMessage } from '../../api/client';
import { useCategories } from '../../hooks/useResources';
import { useNotify } from '../../hooks/useNotify';
import type { Category } from '../../types';
import { formatDate } from '../../utils/format';

export default function AdminCategoriesPage() {
  const notify = useNotify();
  const { data: categories, loading, error, reload } = useCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openForm = (category: Category | null) => {
    setEditing(category);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await categoriesApi.remove(deleting.id);
      notify(`Deleted "${deleting.name}"`);
      setDeleting(null);
      reload();
    } catch (err) {
      notify(getErrorMessage(err, 'Could not delete the category.'), 'error');
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Expense categories"
        subtitle="Categories are shared by every user. Categories that are in use can be renamed but not deleted."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
            New category
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !categories && <LoadingState label="Loading categories..." />}

      {categories && (
        <Card>
          {categories.length === 0 ? (
            <EmptyState
              title="No categories yet"
              description="Users need at least one category to record expenses."
              action={
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
                  Create the first category
                </Button>
              }
            />
          ) : (
            <TableContainer>
              <Table aria-label="Expense categories">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Expenses</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => {
                    const inUse = (category.expenseCount ?? 0) > 0;
                    return (
                      <TableRow key={category.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              aria-hidden
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                bgcolor: category.color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {category.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{category.expenseCount ?? 0}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          {formatDate(category.createdAt)}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openForm(category)}
                                aria-label={`Edit ${category.name}`}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={inUse ? 'In use by expenses — cannot be deleted' : 'Delete'}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={inUse}
                                  onClick={() => setDeleting(category)}
                                  aria-label={`Delete ${category.name}`}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(category, mode) => {
          setFormOpen(false);
          notify(mode === 'created' ? `Created "${category.name}"` : `Updated "${category.name}"`);
          reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category?"
        message={deleting ? `"${deleting.name}" will be permanently deleted.` : ''}
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
