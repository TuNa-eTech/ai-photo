/**
 * IAP Products Management Page
 *
 * Full CRUD interface for managing IAP products
 */

import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  Fab,
} from '@mui/material'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AddIcon from '@mui/icons-material/Add'
import {
  getAdminIAPProducts,
  createIAPProduct,
  updateIAPProduct,
  deleteIAPProduct,
  activateIAPProduct,
  deactivateIAPProduct,
  type IAPProductAdmin,
  type CreateIAPProductRequest,
  type UpdateIAPProductRequest,
  type IAPProductsAdminParams,
} from '../../api/credits'
import { IAPProductsTable } from '../../components/iap/IAPProductsTable'
import { IAPProductFormDialog } from '../../components/iap/IAPProductFormDialog'
import { IAPProductsFilters } from '../../components/iap/IAPProductsFilters'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { LoadingState } from '../../components/common/LoadingState'

export function IAPProductsPage(): React.ReactElement {
  const [filters, setFilters] = useState<IAPProductsAdminParams>({
    limit: 50,
    offset: 0,
    sort_by: 'displayOrder',
    sort_order: 'asc',
  })

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<IAPProductAdmin | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<IAPProductAdmin | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const queryClient = useQueryClient()

  // Query for products
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-iap-products', filters],
    queryFn: () => getAdminIAPProducts(filters),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateIAPProductRequest) => createIAPProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-iap-products'] })
      setSnackbar({ open: true, message: 'IAP product created successfully', severity: 'success' })
      handleCloseForm()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateIAPProductRequest }) =>
      updateIAPProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-iap-products'] })
      setSnackbar({ open: true, message: 'IAP product updated successfully', severity: 'success' })
      handleCloseForm()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteIAPProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-iap-products'] })
      setSnackbar({ open: true, message: 'IAP product deleted successfully', severity: 'success' })
      handleCloseDeleteDialog()
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      isActive ? activateIAPProduct(productId) : deactivateIAPProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-iap-products'] })
      setSnackbar({ open: true, message: 'Product status updated successfully', severity: 'success' })
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Failed to update product status: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' })
    },
  })

  const products = productsData?.products || []

  // Event handlers
  const handleCreateNew = () => {
    setEditingProduct(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (product: IAPProductAdmin) => {
    setEditingProduct(product)
    setFormDialogOpen(true)
  }

  const handleDelete = (product: IAPProductAdmin) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleView = (product: IAPProductAdmin) => {
    // For now, just open edit dialog in read-only mode
    // Could be enhanced to show a dedicated view dialog
    handleEdit(product)
  }

  const handleToggleActive = (product: IAPProductAdmin, isActive: boolean) => {
    toggleActiveMutation.mutate({ productId: product.product_id, isActive })
  }

  const handleFormSubmit = async (data: CreateIAPProductRequest | UpdateIAPProductRequest) => {
    if (editingProduct) {
      updateMutation.mutate({ productId: editingProduct.product_id, data })
    } else {
      createMutation.mutate(data as CreateIAPProductRequest)
    }
  }

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.product_id)
    }
  }

  const handleCloseForm = () => {
    setFormDialogOpen(false)
    setEditingProduct(null)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDeletingProduct(null)
  }

  const handleFiltersChange = (newFilters: IAPProductsAdminParams) => {
    setFilters(newFilters)
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          IAP Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{ minWidth: 150 }}
        >
          Create Product
        </Button>
      </Stack>

      {/* Filters */}
      <IAPProductsFilters onFiltersChange={handleFiltersChange} />

      {/* Table */}
      {isLoading ? (
        <LoadingState message="Loading IAP products..." />
      ) : (
        <IAPProductsTable
          products={products}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onToggleActive={handleToggleActive}
          onCreateNew={handleCreateNew}
        />
      )}

      {/* Form Dialog */}
      <IAPProductFormDialog
        open={formDialogOpen}
        product={editingProduct}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete IAP Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This will deactivate the product and it will no longer be available for purchase.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />

      {/* Success/Error Messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="create product"
        onClick={handleCreateNew}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}

