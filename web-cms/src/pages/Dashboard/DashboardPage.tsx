/**
 * Dashboard Page
 * 
 * Overview with stats and quick actions
 */

import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import StyleIcon from '@mui/icons-material/Style'
import PublishIcon from '@mui/icons-material/Publish'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PeopleIcon from '@mui/icons-material/People'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { getAdminTemplates } from '../../api/templates'
import { formatDistanceToNow } from 'date-fns'

export function DashboardPage(): React.ReactElement {
  const navigate = useNavigate()

  const { data: templatesData } = useQuery({
    queryKey: ['templates', 'admin'],
    queryFn: () => getAdminTemplates({}),
  })

  const templates = templatesData?.templates || []
  const publishedCount = templates.filter(t => t.status === 'published').length
  const draftCount = templates.filter(t => t.status === 'draft').length
  const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0)

  const recentTemplates = templates.slice(0, 5)

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's an overview of your AI templates.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/templates')}
        >
          New Template
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        <StatsCard
          title="Total Templates"
          value={templates.length}
          icon={<StyleIcon sx={{ fontSize: 28 }} />}
          color="#3f51b5"
        />
        <StatsCard
          title="Published"
          value={publishedCount}
          icon={<PublishIcon sx={{ fontSize: 28 }} />}
          color="#4caf50"
        />
        <StatsCard
          title="Drafts"
          value={draftCount}
          icon={<StyleIcon sx={{ fontSize: 28 }} />}
          color="#ff9800"
        />
        <StatsCard
          title="Total Usage"
          value={totalUsage.toLocaleString()}
          icon={<PeopleIcon sx={{ fontSize: 28 }} />}
          color="#009688"
        />
      </Box>

      {/* Recent Templates */}
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Recent Templates
          </Typography>
          <Button
            size="small"
            endIcon={<VisibilityIcon />}
            onClick={() => navigate('/templates')}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {recentTemplates.length > 0 ? (
          <List disablePadding>
            {recentTemplates.map((template, index) => (
              <Box key={template.id}>
                <ListItem
                  sx={{
                    px: 0,
                    '&:hover': {
                      cursor: 'pointer',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => navigate(`/templates/${template.slug}`)}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={template.thumbnail_url}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    >
                      {template.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {template.name}
                      </Typography>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Chip
                          label={template.status}
                          size="small"
                          color={template.status === 'published' ? 'success' : 'default'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Updated {formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    {template.usage_count?.toLocaleString() || '0'} uses
                  </Typography>
                </ListItem>
                {index < recentTemplates.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No templates yet. Create your first template to get started!
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

