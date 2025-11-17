/**
 * Trending Badge Component
 *
 * Displays trending status for templates with visual indicators
 * Supports manual and automatic trending with different styles
 */

import {
  Chip,
  Box,
  Tooltip,
} from '@mui/material'
import {
  TrendingUp,
  Whatshot,
} from '@mui/icons-material'

export interface TrendingBadgeProps {
  /** Whether the template is manually marked as trending */
  isTrendingManual?: boolean
  /** Whether the template is automatically trending (based on usage) */
  isAutoTrending?: boolean
  /** Size variant for the badge */
  size?: 'small' | 'medium'
  /** Whether to show the icon */
  showIcon?: boolean
  /** Custom tooltip text */
  tooltip?: string
}

export function TrendingBadge({
  isTrendingManual = false,
  isAutoTrending = false,
  size = 'small',
  showIcon = true,
  tooltip,
}: TrendingBadgeProps): React.ReactElement {
  // Don't render if not trending
  if (!isTrendingManual && !isAutoTrending) {
    return <></>
  }

  const isManualTrending = isTrendingManual
  const isTrending = isManualTrending || isAutoTrending

  // Determine styling based on trending type
  const getColor = () => {
    if (isManualTrending) {
      return {
        backgroundColor: '#ff9800', // Orange for manual
        color: 'white',
      }
    }
    return {
      backgroundColor: '#2196f3', // Blue for auto
      color: 'white',
    }
  }

  const getLabel = () => {
    if (isManualTrending) {
      return 'TRENDING'
    }
    return 'POPULAR'
  }

  const getTooltipText = () => {
    if (tooltip) return tooltip
    if (isManualTrending) {
      return 'Manually featured as trending'
    }
    return 'High usage - automatically trending'
  }

  const getIcon = () => {
    if (!showIcon) return undefined
    if (isManualTrending) {
      return <Whatshot fontSize="small" />
    }
    return <TrendingUp fontSize="small" />
  }

  const chipProps = {
    size,
    label: getLabel(),
    icon: getIcon(),
    sx: {
      fontWeight: 700,
      fontSize: size === 'small' ? '0.65rem' : '0.75rem',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      ...getColor(),
      '& .MuiChip-icon': {
        color: 'white',
      },
      animation: isTrending ? 'pulse 2s infinite' : 'none',
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.7 },
        '100%': { opacity: 1 },
      },
    },
  }

  return (
    <Tooltip title={getTooltipText()} arrow placement="top">
      <Chip {...chipProps} />
    </Tooltip>
  )
}

/**
 * Simplified version for compact spaces
 */
export function TrendingIndicator({
  isTrendingManual,
  isAutoTrending,
  size = 16,
}: {
  isTrendingManual?: boolean
  isAutoTrending?: boolean
  size?: number
}): React.ReactElement {
  if (!isTrendingManual && !isAutoTrending) {
    return <></>
  }

  const color = isTrendingManual ? '#ff9800' : '#2196f3'

  return (
    <Tooltip
      title={isTrendingManual ? 'Manually trending' : 'Auto trending'}
      arrow
      placement="top"
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          color,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.7 },
            '100%': { opacity: 1 },
          },
        }}
      >
        {isTrendingManual ? (
          <Whatshot sx={{ fontSize: size }} />
        ) : (
          <TrendingUp sx={{ fontSize: size }} />
        )}
      </Box>
    </Tooltip>
  )
}