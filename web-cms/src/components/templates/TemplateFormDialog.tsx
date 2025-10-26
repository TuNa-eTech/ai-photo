/**
 * Template Form Dialog Component
 * 
 * Dialog for creating/editing templates
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import type { TemplateAdmin, CreateTemplateRequest, UpdateTemplateRequest, TemplateStatus, TemplateVisibility } from '../../types'

export interface TemplateFormDialogProps {
  open: boolean
  template?: TemplateAdmin | null
  loading?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (data: CreateTemplateRequest | UpdateTemplateRequest, thumbnailFile?: File) => void
}

export function TemplateFormDialog({
  open,
  template,
  loading = false,
  error = null,
  onClose,
  onSubmit,
}: TemplateFormDialogProps): React.ReactElement {
  const isEdit = !!template

  const [formData, setFormData] = useState<CreateTemplateRequest>({
    slug: '',
    name: '',
    description: '',
    prompt: '',
    negative_prompt: '',
    model_provider: 'gemini',
    model_name: 'gemini-1.5-pro',
    status: 'draft',
    visibility: 'public',
    tags: [],
  })

  const [tagsInput, setTagsInput] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  useEffect(() => {
    if (template) {
      setFormData({
        slug: template.slug,
        name: template.name,
        description: template.description || '',
        prompt: template.prompt || '',
        negative_prompt: template.negative_prompt || '',
        model_provider: template.model_provider || 'gemini',
        model_name: template.model_name || 'gemini-1.5-pro',
        status: template.status || 'draft',
        visibility: template.visibility || 'public',
        tags: template.tags || [],
      })
      setTagsInput(template.tags?.join(', ') || '')
      setThumbnailPreview(template.thumbnail_url || null)
      setThumbnailFile(null)
    } else {
      setFormData({
        slug: '',
        name: '',
        description: '',
        prompt: '',
        negative_prompt: '',
        model_provider: 'gemini',
        model_name: 'gemini-1.5-pro',
        status: 'draft',
        visibility: 'public',
        tags: [],
      })
      setTagsInput('')
      setThumbnailPreview(null)
      setThumbnailFile(null)
    }
    setErrors({})
  }, [template, open])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!isEdit && !formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }

    if (!isEdit && formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, thumbnail: 'Please select an image file' })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, thumbnail: 'Image must be smaller than 5MB' })
        return
      }

      setThumbnailFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear thumbnail error if exists
      const newErrors = { ...errors }
      delete newErrors.thumbnail
      setErrors(newErrors)
    }
  }

  const handleThumbnailRemove = (): void => {
    setThumbnailFile(null)
    // If editing and has new file selected, revert to original thumbnail
    // If creating new or no original thumbnail, clear preview
    if (isEdit && template?.thumbnail_url && !thumbnailFile) {
      // Already showing original, do nothing
      return
    }
    setThumbnailPreview(isEdit ? template?.thumbnail_url || null : null)
  }

  const handleSubmit = (): void => {
    if (!validateForm()) return

    // Parse tags
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    if (isEdit) {
      // Update: don't send slug
      const updateData: UpdateTemplateRequest = {
        name: formData.name,
        description: formData.description || undefined,
        prompt: formData.prompt || undefined,
        negative_prompt: formData.negative_prompt || undefined,
        model_provider: formData.model_provider || undefined,
        model_name: formData.model_name || undefined,
        status: formData.status,
        visibility: formData.visibility,
        tags: tags.length > 0 ? tags : undefined,
      }
      onSubmit(updateData, thumbnailFile || undefined)
    } else {
      // Create: include slug
      const createData: CreateTemplateRequest = {
        ...formData,
        description: formData.description || undefined,
        prompt: formData.prompt || undefined,
        negative_prompt: formData.negative_prompt || undefined,
        model_provider: formData.model_provider || undefined,
        model_name: formData.model_name || undefined,
        tags: tags.length > 0 ? tags : undefined,
      }
      onSubmit(createData, thumbnailFile || undefined)
    }
  }

  const handleClose = (): void => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Template' : 'Create Template'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name || 'Display name for the template'}
              disabled={loading}
            />
          </Grid>

          {/* Slug (only for create) */}
          {!isEdit && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase() })
                }
                error={!!errors.slug}
                helperText={
                  errors.slug || 'URL-friendly identifier (lowercase, hyphens only)'
                }
                disabled={loading}
                placeholder="anime-style"
              />
            </Grid>
          )}

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText="Optional description of the template"
              disabled={loading}
            />
          </Grid>

          {/* Prompt */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Prompt"
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              helperText="AI prompt template for image generation/processing"
              disabled={loading}
              placeholder="Transform this photo into a beautiful anime-style portrait with vibrant colors, expressive eyes..."
            />
          </Grid>

          {/* Negative Prompt */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Negative Prompt"
              value={formData.negative_prompt}
              onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
              helperText="What to avoid in generated images"
              disabled={loading}
              placeholder="blurry, low quality, distorted, deformed..."
            />
          </Grid>

          {/* Model Provider */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Model Provider</InputLabel>
              <Select
                value={formData.model_provider}
                label="Model Provider"
                onChange={(e) =>
                  setFormData({ ...formData, model_provider: e.target.value })
                }
                disabled={loading}
              >
                <MenuItem value="gemini">Gemini</MenuItem>
                <MenuItem value="openai">OpenAI DALL-E</MenuItem>
                <MenuItem value="midjourney">Midjourney</MenuItem>
                <MenuItem value="stable-diffusion">Stable Diffusion</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Model Name */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Model Name"
              value={formData.model_name}
              onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
              helperText="Specific model name/version"
              disabled={loading}
              placeholder="gemini-1.5-pro, gpt-4-vision..."
            />
          </Grid>

          {/* Status */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TemplateStatus })
                }
                disabled={loading}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Visibility */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={formData.visibility}
                label="Visibility"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    visibility: e.target.value as TemplateVisibility,
                  })
                }
                disabled={loading}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              helperText="Comma-separated tags (e.g., anime, portrait, art)"
              disabled={loading}
              placeholder="anime, portrait, art"
            />
          </Grid>

          {/* Thumbnail Upload */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Thumbnail Image
              </Typography>
              
              {thumbnailPreview ? (
                <Box>
                  <Box
                    component="img"
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    sx={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'block',
                    }}
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      disabled={loading}
                    >
                      Change
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleThumbnailRemove}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                >
                  Upload Thumbnail
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                </Button>
              )}
              
              {errors.thumbnail && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {errors.thumbnail}
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Recommended: Square image, at least 512x512px, max 5MB
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

