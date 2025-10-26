/**
 * Image Generator Form Component
 * 
 * Form to test AI image generation with file upload or URL paste
 */

import { useState, useCallback } from 'react'
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import LinkIcon from '@mui/icons-material/Link'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DeleteIcon from '@mui/icons-material/Delete'

export interface ImageGeneratorFormProps {
  onGenerate: (imagePath: string) => Promise<void>
  loading?: boolean
}

type InputMode = 'upload' | 'url'

export function ImageGeneratorForm({
  onGenerate,
  loading = false,
}: ImageGeneratorFormProps): React.ReactElement {
  const [inputMode, setInputMode] = useState<InputMode>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleModeChange = (_: React.SyntheticEvent, newMode: InputMode): void => {
    setInputMode(newMode)
    setError('')
    setPreviewUrl('')
    setSelectedFile(null)
    setImageUrl('')
  }

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const url = event.target.value
    setImageUrl(url)
    setError('')

    // Simple URL validation
    if (url && !url.match(/^https?:\/\/.+/)) {
      setError('Please enter a valid URL starting with http:// or https://')
    } else if (url) {
      setPreviewUrl(url)
    } else {
      setPreviewUrl('')
    }
  }

  const handleClear = (): void => {
    setSelectedFile(null)
    setImageUrl('')
    setPreviewUrl('')
    setError('')
  }

  const handleGenerate = async (): Promise<void> => {
    setError('')

    try {
      let imagePath = ''

      if (inputMode === 'upload') {
        if (!selectedFile) {
          setError('Please select an image file')
          return
        }
        // For now, use file name as path (backend will handle actual upload)
        imagePath = selectedFile.name
      } else {
        if (!imageUrl) {
          setError('Please enter an image URL')
          return
        }
        if (!imageUrl.match(/^https?:\/\/.+/)) {
          setError('Please enter a valid URL')
          return
        }
        imagePath = imageUrl
      }

      await onGenerate(imagePath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    }
  }

  const canGenerate = inputMode === 'upload' ? !!selectedFile : !!imageUrl && !error

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <AutoFixHighIcon color="primary" sx={{ fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700}>
          Test Generator
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        Upload an image or paste a URL to test this template's AI generation
      </Typography>

      {/* Input Mode Tabs */}
      <Tabs
        value={inputMode}
        onChange={handleModeChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab
          icon={<CloudUploadIcon />}
          iconPosition="start"
          label="Upload File"
          value="upload"
        />
        <Tab
          icon={<LinkIcon />}
          iconPosition="start"
          label="Paste URL"
          value="url"
        />
      </Tabs>

      {/* Upload Mode */}
      {inputMode === 'upload' && (
        <Stack spacing={2}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            size="large"
            fullWidth
            disabled={loading}
            sx={{ py: 2 }}
          >
            {selectedFile ? 'Change Image' : 'Choose Image'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          {selectedFile && (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
            </Alert>
          )}
        </Stack>
      )}

      {/* URL Mode */}
      {inputMode === 'url' && (
        <TextField
          fullWidth
          label="Image URL"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={handleUrlChange}
          disabled={loading}
          helperText="Enter a direct link to an image file"
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Preview */}
      {previewUrl && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Preview
          </Typography>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '75%', // 4:3 aspect ratio
              bgcolor: 'grey.100',
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box
              component="img"
              src={previewUrl}
              alt="Preview"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
            {!loading && (
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleClear}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Generate Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
        onClick={handleGenerate}
        disabled={!canGenerate || loading}
        sx={{
          mt: 3,
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </Button>

      {loading && (
        <Box mt={2}>
          <Alert severity="info" icon={<CircularProgress size={20} />}>
            Processing your image... This may take 10-30 seconds.
          </Alert>
        </Box>
      )}
    </Paper>
  )
}

