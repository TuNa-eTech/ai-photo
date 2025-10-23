import React from 'react';
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const statusOptions = ['all', 'draft', 'published', 'archived'] as const;
const visibilityOptions = ['all', 'public', 'private'] as const;
const sortOptions = ['updated', 'newest', 'popular', 'name'] as const;

interface TemplateFiltersProps {
  q: string;
  setQ: (q: string) => void;
  status: (typeof statusOptions)[number];
  setStatus: (status: (typeof statusOptions)[number]) => void;
  visibility: (typeof visibilityOptions)[number];
  setVisibility: (visibility: (typeof visibilityOptions)[number]) => void;
  sort: (typeof sortOptions)[number];
  setSort: (sort: (typeof sortOptions)[number]) => void;
  tagsCSV: string;
  setTagsCSV: (tags: string) => void;
  onCreate: () => void;
}

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  q,
  setQ,
  status,
  setStatus,
  visibility,
  setVisibility,
  sort,
  setSort,
  tagsCSV,
  setTagsCSV,
  onCreate,
}) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Filters & Actions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onCreate();
            }}
            onFocus={(e) => e.stopPropagation()}
          >
            New Template
          </Button>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Search"
            placeholder="name or slug..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            size="small"
            select
            fullWidth
          >
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
            fullWidth
          >
            {visibilityOptions.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            size="small"
            select
            fullWidth
          >
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
            fullWidth
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default TemplateFilters;
