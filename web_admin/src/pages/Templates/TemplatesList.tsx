import React from 'react';
import {
  Box,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTemplatesQuery } from '../../api/templates';
import type { Template } from '../../types/template';
import { formatRelative, formatCompactNumber } from '../../utils/format';

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function TemplatesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [q, setQ] = React.useState(searchParams.get('q') ?? '');
  const [tags, setTags] = React.useState(searchParams.get('tags') ?? '');
  const [sort, setSort] = React.useState<'newest' | 'popular' | 'name'>(
    (searchParams.get('sort') as any) ?? 'newest',
  );
  const [limit, setLimit] = React.useState<number>(Number(searchParams.get('limit')) || 20);
  const [offset, setOffset] = React.useState<number>(Number(searchParams.get('offset')) || 0);

  const dq = useDebouncedValue(q, 400);
  const params = React.useMemo(
    () => ({ q: dq || undefined, tags: tags || undefined, sort, limit, offset }),
    [dq, tags, sort, limit, offset],
  );

  // keep URL in sync with current filters/pagination
  React.useEffect(() => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.tags) sp.set('tags', params.tags);
    if (params.sort) sp.set('sort', params.sort);
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.offset) sp.set('offset', String(params.offset));
    setSearchParams(sp, { replace: true });
  }, [params, setSearchParams]);

  const { data = [], isLoading, isFetching, error } = useTemplatesQuery(params);

  function openDetail(t: Template) {
    navigate(`/templates/${encodeURIComponent(t.id)}`, { state: { template: t } });
  }

  function goPrev() {
    setOffset(Math.max(0, offset - limit));
  }

  function goNext() {
    // Without total/hasMore meta, assume "has next" when list length === limit
    if (data.length === limit) {
      setOffset(offset + limit);
    }
  }

  function onChangeLimit(next: number) {
    setLimit(next);
    setOffset(0);
  }

  const rows: (Template | undefined)[] = isLoading
    ? Array.from({ length: 5 }).map(() => undefined)
    : (data as (Template | undefined)[]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
        <TextField
          label="Search (q)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
          sx={{ minWidth: 240 }}
        />
        <TextField
          label="Tags (CSV)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          size="small"
          sx={{ minWidth: 240 }}
          placeholder="anime,portrait"
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="sort-label">Sort</InputLabel>
          <Select
            labelId="sort-label"
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="popular">Popular</MenuItem>
            <MenuItem value="name">Name</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="limit-label">Page size</InputLabel>
          <Select
            labelId="limit-label"
            label="Page size"
            value={limit}
            onChange={(e) => onChangeLimit(Number(e.target.value))}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {isFetching ? 'Loading…' : ''}
        </Typography>
      </Stack>

      {error ? (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1, mb: 2 }}>
          <Typography color="error">
            {(error as any)?.message || 'Failed to load templates'}
          </Typography>
        </Box>
      ) : null}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Thumbnail</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Published</TableCell>
            <TableCell>Usage</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!isLoading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography>No results</Typography>
              </TableCell>
            </TableRow>
          ) : null}
          {rows.map((tpl: Template | undefined, idx: number) => {
            return (
              <TableRow key={tpl ? tpl.id : `skeleton-${idx}`}>
                <TableCell>
                  {tpl ? (
                    <Avatar
                      variant="rounded"
                      src={tpl.thumbnail_url}
                      alt={tpl.name}
                      sx={{ width: 48, height: 48 }}
                    />
                  ) : (
                    <Box sx={{ width: 48, height: 48, bgcolor: 'action.hover', borderRadius: 1 }} />
                  )}
                </TableCell>
                <TableCell>{tpl ? tpl.name : <Box sx={{ height: 20, bgcolor: 'action.hover' }} />}</TableCell>
                <TableCell>
                  {tpl ? formatRelative(tpl.published_at) : <Box sx={{ height: 20, bgcolor: 'action.hover' }} />}
                </TableCell>
                <TableCell>
                  {tpl ? formatCompactNumber(tpl.usage_count) : <Box sx={{ height: 20, bgcolor: 'action.hover' }} />}
                </TableCell>
                <TableCell align="right">
                  {tpl ? (
                    <IconButton aria-label="View" onClick={() => openDetail(tpl)}>
                      <ArrowForwardIcon />
                    </IconButton>
                  ) : (
                    <Box sx={{ width: 32, height: 32, bgcolor: 'action.hover', borderRadius: 1 }} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={goPrev} disabled={offset <= 0}>
          Prev
        </Button>
        <Typography variant="body2">Offset: {offset}</Typography>
        <Button
          variant="outlined"
          onClick={goNext}
          disabled={data.length < limit}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}
