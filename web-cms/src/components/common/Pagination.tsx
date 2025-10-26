/**
 * Pagination Component
 * 
 * Simple pagination controls for list views
 */

import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

export interface PaginationProps {
  limit: number
  offset: number
  total?: number
  onPageChange: (offset: number) => void
  onLimitChange: (limit: number) => void
}

export function Pagination({
  limit,
  offset,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps): React.ReactElement {
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = total ? Math.ceil(total / limit) : 0
  const hasNext = total ? offset + limit < total : true
  const hasPrevious = offset > 0

  const handlePrevious = (): void => {
    if (hasPrevious) {
      onPageChange(Math.max(0, offset - limit))
    }
  }

  const handleNext = (): void => {
    if (hasNext) {
      onPageChange(offset + limit)
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mt={2}
      flexWrap="wrap"
      gap={2}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={limit}
            label="Per Page"
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>

        {total !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {offset + 1} - {Math.min(offset + limit, total)} of {total}
          </Typography>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          startIcon={<NavigateBeforeIcon />}
        >
          Previous
        </Button>

        {totalPages > 0 && (
          <Typography variant="body2" sx={{ mx: 2 }}>
            Page {currentPage} of {totalPages}
          </Typography>
        )}

        <Button
          variant="outlined"
          size="small"
          onClick={handleNext}
          disabled={!hasNext}
          endIcon={<NavigateNextIcon />}
        >
          Next
        </Button>
      </Box>
    </Box>
  )
}

