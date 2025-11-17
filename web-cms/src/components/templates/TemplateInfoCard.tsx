/**
 * Template Info Card Component
 * 
 * Displays comprehensive template information
 */

import {
  Paper,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CodeIcon from '@mui/icons-material/Code'
import { formatDistanceToNow } from 'date-fns'
import type { TemplateAdmin } from '../../types'

export interface TemplateInfoCardProps {
  template: TemplateAdmin
  onEdit: () => void
}

export function TemplateInfoCard({ template, onEdit }: TemplateInfoCardProps): React.ReactElement {
  const getStatusColor = (status: string): 'success' | 'default' | 'error' => {
    switch (status) {
      case 'published':
        return 'success'
      case 'draft':
        return 'default'
      case 'archived':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (date?: string): string => {
    if (!date) return 'N/A'
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      {/* Header with Edit Button */}
      <Box sx={{ p: 3, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h5" fontWeight={700}>
            Template Details
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={onEdit}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {/* Thumbnail */}
      {template.thumbnailUrl && (
        <Box
          sx={{
            width: '100%',
            height: 240,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={template.thumbnailUrl}
            alt={template.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      )}

      {/* Main Info */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {template.name}
        </Typography>

        {template.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {template.description}
          </Typography>
        )}

        {/* Status & Visibility */}
        <Stack direction="row" spacing={1} mb={2}>
          <Chip
            label={template.status}
            size="small"
            color={getStatusColor(template.status)}
            sx={{ fontWeight: 500, textTransform: 'capitalize' }}
          />
          <Chip
            label={template.visibility}
            size="small"
            color={template.visibility === 'public' ? 'primary' : 'default'}
            variant="outlined"
            sx={{ fontWeight: 500, textTransform: 'capitalize' }}
          />
        </Stack>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={0.5}>
              <LocalOfferIcon fontSize="small" />
              Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {template.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Stats */}
        <Box mb={3}>
          <Stack spacing={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <VisibilityIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Usage Count:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {template.usageCount?.toLocaleString() || '0'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Published:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatDate(template.publishedAt)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* AI Configuration */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <AutoFixHighIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                AI Configuration
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* Prompt */}
              {template.prompt && (
                <Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
                    Prompt
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {template.prompt}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Negative Prompt */}
              {template.negativePrompt && (
                <Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
                    Negative Prompt
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {template.negativePrompt}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Model Info */}
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom display="block">
                  Model Information
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<CodeIcon />}
                    label={template.modelProvider}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={template.modelName}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Metadata */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Metadata
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Slug
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {template.slug}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Template ID
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {template.id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {formatDate(template.createdAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {formatDate(template.updatedAt)}
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
  )
}

