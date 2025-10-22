import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Toolbar,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import { useAdminTemplatesQuery, useCreateTemplateMutation, useDeleteTemplateMutation, usePublishTemplateMutation, useUnpublishTemplateMutation, useUpdateTemplateMutation } from '../../api/admin/templates';
import type { AdminTemplatesParams, CreateTemplateInput, TemplateAdmin, UpdateTemplateInput } from '../../types/admin';
import ConfirmDialog from '../../components/ConfirmDialog';
import TemplateFormDrawer from './TemplateFormDrawer';
import { formatRelative, formatCompactNumber } from '../../utils/format';

const statusOptions = ['all', 'draft', 'published', 'archived'] as const;
const visibilityOptions = ['all', 'public', 'private'] as const;
const sortOptions = ['updated', 'newest', 'popular', 'name'] as const;

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const AdminTemplates: React.FC = () => {
  // Filters/params
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('all');
  const [visibility, setVisibility] = useState<(typeof visibilityOptions)[number]>('all');
  const [sort, setSort] = useState<(typeof sortOptions)[number]>('updated');
  const [tagsCSV, setTagsCSV] = useState('');

  const debouncedQ = useDebounced(q, 300);
  const params = useMemo<AdminTemplatesParams>(() => {
    return {
      q: debouncedQ || undefined,
      status: status !== 'all' ? (status as any) : undefined,
      visibility: visibility !== 'all' ? (visibility as any) : undefined,
      sort,
      tags: tagsCSV || undefined,
      limit: 50,
      offset: 0,
    };
  }, [debouncedQ, status, visibility, sort, tagsCSV]);

  const { data: templates = [], isFetching, refetch } = useAdminTemplatesQuery(params);

  // Selection
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = selected.length > 0 && selected.length === templates.length;
  const isSelected = (slug: string) => selected.includes(slug);
  const toggleRow = (slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };
  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(templates.map((t) => t.slug));
  };

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<TemplateAdmin | undefined>(undefined);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'publish' | 'unpublish'>('delete');

  // Notifications
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const openSnack = (message: string, severity: 'success' | 'error' = 'success') => setSnack({ open: true, message, severity });

  // Mutations
  const createMut = useCreateTemplateMutation();
  const updateMut = useUpdateTemplateMutation(editing?.slug || '');
  const deleteMut = useDeleteTemplateMutation();
  const publishMut = usePublishTemplateMutation();
  const unpublishMut = useUnpublishTemplateMutation();

  // Handlers
  const handleCreate = () => {
    setEditing(undefined);
    setDrawerMode('create');
    setDrawerOpen(true);
  };
  const handleEdit = () => {
    if (selected.length !== 1) return;
    const item = templates.find((t) => t.slug === selected[0]);
    if (!item) return;
    setEditing(item);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleSubmitForm = async (payload: CreateTemplateInput | UpdateTemplateInput) => {
    try {
      if (drawerMode === 'create') {
        await createMut.mutateAsync(payload as CreateTemplateInput);
        openSnack('Template created');
      } else if (editing) {
        await updateMut.mutateAsync(payload as UpdateTemplateInput);
        openSnack('Template updated');
      }
      setSelected([]);
    } catch (e: any) {
      openSnack(e?.message || 'Operation failed', 'error');
      throw e;
    }
  };

  const askAction = (action: 'delete' | 'publish' | 'unpublish') => {
    if (selected.length === 0) return;
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const performAction = async () => {
    try {
      if (confirmAction === 'delete') {
        await Promise.all(selected.map((s) => deleteMut.mutateAsync(s)));
        openSnack('Deleted');
      } else if (confirmAction === 'publish') {
        await Promise.all(selected.map((s) => publishMut.mutateAsync(s)));
        openSnack('Published');
      } else if (confirmAction === 'unpublish') {
        await Promise.all(selected.map((s) => unpublishMut.mutateAsync(s)));
        openSnack('Unpublished');
      }
      setSelected([]);
      setConfirmOpen(false);
      await refetch();
    } catch (e: any) {
      openSnack(e?.message || 'Operation failed', 'error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Templates (Admin)
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search"
          placeholder="name or slug..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
        />
        <TextField label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)} size="small" select>
          {statusOptions.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as any)}
          size="small"
          select
        >
          {visibilityOptions.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Sort" value={sort} onChange={(e) => setSort(e.target.value as any)} size="small" select>
          {sortOptions.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Tags (CSV)"
          placeholder="anime,portrait"
          value={tagsCSV}
          onChange={(e) => setTagsCSV(e.target.value)}
          size="small"
        />
        <Box flex={1} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          New Template
        </Button>
      </Stack>

      <Toolbar disableGutters variant="dense" sx={{ mb: 1 }}>
        <Tooltip title="Edit">
          <span>
            <IconButton onClick={handleEdit} disabled={selected.length !== 1}>
              <EditIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Publish">
          <span>
            <IconButton onClick={() => askAction('publish')} disabled={selected.length === 0}>
              <PublishIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Unpublish">
          <span>
            <IconButton onClick={() => askAction('unpublish')} disabled={selected.length === 0}>
              <UnpublishedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Delete">
          <span>
            <IconButton color="error" onClick={() => askAction('delete')} disabled={selected.length === 0}>
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Toolbar>
      <Divider sx={{ mb: 1 }} />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox checked={allSelected} indeterminate={selected.length > 0 && !allSelected} onChange={toggleAll} />
            </TableCell>
            <TableCell>Thumb</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>Published</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell align="right">Usage</TableCell>
            <TableCell>Tags</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((t) => (
            <TableRow key={t.slug} hover selected={isSelected(t.slug)} onClick={() => toggleRow(t.slug)}>
              <TableCell padding="checkbox">
                <Checkbox checked={isSelected(t.slug)} />
              </TableCell>
              <TableCell>
                {t.thumbnail_url ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img
                    src={t.thumbnail_url}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }}
                  />
                ) : (
                  <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: '#f5f5f5', border: '1px solid #eee' }} />
                )}
              </TableCell>
              <TableCell>{t.slug}</TableCell>
              <TableCell>{t.name}</TableCell>
              <TableCell>
                <Chip size="small" label={t.status} color={t.status === 'published' ? 'success' : t.status === 'archived' ? 'default' : 'warning'} />
              </TableCell>
              <TableCell>
                <Chip size="small" label={t.visibility} />
              </TableCell>
              <TableCell>{t.published_at ? formatRelative(t.published_at) : '-'}</TableCell>
              <TableCell>{t.updated_at ? formatRelative(t.updated_at) : '-'}</TableCell>
              <TableCell align="right">{typeof t.usage_count === 'number' ? formatCompactNumber(t.usage_count) : '-'}</TableCell>
              <TableCell>
                {(t.tags ?? []).slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                ))}
                {(t.tags ?? []).length > 3 ? <Chip size="small" label={`+${(t.tags ?? []).length - 3}`} /> : null}
              </TableCell>
            </TableRow>
          ))}
          {templates.length === 0 && !isFetching ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No templates found
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <TemplateFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        initial={editing}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmitForm}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmAction === 'delete'
            ? 'Confirm Delete'
            : confirmAction === 'publish'
            ? 'Confirm Publish'
            : 'Confirm Unpublish'
        }
        message={
          confirmAction === 'delete'
            ? `Delete ${selected.length} selected template(s)?`
            : confirmAction === 'publish'
            ? `Publish ${selected.length} selected template(s)?`
            : `Unpublish ${selected.length} selected template(s)?`
        }
        confirmText={confirmAction === 'delete' ? 'Delete' : confirmAction === 'publish' ? 'Publish' : 'Unpublish'}
        confirmColor={confirmAction === 'delete' ? 'error' : 'primary'}
        onClose={() => setConfirmOpen(false)}
        onConfirm={performAction}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTemplates;
