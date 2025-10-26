/**
 * Result Display Component
 * 
 * Side-by-side comparison of original and processed images
 */

import {
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Divider,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export interface ResultDisplayProps {
  originalImageUrl: string
  processedImageUrl: string
  onDownload?: () => void
}

export function ResultDisplay({
  originalImageUrl,
  processedImageUrl,
  onDownload,
}: ResultDisplayProps): React.ReactElement {
  const handleDownload = (): void => {
    if (onDownload) {
      onDownload()
    } else {
      // Default download behavior
      const link = document.createElement('a')
      link.href = processedImageUrl
      link.download = `processed-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleZoom = (imageUrl: string): void => {
    window.open(imageUrl, '_blank')
  }

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700}>
          Result
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        Your image has been processed successfully
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Side-by-side comparison */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Original Image */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Original
            </Typography>
            <Tooltip title="View full size">
              <IconButton size="small" onClick={() => handleZoom(originalImageUrl)}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%', // 1:1 aspect ratio
              bgcolor: 'grey.100',
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box
              component="img"
              src={originalImageUrl}
              alt="Original"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Box>

        {/* Processed Image */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={600} color="primary">
              Processed
            </Typography>
            <Tooltip title="View full size">
              <IconButton size="small" onClick={() => handleZoom(processedImageUrl)}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%', // 1:1 aspect ratio
              bgcolor: 'grey.100',
              borderRadius: 2,
              overflow: 'hidden',
              border: 2,
              borderColor: 'primary.main',
              boxShadow: 3,
            }}
          >
            <Box
              component="img"
              src={processedImageUrl}
              alt="Processed"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          fullWidth
        >
          Download Result
        </Button>
        <Button
          variant="outlined"
          startIcon={<CompareArrowsIcon />}
          onClick={() => {
            handleZoom(originalImageUrl)
            setTimeout(() => handleZoom(processedImageUrl), 500)
          }}
        >
          Compare
        </Button>
      </Stack>
    </Paper>
  )
}

