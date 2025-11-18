/**
 * IAP Products Table Component
 *
 * Table component for displaying and managing IAP products with CRUD actions
 */

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Box,
  Typography,
  Stack,
  alpha,
  Switch,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PriceCheckIcon from '@mui/icons-material/PriceCheck'
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined'
import type { IAPProductAdmin } from '../../api/credits'
import { formatDistanceToNow } from 'date-fns'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'

export interface IAPProductsTableProps {
  products: IAPProductAdmin[]
  loading?: boolean
  onEdit: (product: IAPProductAdmin) => void
  onDelete: (product: IAPProductAdmin) => void
  onView: (product: IAPProductAdmin) => void
  onToggleActive: (product: IAPProductAdmin, isActive: boolean) => void
  onCreateNew?: () => void
}

export function IAPProductsTable({
  products,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onToggleActive,
  onCreateNew,
}: IAPProductsTableProps): React.ReactElement {
  const formatDate = (date: string): string => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  }

  const formatPrice = (price?: number, currency?: string): string => {
    if (!price || !currency) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price)
  }

  if (loading) {
    return <LoadingState message="Loading IAP products..." />
  }

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Product ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="center"><strong>Credits</strong></TableCell>
              <TableCell align="right"><strong>Price</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Display Order</strong></TableCell>
              <TableCell align="right"><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState
                    title="No IAP Products Found"
                    description={
                      onCreateNew
                        ? "Create your first IAP product to get started."
                        : "No IAP products match the current filters."
                    }
                    actionLabel={onCreateNew ? 'Create IAP Product' : undefined}
                    onAction={onCreateNew}
                  />
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.product_id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: alpha('#000', 0.02),
                    },
                    opacity: product.is_active ? 1 : 0.6,
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" sx={{ fontWeight: 500 }}>
                      {product.product_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${product.credits}`}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatPrice(product.price, product.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Switch
                        checked={product.is_active}
                        onChange={() => onToggleActive(product, !product.is_active)}
                        size="small"
                        color="success"
                        icon={<PriceCheckOutlinedIcon fontSize="small" />}
                        checkedIcon={<PriceCheckIcon fontSize="small" />}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          ml: 1,
                          color: product.is_active ? 'success.main' : 'text.secondary',
                          fontWeight: product.is_active ? 600 : 400,
                        }}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {product.display_order}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(product.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => onView(product)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(product)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(product)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}