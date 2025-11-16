/**
 * Template Form Dialog Component (v2 - Professional Redesign)
 * 
 * Modern tabbed interface for creating/editing templates
 * Focus on UX and visual hierarchy
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
  Alert,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Paper,
  Divider,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import ImageIcon from '@mui/icons-material/Image'
import SettingsIcon from '@mui/icons-material/Settings'
import type { TemplateAdmin, CreateTemplateRequest, UpdateTemplateRequest, TemplateStatus, TemplateVisibility } from '../../types'
import { generateSlug } from '../../utils/slug'

export interface TemplateFormDialogProps {
  open: boolean
  template?: TemplateAdmin | null
  loading?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (data: CreateTemplateRequest | UpdateTemplateRequest, thumbnailFile?: File) => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
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
  const [activeTab, setActiveTab] = useState(0)

  const [formData, setFormData] = useState<CreateTemplateRequest>({
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
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  // Category-to-tags mapping (matching server mapping)
  const CATEGORY_TO_TAGS: Record<string, string[]> = {
    portrait: ['portrait', 'chân dung', 'person', 'people'],
    landscape: ['landscape', 'phong cảnh', 'scenery', 'nature'],
    artistic: ['artistic', 'nghệ thuật', 'art', 'creative'],
    vintage: ['vintage', 'cổ điển', 'classic', 'retro'],
    abstract: ['abstract', 'trừu tượng', 'geometric', 'pattern'],
  }

  const CATEGORY_OPTIONS = [
    { value: '', label: 'None' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
    { value: 'artistic', label: 'Artistic' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'abstract', label: 'Abstract' },
  ]

  useEffect(() => {
    if (template) {
      setFormData({
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
      setSelectedCategory('') // Reset category on edit (we don't store it)
      setActiveTab(0)
    } else {
      setFormData({
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
      setSelectedCategory('')
      setActiveTab(0)
    }
    setErrors({})
  }, [template, open])

  // Handle category change - auto-populate tags
  const handleCategoryChange = (category: string): void => {
    setSelectedCategory(category)
    if (category && CATEGORY_TO_TAGS[category]) {
      const suggestedTags = CATEGORY_TO_TAGS[category]
      // If tagsInput is empty, populate with suggested tags
      // Otherwise, append suggested tags that aren't already present
      if (!tagsInput.trim()) {
        setTagsInput(suggestedTags.join(', '))
      } else {
        const existingTags = tagsInput.split(',').map((t) => t.trim().toLowerCase())
        const newTags = suggestedTags.filter(
          (tag) => !existingTags.includes(tag.toLowerCase())
        )
        if (newTags.length > 0) {
          setTagsInput(`${tagsInput}, ${newTags.join(', ')}`)
        }
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.prompt && formData.prompt.length < 10) {
      newErrors.prompt = 'Prompt should be at least 10 characters for better results'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, thumbnail: 'Please select an image file' })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, thumbnail: 'Image must be smaller than 5MB' })
        return
      }

      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      const newErrors = { ...errors }
      delete newErrors.thumbnail
      setErrors(newErrors)
    }
  }

  const handleThumbnailRemove = (): void => {
    setThumbnailFile(null)
    if (isEdit && template?.thumbnail_url && !thumbnailFile) {
      return
    }
    setThumbnailPreview(isEdit ? template?.thumbnail_url || null : null)
  }

  // Handle name change and auto-generate slug for new templates
  const handleNameChange = (name: string): void => {
    // Auto-generate slug for new templates
    if (!isEdit && name.trim()) {
      const generatedSlug = generateSlug(name.trim())
      setFormData(prev => ({ ...prev, name, slug: generatedSlug }))
    } else {
      setFormData(prev => ({ ...prev, name }))
    }
  }

  const handleSubmit = (): void => {
    if (!validateForm()) {
      setActiveTab(0) // Go to basic info tab if validation fails
      return
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    if (isEdit) {
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

  const promptLength = formData.prompt?.length || 0
  const negativePromptLength = formData.negative_prompt?.length || 0

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoFixHighIcon color="primary" />
          <Typography variant="h5" component="span">
            {isEdit ? 'Edit Template' : 'Create New Template'}
          </Typography>
        </Box>
        {isEdit && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Editing: <strong>{template?.name}</strong>
          </Typography>
        )}
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 3, mb: 0 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Basic Info" icon={<InfoOutlinedIcon />} iconPosition="start" />
            <Tab label="AI Prompts" icon={<AutoFixHighIcon />} iconPosition="start" />
            <Tab label="Media" icon={<ImageIcon />} iconPosition="start" />
            <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ px: 3, pb: 2 }}>
          {/* Tab 1: Basic Info */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                required
                label="Template Name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                error={!!errors.name}
                helperText={errors.name || 'Display name for the template'}
                disabled={loading}
                autoFocus
              />

              {!isEdit && (
                <TextField
                  fullWidth
                  label="Slug"
                  value={formData.slug || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value.toLowerCase() })
                  }
                  helperText="Auto-generated from name (you can customize)"
                  disabled={loading}
                  placeholder="anime-style"
                />
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                helperText="Brief description of what this template does"
                disabled={loading}
                placeholder="Transform photos into beautiful anime-style portraits..."
              />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={loading}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Selecting a category will suggest relevant tags. You can add additional tags.
                </Typography>
              </FormControl>

              <TextField
                fullWidth
                label="Tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                helperText="Comma-separated tags (e.g., anime, portrait, art)"
                disabled={loading}
                placeholder="anime, portrait, art"
              />
            </Stack>
          </TabPanel>

          {/* Tab 2: AI Prompts */}
          <TabPanel value={activeTab} index={1}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <InfoOutlinedIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      AI Prompt Tips
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Be specific and detailed (100-200 words recommended)<br />
                      • Describe style, mood, colors, and techniques<br />
                      • Include quality keywords (4K, professional, high-detail)
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Positive Prompt *
                  </Typography>
                  <Chip 
                    label={`${promptLength} characters`} 
                    size="small"
                    color={promptLength < 50 ? 'warning' : promptLength > 200 ? 'success' : 'default'}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  error={!!errors.prompt}
                  helperText={errors.prompt || 'Describe what you want the AI to generate'}
                  disabled={loading}
                  placeholder="Transform this photo into a beautiful anime-style portrait with vibrant saturated colors, large expressive eyes with detailed highlights, soft cel-shading technique, clean line art, modern anime aesthetic..."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                    }
                  }}
                />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Negative Prompt
                  </Typography>
                  <Chip 
                    label={`${negativePromptLength} characters`} 
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.negative_prompt}
                  onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
                  helperText="What to avoid in generated images"
                  disabled={loading}
                  placeholder="blurry, low quality, distorted, deformed, bad anatomy, extra limbs, watermark, signature, text, logo..."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                    }
                  }}
                />
              </Box>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Model Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth size="small">
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
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Model Name"
                        value={formData.model_name}
                        onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                        helperText="Specific model version"
                        disabled={loading}
                        placeholder="gemini-1.5-pro"
                      />
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </TabPanel>

          {/* Tab 3: Media */}
          <TabPanel value={activeTab} index={2}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.50' }}>
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <InfoOutlinedIcon color="info" fontSize="small" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Thumbnail Requirements
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Recommended: Square image, at least 512x512px<br />
                      • Maximum file size: 5MB<br />
                      • Formats: JPG, PNG, WebP, GIF
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Thumbnail Image
                </Typography>
                
                {thumbnailPreview ? (
                  <Box>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        display: 'inline-block',
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        component="img"
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        sx={{
                          width: '100%',
                          maxWidth: 300,
                          height: 300,
                          objectFit: 'cover',
                          borderRadius: 1,
                          display: 'block',
                        }}
                      />
                    </Paper>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={loading}
                      >
                        Change Image
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
                        startIcon={<DeleteIcon />}
                        onClick={handleThumbnailRemove}
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    disabled={loading}
                    sx={{ mt: 1 }}
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
              </Box>
            </Stack>
          </TabPanel>

          {/* Tab 4: Settings */}
          <TabPanel value={activeTab} index={3}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
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
                      <MenuItem value="draft">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="Draft" size="small" />
                          <Typography variant="body2">Not visible to users</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="published">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="Published" size="small" color="success" />
                          <Typography variant="body2">Live and visible</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="archived">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="Archived" size="small" color="error" />
                          <Typography variant="body2">Hidden from users</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
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
                      <MenuItem value="public">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="Public" size="small" color="primary" variant="outlined" />
                          <Typography variant="body2">Anyone can use</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="private">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="Private" size="small" variant="outlined" />
                          <Typography variant="body2">Restricted access</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>

              {formData.status === 'published' && !thumbnailPreview && (
                <Alert severity="warning">
                  Publishing without a thumbnail may fail. Please upload a thumbnail image.
                </Alert>
              )}
            </Stack>
          </TabPanel>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ minWidth: 120 }}
        >
          {isEdit ? 'Update Template' : 'Create Template'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

