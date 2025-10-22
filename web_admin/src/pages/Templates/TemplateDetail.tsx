import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Stack, Typography, Avatar, Button, Divider } from '@mui/material';
import type { Template } from '../../types/template';
import { formatRelative, formatCompactNumber } from '../../utils/format';

export default function TemplateDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as any;
  const tpl: Template | undefined = location?.state?.template;

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="text" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h5" component="h1">
          Template Detail
        </Typography>
      </Stack>

      {!tpl ? (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            No template data found in navigation state.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {id}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Navigate here from the list to view cached details. A detail API can be added in Phase 2.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              variant="rounded"
              src={tpl.thumbnail_url}
              alt={tpl.name}
              sx={{ width: 96, height: 96 }}
            />
            <Box>
              <Typography variant="h6">{tpl.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {tpl.id}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Metadata</Typography>
            <Typography variant="body2">
              Published: {formatRelative(tpl.published_at)}
            </Typography>
            <Typography variant="body2">
              Usage count: {formatCompactNumber(tpl.usage_count)}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Tags / Categories</Typography>
            <Typography variant="body2" color="text.secondary">
              Not implemented in Phase 1. Display-only placeholder.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Assets</Typography>
            <Typography variant="body2" color="text.secondary">
              Thumbnail shown above. Additional assets management will be added in Phase 2.
            </Typography>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
