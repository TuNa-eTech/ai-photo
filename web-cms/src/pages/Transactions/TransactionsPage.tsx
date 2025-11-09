/**
 * Transaction History Page
 * 
 * Display transaction history with filters
 */

import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { getTransactionHistory } from '../../api/credits'
import type { Transaction } from '../../api/credits'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'

const ITEMS_PER_PAGE = 20

export function TransactionsPage(): React.ReactElement {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const offset = (page - 1) * ITEMS_PER_PAGE

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transactions', offset, typeFilter, statusFilter],
    queryFn: () => getTransactionHistory({ limit: ITEMS_PER_PAGE, offset }),
  })

  const transactions = data?.transactions || []
  const total = data?.meta.total || 0
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  // Filter transactions client-side (since API doesn't support filters yet)
  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false
    
    // Status filter
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false
    
    // Search filter (by transaction ID or product ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchesId = tx.id.toLowerCase().includes(query)
      const matchesProductId = tx.product_id?.toLowerCase().includes(query) || false
      if (!matchesId && !matchesProductId) return false
    }
    
    return true
  })

  const getTypeColor = (type: Transaction['type']): 'success' | 'error' | 'info' => {
    switch (type) {
      case 'purchase':
        return 'success'
      case 'usage':
        return 'error'
      case 'bonus':
        return 'info'
      default:
        return 'info'
    }
  }

  const getStatusColor = (status: Transaction['status']): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'error'
      case 'pending':
        return 'warning'
      case 'refunded':
        return 'default'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return <LoadingState message="Loading transactions..." />
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load transactions: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Transaction History
        </Typography>
        <IconButton onClick={() => refetch()} color="primary">
          <RefreshIcon />
        </IconButton>
      </Stack>

      {/* Search and Filters */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {/* Search Box */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by Transaction ID or Product ID..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(1) // Reset to first page when search changes
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery('')
                    setPage(1)
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ maxWidth: 500 }}
        />

        {/* Filters Row */}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1) // Reset to first page when filter changes
              }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="purchase">Purchase</MenuItem>
              <MenuItem value="usage">Usage</MenuItem>
              <MenuItem value="bonus">Bonus</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1) // Reset to first page when filter changes
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Typography variant="body2" color="text.secondary">
            Showing {filteredTransactions.length} of {total} transactions
          </Typography>
        </Stack>
      </Stack>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Transactions"
          message="No transactions found matching your filters."
        />
      ) : (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Product ID</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.75rem' }}>
                        {tx.id.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tx.type}
                        color={getTypeColor(tx.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={tx.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {tx.amount > 0 ? '+' : ''}{tx.amount} credits
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                        {tx.product_id || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tx.status}
                        color={getStatusColor(tx.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(tx.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  )
}

