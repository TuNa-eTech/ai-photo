/**
 * Template Table Component
 * 
 * Displays templates in a Material UI table with actions
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
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PublishIcon from '@mui/icons-material/Publish'
import UnpublishedIcon from '@mui/icons-material/Unpublished'
import VisibilityIcon from '@mui/icons-material/Visibility'
import type { TemplateAdmin } from '../../types'
import { formatDistanceToNow } from 'date-fns'

export interface TemplateTableProps {
  templates: TemplateAdmin[]
  loading?: boolean
  onEdit: (template: TemplateAdmin) => void
  onDelete: (template: TemplateAdmin) => void
  onPublish: (template: TemplateAdmin) => void
  onUnpublish: (template: TemplateAdmin) => void
  onView: (template: TemplateAdmin) => void
}

export function TemplateTable({
  templates,
  loading = false,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onView,
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
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>Loading templates...</Typography>
      </Box>
    )
  }

  if (templates.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No templates found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create your first template to get started
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Thumbnail</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>Published</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Usage</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((template) => (
            <TableRow
              key={template.id}
              hover
              sx={{ '&:hover': { cursor: 'pointer' } }}
              onClick={() => onView(template)}
            >
              <TableCell>
                <Avatar
                  src={template.thumbnail_url}
                  alt={template.name}
                  variant="rounded"
                  sx={{ width: 48, height: 48 }}
                >
                  {template.name.charAt(0)}
                </Avatar>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {template.name}
                </Typography>
                {template.description && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {template.description.substring(0, 50)}
                    {template.description.length > 50 ? '...' : ''}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {template.slug}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={template.status}
                  size="small"
                  color={getStatusColor(template.status)}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={template.visibility}
                  size="small"
                  color={getVisibilityColor(template.visibility)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(template.published_at)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(template.updated_at)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {template.usage_count?.toLocaleString() || '0'}
                </Typography>
              </TableCell>
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Box display="flex" gap={0.5} justifyContent="flex-end">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onView(template)
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
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {template.status === 'published' ? (
                    <Tooltip title="Unpublish">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUnpublish(template)
                        }}
                      >
                        <UnpublishedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Publish">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPublish(template)
                        }}
                      >
                        <PublishIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(template)
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

