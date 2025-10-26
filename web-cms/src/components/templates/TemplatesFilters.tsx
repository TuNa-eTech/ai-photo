/**
 * Templates Filters Component
 * 
 * Provides filtering controls for templates list
 */

import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import type { AdminTemplatesQueryParams, TemplateStatus, TemplateVisibility, AdminTemplateSortOption } from '../../types'

export interface TemplatesFiltersProps {
  filters: AdminTemplatesQueryParams
  onChange: (filters: AdminTemplatesQueryParams) => void
  onReset: () => void
}

export function TemplatesFilters({
  filters,
  onChange,
  onReset,
}: TemplatesFiltersProps): React.ReactElement {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange({ ...filters, q: event.target.value || undefined })
  }

  const handleStatusChange = (event: SelectChangeEvent<string>): void => {
    onChange({
      ...filters,
      status: event.target.value ? (event.target.value as TemplateStatus) : undefined,
    })
  }

  const handleVisibilityChange = (event: SelectChangeEvent<string>): void => {
    onChange({
      ...filters,
      visibility: event.target.value
        ? (event.target.value as TemplateVisibility)
        : undefined,
    })
  }

  const handleSortChange = (event: SelectChangeEvent<string>): void => {
    onChange({
      ...filters,
      sort: event.target.value ? (event.target.value as AdminTemplateSortOption) : undefined,
    })
  }

  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange({ ...filters, tags: event.target.value || undefined })
  }

  const hasActiveFilters =
    filters.q || filters.status || filters.visibility || filters.tags || filters.sort

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder="Search by name or slug"
            value={filters.q || ''}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Visibility Filter */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Visibility</InputLabel>
            <Select
              value={filters.visibility || ''}
              onChange={handleVisibilityChange}
              label="Visibility"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Sort */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sort || 'updated'}
              onChange={handleSortChange}
              label="Sort By"
            >
              <MenuItem value="updated">Recently Updated</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="name">Name (A-Z)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Tags */}
        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Tags"
            placeholder="anime,portrait"
            value={filters.tags || ''}
            onChange={handleTagsChange}
          />
        </Grid>

        {/* Reset Button */}
        <Grid item xs={12} md={1}>
          <Button
            fullWidth
            variant="outlined"
            size="medium"
            onClick={onReset}
            disabled={!hasActiveFilters}
            startIcon={<ClearIcon />}
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}

