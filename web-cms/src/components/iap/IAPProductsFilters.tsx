/**
 * IAP Products Filters Component
 *
 * Filters component for searching and filtering IAP products
 */

import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Chip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import type { IAPProductsAdminParams } from '../../api/credits'

export interface IAPProductsFiltersProps {
  onFiltersChange: (filters: IAPProductsAdminParams) => void
  loading?: boolean
}

export function IAPProductsFilters({ onFiltersChange }: IAPProductsFiltersProps): React.ReactElement {
  const [filters, setFilters] = useState<IAPProductsAdminParams>({
    search: '',
    is_active: undefined,
    sort_by: 'displayOrder',
    sort_order: 'asc',
  })

  const handleFilterChange = (field: keyof IAPProductsAdminParams) => (event: any) => {
    const value = event.target.value
    const newFilters = { ...filters, [field]: value === '' ? undefined : value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: IAPProductsAdminParams = {
      sort_by: 'displayOrder',
      sort_order: 'asc',
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.search || filters.is_active !== undefined

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={2}>
        {/* Search and Status Row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by name, product ID, or description..."
            value={filters.search || ''}
            onChange={handleFilterChange('search')}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
            size="small"
          />

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.is_active === undefined ? '' : filters.is_active}
              onChange={handleFilterChange('is_active')}
              label="Status"
            >
              <MenuItem value="">All Products</MenuItem>
              <MenuItem value="true">Active Only</MenuItem>
              <MenuItem value="false">Inactive Only</MenuItem>
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              size="small"
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Sort Controls Row */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Sort by:
          </Typography>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort Field</InputLabel>
            <Select
              value={filters.sort_by || 'displayOrder'}
              onChange={handleFilterChange('sort_by')}
              label="Sort Field"
            >
              <MenuItem value="displayOrder">Display Order</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="created_at">Created Date</MenuItem>
              <MenuItem value="updated_at">Updated Date</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sort_order || 'asc'}
              onChange={handleFilterChange('sort_order')}
              label="Order"
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filters.search && (
              <Chip
                label={`Search: "${filters.search}"`}
                onDelete={() => handleFilterChange('search')({ target: { value: '' } })}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.is_active !== undefined && (
              <Chip
                label={`Status: ${filters.is_active ? 'Active' : 'Inactive'}`}
                onDelete={() => handleFilterChange('is_active')({ target: { value: '' } })}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Stack>
    </Box>
  )
}