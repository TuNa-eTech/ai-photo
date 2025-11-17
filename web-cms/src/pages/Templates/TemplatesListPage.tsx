/**
 * Templates List Page
 * 
 * Full CRUD interface for managing templates
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useAuth } from '../../auth'
import { TemplateTable } from '../../components/templates/TemplateTable'
import { TemplatesFilters } from '../../components/templates/TemplatesFilters'
import { TemplateFormDialog } from '../../components/templates/TemplateFormDialog'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { Pagination } from '../../components/common/Pagination'
import {
  getAdminTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  publishTemplate,
  unpublishTemplate,
  uploadTemplateAsset,
} from '../../api/templates'
import type {
  TemplateAdmin,
  AdminTemplatesQueryParams,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from '../../types'
import { APIClientError } from '../../api/client'

export function TemplatesListPage(): React.ReactElement {
  useAuth() // For authentication check
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State
  const [filters, setFilters] = useState<AdminTemplatesQueryParams>({
    limit: 20,
    offset: 0,
    sort: 'updated',
  })

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TemplateAdmin | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<TemplateAdmin | null>(null)
  const [publishingTemplate, setPublishingTemplate] = useState<TemplateAdmin | null>(null)

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Fetch templates
  const { data, isLoading, error } = useQuery({
    queryKey: ['templates', 'admin', filters],
    queryFn: () => getAdminTemplates(filters),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', 'admin'] })
      setFormDialogOpen(false)
      setEditingTemplate(null)
      showSnackbar('Template created successfully', 'success')
    },
    onError: (error: Error) => {
      const message = error instanceof APIClientError ? error.message : 'Failed to create template'
      showSnackbar(message, 'error')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateTemplateRequest }) =>
      updateTemplate(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', 'admin'] })
      setFormDialogOpen(false)
      setEditingTemplate(null)
      showSnackbar('Template updated successfully', 'success')
    },
    onError: (error: Error) => {
      const message = error instanceof APIClientError ? error.message : 'Failed to update template'
      showSnackbar(message, 'error')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (slug: string) => deleteTemplate(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', 'admin'] })
      setDeletingTemplate(null)
      showSnackbar('Template deleted successfully', 'success')
    },
    onError: (error: Error) => {
      const message = error instanceof APIClientError ? error.message : 'Failed to delete template'
      showSnackbar(message, 'error')
    },
  })

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (slug: string) => publishTemplate(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', 'admin'] })
      setPublishingTemplate(null)
      showSnackbar('Template published successfully', 'success')
    },
    onError: (error: Error) => {
      const message = error instanceof APIClientError ? error.message : 'Failed to publish template'
      showSnackbar(message, 'error')
    },
  })

  // Unpublish mutation
  const unpublishMutation = useMutation({
    mutationFn: (slug: string) => unpublishTemplate(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', 'admin'] })
      showSnackbar('Template unpublished successfully', 'success')
    },
    onError: (error: Error) => {
      const message = error instanceof APIClientError ? error.message : 'Failed to unpublish template'
      showSnackbar(message, 'error')
    },
  })

  // Handlers
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info'): void => {
    setSnackbar({ open: true, message, severity })
  }


  const handleFiltersChange = (newFilters: AdminTemplatesQueryParams): void => {
    setFilters({ ...newFilters, limit: filters.limit, offset: 0 })
  }

  const handleFiltersReset = (): void => {
    setFilters({ limit: 20, offset: 0, sort: 'updated' })
  }

  const handlePageChange = (offset: number): void => {
    setFilters({ ...filters, offset })
  }

  const handleLimitChange = (limit: number): void => {
    setFilters({ ...filters, limit, offset: 0 })
  }

  const handleCreateClick = (): void => {
    setEditingTemplate(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (template: TemplateAdmin): void => {
    setEditingTemplate(template)
    setFormDialogOpen(true)
  }

  const handleView = (template: TemplateAdmin): void => {
    navigate(`/templates/${template.slug}`)
  }

  const handleFormSubmit = async (
    data: CreateTemplateRequest | UpdateTemplateRequest,
    thumbnailFile?: File
  ): Promise<void> => {
    if (editingTemplate) {
      // Update existing template
      updateMutation.mutate({ slug: editingTemplate.slug, data: data as UpdateTemplateRequest })
      
      // If thumbnail file is provided, upload it
      if (thumbnailFile) {
        try {
          await uploadTemplateAsset(editingTemplate.slug, {
            kind: 'thumbnail',
            file: thumbnailFile,
          })
          queryClient.invalidateQueries({ queryKey: ['templates', 'admin'] })
          showSnackbar('Template and thumbnail updated successfully', 'success')
        } catch (error) {
          const message = error instanceof APIClientError ? error.message : 'Failed to upload thumbnail'
          showSnackbar(message, 'error')
        }
      }
    } else {
      // Create new template
      try {
        const newTemplate = await createTemplate(data as CreateTemplateRequest)
        
        // If thumbnail file is provided, upload it
        if (thumbnailFile) {
          await uploadTemplateAsset(newTemplate.slug, {
            kind: 'thumbnail',
            file: thumbnailFile,
          })
        }
        
        queryClient.invalidateQueries({ queryKey: ['templates', 'admin'] })
        setFormDialogOpen(false)
        setEditingTemplate(null)
        showSnackbar(
          thumbnailFile 
            ? 'Template and thumbnail created successfully' 
            : 'Template created successfully',
          'success'
        )
      } catch (error) {
        const message = error instanceof APIClientError ? error.message : 'Failed to create template'
        showSnackbar(message, 'error')
      }
    }
  }

  const handleDelete = (template: TemplateAdmin): void => {
    setDeletingTemplate(template)
  }

  const handleDeleteConfirm = (): void => {
    if (deletingTemplate) {
      deleteMutation.mutate(deletingTemplate.slug)
    }
  }

  const handlePublish = (template: TemplateAdmin): void => {
    setPublishingTemplate(template)
  }

  const handlePublishConfirm = (): void => {
    if (publishingTemplate) {
      publishMutation.mutate(publishingTemplate.slug)
    }
  }

  const handleUnpublish = (template: TemplateAdmin): void => {
    unpublishMutation.mutate(template.slug)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your AI image generation templates
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick} size="large">
          New Template
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Failed to load templates'}
        </Alert>
      )}

      {/* Filters */}
      <TemplatesFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* Table */}
      <TemplateTable
        templates={data?.templates || []}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onView={handleView}
        onCreateNew={handleCreateClick}
      />

      {/* Pagination */}
      {data && data.templates.length > 0 && (
        <Pagination
          limit={filters.limit || 20}
          offset={filters.offset || 0}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Form Dialog */}
      <TemplateFormDialog
        open={formDialogOpen}
        template={editingTemplate}
        loading={createMutation.isPending || updateMutation.isPending}
        error={
          createMutation.error?.message || updateMutation.error?.message || null
        }
        onClose={() => {
          setFormDialogOpen(false)
          setEditingTemplate(null)
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingTemplate}
        title="Delete Template"
        message={`Are you sure you want to delete "${deletingTemplate?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTemplate(null)}
      />

      {/* Publish Confirmation */}
      <ConfirmDialog
        open={!!publishingTemplate}
        title="Publish Template"
        message={`Are you sure you want to publish "${publishingTemplate?.name}"? ${
          !publishingTemplate?.thumbnailUrl
            ? 'Warning: This template does not have a thumbnail. Publishing may fail.'
            : ''
        }`}
        confirmText="Publish"
        confirmColor="success"
        onConfirm={handlePublishConfirm}
        onCancel={() => setPublishingTemplate(null)}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

