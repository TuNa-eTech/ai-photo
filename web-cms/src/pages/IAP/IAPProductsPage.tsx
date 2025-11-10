/**
 * IAP Products Management Page
 * 
 * Display and manage IAP products
 */

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
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getIAPProducts } from '../../api/credits'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'

export function IAPProductsPage(): React.ReactElement {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['iap-products'],
    queryFn: getIAPProducts,
  })

  if (isLoading) {
    return <LoadingState message="Loading IAP products..." />
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load IAP products: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    )
  }

  const products = data?.products || []

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          IAP Products
        </Typography>
      </Stack>

      {products.length === 0 ? (
        <EmptyState
          title="No IAP Products"
          description="No in-app purchase products found."
        />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Product ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell align="right"><strong>Credits</strong></TableCell>
                <TableCell align="right"><strong>Price</strong></TableCell>
                <TableCell align="right"><strong>Display Order</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {product.product_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {product.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${product.credits} credits`}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {product.price && product.currency ? (
                      <Typography variant="body2">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: product.currency,
                        }).format(product.price)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {product.display_order}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

