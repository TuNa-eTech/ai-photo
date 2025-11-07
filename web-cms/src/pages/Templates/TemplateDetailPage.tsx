/**
 * Template Detail Page
 * 
 * Displays template information and provides image generation testing
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Container,
  Box,
  Button,
  Alert,
  Snackbar,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getAdminTemplate, updateTemplate } from '../../api/templates'
import { processImage } from '../../api/images'
import { TemplateInfoCard } from '../../components/templates/TemplateInfoCard'
import { ImageGeneratorForm } from '../../components/templates/ImageGeneratorForm'
import { ResultDisplay } from '../../components/templates/ResultDisplay'
import { TemplateFormDialog } from '../../components/templates/TemplateFormDialog'
import { LoadingState } from '../../components/common/LoadingState'
import type { TemplateAdmin, UpdateTemplateRequest } from '../../types'

export function TemplateDetailPage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('')
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  // Fetch template data
  const {
    data: template,
    isLoading,
    error: fetchError,
  } = useQuery<TemplateAdmin>({
    queryKey: ['template', slug],
    queryFn: () => {
      if (!slug) throw new Error('Template slug is required')
      return getAdminTemplate(slug)
    },
    enabled: !!slug,
  })

  // Handlers
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info'): void => {
    setSnackbar({ open: true, message, severity })
  }

  const handleBack = (): void => {
    navigate('/templates')
  }

  const handleEdit = (): void => {
    setIsEditDialogOpen(true)
  }

  const handleEditClose = (): void => {
    setIsEditDialogOpen(false)
  }

  const handleEditSubmit = async (data: UpdateTemplateRequest): Promise<void> => {
    try {
      if (!slug) {
        throw new Error('Template slug is required')
      }
      
      await updateTemplate(slug, data)
      showSnackbar('Template updated successfully', 'success')
      setIsEditDialogOpen(false)
      
      // Refetch template data
      queryClient.invalidateQueries({ queryKey: ['template', slug] })
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : 'Failed to update template',
        'error'
      )
    }
  }

  const handleGenerate = async (imageBase64: string): Promise<void> => {
    if (!template) return

    setIsGenerating(true)
    setError('')
    setGeneratedImageUrl('')

    try {
      // Store original image for comparison
      setOriginalImageUrl(imageBase64)

      // Call process image API
      const result = await processImage({
        template_id: template.id,
        image_base64: imageBase64,
        options: {
          width: 1024,
          height: 1024,
          quality: 'standard',
        },
      })

      setGeneratedImageUrl(result.processed_image_base64)
      
      // Show success message with metadata
      const metadata = result.metadata
      const generationTime = (metadata.generation_time_ms / 1000).toFixed(1)
      showSnackbar(
        `Image generated successfully in ${generationTime}s using ${metadata.model_used}!`,
        'success'
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image'
      setError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSnackbarClose = (): void => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LoadingState message="Loading template..." />
      </Container>
    )
  }

  // Error state
  if (fetchError || !template) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to Templates
        </Button>
        <Alert severity="error">
          {fetchError instanceof Error ? fetchError.message : 'Template not found'}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Back to Templates
        </Button>
      </Box>

      {/* Main Content - 2 Column Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Left Column - Template Info */}
        <Box>
          <TemplateInfoCard
            template={template}
            onEdit={handleEdit}
          />
        </Box>

        {/* Right Column - Generator & Result */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {/* Image Generator Form */}
            <ImageGeneratorForm
              onGenerate={handleGenerate}
              loading={isGenerating}
            />

            {/* Result Display */}
            {generatedImageUrl && originalImageUrl && (
              <ResultDisplay
                originalImageUrl={originalImageUrl}
                processedImageUrl={generatedImageUrl}
              />
            )}

            {/* Error Display */}
            {error && !isGenerating && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <TemplateFormDialog
        open={isEditDialogOpen}
        template={template}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
