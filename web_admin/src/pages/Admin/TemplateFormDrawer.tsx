import React, { useEffect, useMemo, useRef } from 'react';
import {
  Drawer,
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTemplateAssetsQuery, useUploadTemplateAssetMutation, useUpdateTemplateAssetMutation, useDeleteTemplateAssetMutation, createAdminTemplate, uploadTemplateAsset } from '../../api/admin/templates';
import type { CreateTemplateInput, TemplateAdmin, UpdateTemplateInput, TemplateAssetAdmin } from '../../types/admin';

type Mode = 'create' | 'edit';

type TemplateFormDrawerProps = {
  open: boolean;
  mode: Mode;
  initial?: TemplateAdmin;
  onClose: () => void;
  onSubmit: (payload: CreateTemplateInput | UpdateTemplateInput) => Promise<void> | void;
};

// Shared enums
const statusOptions = ['draft', 'published', 'archived'] as const;
const visibilityOptions = ['public', 'private'] as const;

// Regex per requirement
const slugRegex = /^[a-z0-9-]+$/;

// zod schemas
const createSchema = z.object({
  slug: z.string().min(1).regex(slugRegex, 'Only lowercase letters, digits and hyphens'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(statusOptions),
  visibility: z.enum(visibilityOptions),
  tagsCSV: z.string().optional(), // comma separated, will split before submit
  thumbnail_url: z.string().url('Invalid URL').optional(),
});

const updateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(statusOptions),
  visibility: z.enum(visibilityOptions),
  tagsCSV: z.string().optional(),
  thumbnail_url: z.string().url('Invalid URL').optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const TemplateFormDrawer: React.FC<TemplateFormDrawerProps> = ({ open, mode, initial, onClose, onSubmit }) => {
  const isCreate = mode === 'create';
  const [createdSlug, setCreatedSlug] = React.useState<string | null>(null);
  const slugForEdit = isCreate ? (createdSlug ?? '') : (initial?.slug ?? '');

  // Assets hooks (only enabled in edit mode)
  const { data: assets = [], refetch: refetchAssets } = useTemplateAssetsQuery(slugForEdit);
  const uploadMut = useUploadTemplateAssetMutation(slugForEdit);
  const makeThumbMut = useUpdateTemplateAssetMutation(slugForEdit);
  const deleteAssetMut = useDeleteTemplateAssetMutation(slugForEdit);

  const defaultValuesCreate: CreateForm = useMemo(
    () => ({
      slug: '',
      name: '',
      description: '',
      status: 'draft',
      visibility: 'public',
      tagsCSV: '',
      thumbnail_url: '',
    }),
    [],
  );

  const defaultValuesUpdate: UpdateForm = useMemo(
    () => ({
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      status: (initial?.status as UpdateForm['status']) ?? 'draft',
      visibility: (initial?.visibility as UpdateForm['visibility']) ?? 'public',
      tagsCSV: (initial?.tags ?? []).join(','),
      thumbnail_url: initial?.thumbnail_url ?? '',
    }),
    [initial],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<CreateForm | UpdateForm>({
    resolver: zodResolver(isCreate ? createSchema : updateSchema),
    defaultValues: isCreate ? (defaultValuesCreate as any) : (defaultValuesUpdate as any),
    mode: 'onChange',
  });

  // Reset when open/close or initial changes
  useEffect(() => {
    if (isCreate) {
      reset(defaultValuesCreate as any);
    } else {
      reset(defaultValuesUpdate as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isCreate, initial]);

  // Auto-generate slug from name for create mode (once user hasn't touched slug manually)
  const slugTouchedRef = useRef(false);
  const nameVal = watch('name' as any) as string | undefined;
  const slugVal = watch('slug' as any) as string | undefined;

  useEffect(() => {
    if (!isCreate) return;
    if (slugTouchedRef.current) return;
    const next = slugify(nameVal ?? '');
    setValue('slug' as any, next, { shouldValidate: true });
  }, [isCreate, nameVal, setValue]);

  const onSlugChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    slugTouchedRef.current = true;
    setValue('slug' as any, e.target.value, { shouldValidate: true });
  };

  // Upload handlers (edit mode only)
  const thumbFileRef = React.useRef<HTMLInputElement | null>(null);
  const previewFileRef = React.useRef<HTMLInputElement | null>(null);

  async function handleUpload(kind: 'thumbnail' | 'preview', file: File | null) {
    if (!file) return;
    try {
      let effectiveSlug = slugForEdit;

      // In Create mode, ensure a draft exists before uploading
      if (isCreate && !createdSlug) {
        const slugVal2 = ((watch('slug' as any) as string) || '').trim();
        const nameVal2 = ((watch('name' as any) as string) || slugVal2 || '').trim();
        const statusVal = (watch('status' as any) as any) || 'draft';
        const visibilityVal = (watch('visibility' as any) as any) || 'public';
        const tagsCSV = ((watch('tagsCSV' as any) as string) || '').trim();
        const tags = tagsCSV ? tagsCSV.split(',').map((s) => s.trim()).filter(Boolean) : [];

        if (!slugVal2) {
          // eslint-disable-next-line no-console
          console.error('Slug is required before uploading');
          return;
        }

        // Create draft if not exists; if already exists, backend will return conflict and we proceed
        try {
          await createAdminTemplate({
            slug: slugVal2,
            name: nameVal2 || slugVal2,
            status: statusVal,
            visibility: visibilityVal,
            tags,
          });
        } catch (err: any) {
          // If conflict (already created elsewhere), ignore and continue
        }
        setCreatedSlug(slugVal2);
        effectiveSlug = slugVal2;
      }

      if (!effectiveSlug) return;

      // Upload using explicit slug (avoids stale hook param)
      const uploaded = await uploadTemplateAsset(effectiveSlug, kind, file);
      if (kind === 'thumbnail') {
        setValue('thumbnail_url' as any, uploaded.url, { shouldValidate: true, shouldDirty: true });
      }
      await refetchAssets();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  function onClickUpload(kind: 'thumbnail' | 'preview') {
    if (kind === 'thumbnail') thumbFileRef.current?.click();
    else previewFileRef.current?.click();
  }

  async function makeThumbnailFromAsset(a: TemplateAssetAdmin) {
    if (!slugForEdit) return;
    try {
      await makeThumbMut.mutateAsync({ id: a.id, payload: { kind: 'thumbnail' } });
      setValue('thumbnail_url' as any, a.url, { shouldValidate: true, shouldDirty: true });
      await refetchAssets();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  async function deleteAsset(a: TemplateAssetAdmin) {
    if (!slugForEdit) return;
    try {
      await deleteAssetMut.mutateAsync(a.id);
      await refetchAssets();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  const submitHandler = handleSubmit(async (values) => {
    try {
      if (isCreate) {
        const v = values as CreateForm;
        const payload: CreateTemplateInput = {
          slug: v.slug!,
          name: v.name,
          description: v.description ? v.description : undefined,
          status: v.status,
          visibility: v.visibility,
          tags: (v.tagsCSV ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          thumbnail_url: (v as any).thumbnail_url ? (v as any).thumbnail_url : undefined,
        };
        await onSubmit(payload);
      } else {
        const v = values as UpdateForm;
        const payload: UpdateTemplateInput = {
          name: v.name,
          description: v.description ? v.description : undefined,
          status: v.status,
          visibility: v.visibility,
          tags: (v.tagsCSV ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          thumbnail_url: (v as any).thumbnail_url ? (v as any).thumbnail_url : undefined,
        };
        await onSubmit(payload);
      }
      if (!isCreate) {
        onClose();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // leave drawer open for user to fix
    }
  });

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {isCreate ? 'Create Template' : `Edit Template${initial?.slug ? `: ${initial.slug}` : ''}`}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack component="form" spacing={2} onSubmit={submitHandler}>
          {isCreate ? (
            <TextField
              label="Slug"
              value={slugVal ?? ''}
              onChange={onSlugChange}
              helperText={errors && (errors as any).slug?.message}
              error={Boolean((errors as any).slug)}
              placeholder="e.g. anime-style"
              inputProps={{ maxLength: 128 }}
              fullWidth
            />
          ) : null}

          <TextField
            label="Name"
            {...register('name' as any)}
            helperText={errors.name?.message as any}
            error={Boolean(errors.name)}
            placeholder="Template name"
            inputProps={{ maxLength: 200 }}
            fullWidth
          />

          <TextField
            label="Description"
            {...register('description' as any)}
            helperText={errors.description?.message as any}
            error={Boolean(errors.description)}
            placeholder="Short description"
            multiline
            minRows={3}
            fullWidth
          />

          <TextField
            label="Thumbnail URL"
            {...register('thumbnail_url' as any)}
            helperText={(errors as any).thumbnail_url?.message || 'Enter a public image URL (or upload below in Edit mode)'}
            error={Boolean((errors as any).thumbnail_url)}
            placeholder="https://example.com/path/to/image.jpg"
            fullWidth
          />
          {(
            <Stack direction="row" spacing={1} alignItems="center">
              <input
                ref={thumbFileRef}
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(e) => handleUpload('thumbnail', e.target.files?.[0] ?? null)}
              />
              <input
                ref={previewFileRef}
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(e) => handleUpload('preview', e.target.files?.[0] ?? null)}
              />
              <Button variant="outlined" size="small" onClick={() => onClickUpload('thumbnail')} disabled={uploadMut.isPending}>
                {uploadMut.isPending ? 'Uploading…' : 'Upload Thumbnail'}
              </Button>
              <Button variant="text" size="small" onClick={() => onClickUpload('preview')} disabled={uploadMut.isPending}>
                Upload Preview
              </Button>
            </Stack>
          )}
          {(() => {
            const url = (watch('thumbnail_url' as any) as string) || '';
            return url ? (
              <Box sx={{ mt: -1 }}>
                {/* simple preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="thumbnail preview" style={{ width: 96, height: 96, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }} />
              </Box>
            ) : null;
          })()}

          {!isCreate ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Preview Gallery
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                {(assets as TemplateAssetAdmin[])
                  .filter((a) => a.kind === 'preview')
                  .map((a) => (
                    <Box key={a.id} sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img
                        src={a.url}
                        style={{ width: 96, height: 96, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }}
                      />
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Button size="small" variant="outlined" onClick={() => makeThumbnailFromAsset(a)} disabled={makeThumbMut.isPending}>
                          Make Thumbnail
                        </Button>
                        <Button size="small" color="error" onClick={() => deleteAsset(a)} disabled={deleteAssetMut.isPending}>
                          Delete
                        </Button>
                      </Stack>
                    </Box>
                  ))}
              </Stack>
            </Box>
          ) : null}

          <TextField
            label="Status"
            select
            defaultValue={isCreate ? 'draft' : (initial?.status ?? 'draft')}
            {...register('status' as any)}
            helperText={errors.status?.message as any}
            error={Boolean(errors.status)}
            fullWidth
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Visibility"
            select
            defaultValue={isCreate ? 'public' : (initial?.visibility ?? 'public')}
            {...register('visibility' as any)}
            helperText={errors.visibility?.message as any}
            error={Boolean(errors.visibility)}
            fullWidth
          >
            {visibilityOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Tags (CSV)"
            placeholder="anime,portrait"
            {...register('tagsCSV' as any)}
            helperText={errors && (errors as any).tagsCSV?.message}
            error={Boolean((errors as any).tagsCSV)}
            fullWidth
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
            <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isCreate ? 'Create' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default TemplateFormDrawer;
