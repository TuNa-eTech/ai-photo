/**
 * Stats Card Component
 * 
 * Display key metrics in card format
 */

import { Card, CardContent, Box, Typography, alpha } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

export interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
  trend?: {
    value: number
    label: string
  }
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  color = '#3f51b5',
  trend 
}: StatsCardProps): React.ReactElement {
  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <TrendingUpIcon fontSize="small" color="success" />
            <Typography variant="body2" color="success.main" fontWeight={600}>
              +{trend.value}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trend.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

