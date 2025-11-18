/**
 * IAP Product Form Dialog Component
 *
 * Dialog for creating and editing IAP products
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Box,
} from '@mui/material'
import { useState, useEffect } from 'react'
import type { IAPProductAdmin, CreateIAPProductRequest, UpdateIAPProductRequest } from '../../api/credits'

export interface IAPProductFormDialogProps {
  open: boolean
  product?: IAPProductAdmin | null
  onClose: () => void
  onSubmit: (data: CreateIAPProductRequest | UpdateIAPProductRequest) => Promise<void>
  loading?: boolean
}

export function IAPProductFormDialog({
  open,
  product,
  onClose,
  onSubmit,
  loading = false,
}: IAPProductFormDialogProps): React.ReactElement {
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    description: '',
    credits: '',
    price: '',
    currency: 'USD',
    is_active: true,
    display_order: '0',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        // Edit mode - populate with existing data
        setFormData({
          product_id: product.product_id,
          name: product.name,
          description: product.description || '',
          credits: String(product.credits),
          price: product.price ? String(product.price) : '',
          currency: product.currency || 'USD',
          is_active: product.is_active,
          display_order: String(product.display_order),
        })
      } else {
        // Create mode - reset to defaults
        setFormData({
          product_id: '',
          name: '',
          description: '',
          credits: '',
          price: '',
          currency: 'USD',
          is_active: true,
          display_order: '0',
        })
      }
      setErrors({})
    }
  }, [open, product])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Product ID validation
    if (!formData.product_id.trim()) {
      newErrors.product_id = 'Product ID is required'
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.product_id)) {
      newErrors.product_id = 'Product ID can only contain letters, numbers, dots, hyphens, and underscores'
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    // Credits validation
    if (!formData.credits.trim()) {
      newErrors.credits = 'Credits amount is required'
    } else {
      const credits = parseInt(formData.credits)
      if (isNaN(credits) || credits < 1) {
        newErrors.credits = 'Credits must be a positive integer'
      }
    }

    // Price validation (optional but if provided must be valid)
    if (formData.price.trim()) {
      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        newErrors.price = 'Price must be a positive number'
      }
    }

    // Display Order validation
    if (!formData.display_order.trim()) {
      newErrors.display_order = 'Display order is required'
    } else {
      const order = parseInt(formData.display_order)
      if (isNaN(order) || order < 0) {
        newErrors.display_order = 'Display order must be a non-negative integer'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData: CreateIAPProductRequest | UpdateIAPProductRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      credits: parseInt(formData.credits),
      price: formData.price ? parseFloat(formData.price) : undefined,
      currency: formData.price ? formData.currency : undefined,
      is_active: formData.is_active,
      display_order: parseInt(formData.display_order),
    }

    // Include product_id only for create operations
    if (!product) {
      (submitData as CreateIAPProductRequest).product_id = formData.product_id.trim()
    }

    try {
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      // Error handling is managed by the parent component
      console.error('Failed to submit IAP product:', error)
    }
  }

  const handleInputChange = (field: string) => (event: any) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const isEditMode = !!product
  const dialogTitle = isEditMode ? 'Edit IAP Product' : 'Create New IAP Product'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Product ID"
                value={formData.product_id}
                onChange={handleInputChange('product_id')}
                error={!!errors.product_id}
                helperText={errors.product_id || 'Unique identifier for the product (e.g., com.app.credits.100)'}
                disabled={isEditMode} // Product ID cannot be changed in edit mode
                required
              />

              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name || 'Display name for the product'}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              multiline
              rows={3}
              helperText="Optional description of what the customer will receive"
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Credits"
                type="number"
                value={formData.credits}
                onChange={handleInputChange('credits')}
                error={!!errors.credits}
                helperText={errors.credits || 'Number of credits the customer will receive'}
                inputProps={{ min: 1, step: 1 }}
                required
              />

              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleInputChange('price')}
                error={!!errors.price}
                helperText={errors.price || 'Optional: Price for paid products'}
                inputProps={{ min: 0, step: '0.01' }}
              />

              <FormControl fullWidth disabled={!formData.price}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={handleInputChange('currency')}
                  label="Currency"
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="JPY">JPY (¥)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <TextField
                label="Display Order"
                type="number"
                value={formData.display_order}
                onChange={handleInputChange('display_order')}
                error={!!errors.display_order}
                helperText={errors.display_order || 'Order in which products are displayed (0 = first)'}
                inputProps={{ min: 0, step: 1 }}
                sx={{ width: 200 }}
                required
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleInputChange('is_active')}
                    color="success"
                  />
                }
                label={
                  <Typography variant="body2">
                    Product is {formData.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                }
              />
            </Box>

            <Box sx={{
              p: 2,
              bgcolor: 'info.main',
              borderRadius: 1,
              color: 'info.contrastText'
            }}>
              <Typography variant="body2">
                <strong>Note:</strong> Product ID should match your App Store Connect product identifier.
                Make sure it's unique and follows the reverse domain name notation (e.g., com.yourapp.credits.100).
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}