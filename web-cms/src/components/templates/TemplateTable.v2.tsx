/**
 * Template Table Component (v2 - Professional Redesign)
 * 
 * Modern table design with better UX and visual hierarchy
 */

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Box,
  Typography,
  Stack,
  alpha,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PublishIcon from '@mui/icons-material/Publish'
import UnpublishedIcon from '@mui/icons-material/Unpublished'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import type { TemplateAdmin } from '../../types'
import { formatDistanceToNow } from 'date-fns'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import StyleIcon from '@mui/icons-material/Style'

export interface TemplateTableProps {
  templates: TemplateAdmin[]
  loading?: boolean
  onEdit: (template: TemplateAdmin) => void
  onDelete: (template: TemplateAdmin) => void
  onPublish: (template: TemplateAdmin) => void
  onUnpublish: (template: TemplateAdmin) => void
  onView: (template: TemplateAdmin) => void
  onCreateNew?: () => void
}

export function TemplateTable({
  templates,
  loading = false,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onView,
  onCreateNew,
}: TemplateTableProps): React.ReactElement {
  const formatDate = (date?: string): string => {
    if (!date) return 'N/A'
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  }

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

  const getVisibilityColor = (visibility: string): 'primary' | 'default' => {
    return visibility === 'public' ? 'primary' : 'default'
  }

  if (loading) {
    return <LoadingState message="Loading templates..." />
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        title="No templates found"
        description="Create your first template to get started with AI image generation"
        actionLabel="Create Template"
        onAction={onCreateNew}
        icon={<StyleIcon sx={{ fontSize: 64 }} />}
      />
    )
  }

  return (
    <TableContainer 
      component={Paper} 
      elevation={0}
      sx={{ 
        border: 1, 
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 80 }}>Thumbnail</TableCell>
            <TableCell sx={{ minWidth: 200 }}>Template</TableCell>
            <TableCell sx={{ width: 120 }}>Status</TableCell>
            <TableCell sx={{ width: 120 }}>Visibility</TableCell>
            <TableCell sx={{ minWidth: 150 }}>Tags</TableCell>
            <TableCell sx={{ width: 140 }}>Published</TableCell>
            <TableCell sx={{ width: 100 }}>Usage</TableCell>
            <TableCell align="right" sx={{ width: 180 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((template) => (
            <TableRow
              key={template.id}
              hover
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha('#3f51b5', 0.02),
                },
              }}
              onClick={() => onView(template)}
            >
              {/* Thumbnail */}
              <TableCell>
                <Avatar
                  src={template.thumbnailUrl}
                  alt={template.name}
                  variant="rounded"
                  sx={{ 
                    width: 56, 
                    height: 56,
                    boxShadow: 1,
                  }}
                >
                  {template.name.charAt(0)}
                </Avatar>
              </TableCell>

              {/* Template Info */}
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {template.name}
                  </Typography>
                  {template.description && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 300,
                      }}
                    >
                      {template.description}
                    </Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    color="text.disabled"
                    sx={{ 
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    {template.slug}
                  </Typography>
                </Box>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Chip
                  label={template.status}
                  size="small"
                  color={getStatusColor(template.status)}
                  sx={{ 
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                />
              </TableCell>

              {/* Visibility */}
              <TableCell>
                <Chip
                  label={template.visibility}
                  size="small"
                  color={getVisibilityColor(template.visibility)}
                  variant="outlined"
                  sx={{ 
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                />
              </TableCell>

              {/* Tags */}
              <TableCell>
                {template.tags && template.tags.length > 0 ? (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {template.tags.slice(0, 2).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        icon={<LocalOfferIcon />}
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          '& .MuiChip-icon': {
                            fontSize: '0.9rem',
                          }
                        }}
                      />
                    ))}
                    {template.tags.length > 2 && (
                      <Chip
                        label={`+${template.tags.length - 2}`}
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    No tags
                  </Typography>
                )}
              </TableCell>

              {/* Published Date */}
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(template.publishedAt)}
                </Typography>
              </TableCell>

              {/* Usage Count */}
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {template.usageCount?.toLocaleString() || '0'}
                </Typography>
              </TableCell>

              {/* Actions */}
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onView(template)
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#2196f3', 0.1),
                          color: 'info.main',
                        }
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(template)
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#3f51b5', 0.1),
                          color: 'primary.main',
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {template.status === 'published' ? (
                    <Tooltip title="Unpublish">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUnpublish(template)
                        }}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#ff9800', 0.1),
                            color: 'warning.main',
                          }
                        }}
                      >
                        <UnpublishedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Publish">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPublish(template)
                        }}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#4caf50', 0.1),
                            color: 'success.main',
                          }
                        }}
                      >
                        <PublishIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(template)
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#f44336', 0.1),
                          color: 'error.main',
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

