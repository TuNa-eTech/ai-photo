import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onActionClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, actionText, onActionClick }) => {
  return (
    <Box sx={{ textAlign: 'center', p: 4 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        {actionText && onActionClick && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onActionClick}>
            {actionText}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default EmptyState;
