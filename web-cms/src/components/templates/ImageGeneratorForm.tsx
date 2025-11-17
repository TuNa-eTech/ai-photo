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
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import LinkIcon from '@mui/icons-material/Link'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DeleteIcon from '@mui/icons-material/Delete'
import EnhancedImageUpload from './EnhancedImageUpload'
import { fileToBase64, validateImageFile, validateImageUrl, getFileSizeString } from '../../utils/imageHelper'

export interface ImageGeneratorFormProps {
  onGenerate: (imageBase64: string) => Promise<void>
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

  const handleFileSelect = useCallback((file: File | string): void => {
    if (typeof file === 'string') {
      // Handle base64 string (cropped image)
      setPreviewUrl(file)
      setError('')

      // Convert base64 to File
      fetch(file)
        .then(res => res.blob())
        .then(blob => {
          const imageFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
          setSelectedFile(imageFile)
        })
        .catch(err => {
          console.error('Error converting base64 to file:', err)
          setError('Failed to process cropped image')
        })
    } else {
      // Handle File object
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error!)
        setSelectedFile(null)
        setPreviewUrl('')
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
    }
  }, [])

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const url = event.target.value
    setImageUrl(url)
    setError('')

    // Validate URL
    const validation = validateImageUrl(url)
    if (url && !validation.valid) {
      setError(validation.error!)
      setPreviewUrl('')
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
      let imageBase64 = ''

      if (inputMode === 'upload') {
        if (!selectedFile) {
          setError('Please select an image file')
          return
        }
        
        // Convert file to base64
        imageBase64 = await fileToBase64(selectedFile)
      } else {
        if (!imageUrl) {
          setError('Please enter an image URL')
          return
        }
        
        // For URL input, use URL as-is (backend will handle fetching)
        // Note: Backend currently expects base64, so URL mode may need adjustment
        imageBase64 = imageUrl
      }

      await onGenerate(imageBase64)
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
        <Box>
          {previewUrl && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Preview
              </Typography>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              />
            </Box>
          )}

          <EnhancedImageUpload
            onImageSelect={handleFileSelect}
            currentImage={previewUrl || undefined}
            label={previewUrl ? "Thay đổi hình ảnh" : "Tải lên hình ảnh"}
            helperText="Kéo và thả, nhấp để chọn, hoặc Ctrl+V để dán ảnh. Hỗ trợ cắt ảnh để phù hợp."
            maxSizeMB={10}
            disabled={loading}
            enableCrop={true}
          />

          {selectedFile && !previewUrl.includes('base64') && (
            <Alert severity="info" sx={{ mt: 2, fontSize: '0.875rem' }}>
              Selected: <strong>{selectedFile.name}</strong> ({getFileSizeString(selectedFile.size)})
            </Alert>
          )}
        </Box>
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

      {/* Preview for URL Mode */}
      {inputMode === 'url' && previewUrl && (
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

