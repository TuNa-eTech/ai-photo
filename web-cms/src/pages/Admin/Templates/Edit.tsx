import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAdminTemplateQuery,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  usePublishTemplateMutation,
  useUnpublishTemplateMutation,
  useTemplateAssetsQuery,
  useUploadTemplateAssetMutation,
  useUpdateTemplateAssetMutation,
  useDeleteTemplateAssetMutation,
} from '../../../api/admin/templates';
import type { TemplateAdmin } from '../../../types/admin';
import type { UpdateTemplateInput, TemplateAssetAdmin } from '../../../types/admin';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';


const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  // slug is displayed but not submitted (UpdateTemplateInput has no slug)
  description: z.string().max(2000, 'Max 2000 characters').optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.string().optional(), // comma-separated input, will map to string[]
});

type FormValues = z.input<typeof schema>;

function toFormDefaults(t: TemplateAdmin | undefined): FormValues {
  return {
    name: t?.name ?? '',
    description: t?.description ?? '',
    visibility: (t?.visibility as 'public' | 'private') ?? 'public',
    status: (t?.status as 'draft' | 'published' | 'archived') ?? 'draft',
    tags: (t?.tags ?? []).join(','),
  };
}

export default function AdminTemplateEdit() {
  const navigate = useNavigate();
  const { slug = '' } = useParams<{ slug: string }>();

  // Queries and mutations
  const { data: template, isLoading, isError, error } = useAdminTemplateQuery(slug);
  const updateMut = useUpdateTemplateMutation(slug);
  const deleteMut = useDeleteTemplateMutation();
  const publishMut = usePublishTemplateMutation();
  const unpublishMut = useUnpublishTemplateMutation();

  // Assets
  const { data: assets = [], isLoading: isAssetsLoading } = useTemplateAssetsQuery(slug);
  const uploadAssetMut = useUploadTemplateAssetMutation();
  const updateAssetMut = useUpdateTemplateAssetMutation(slug);
  const deleteAssetMut = useDeleteTemplateAssetMutation(slug);

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormDefaults(template),
  });

  // When template loads/changes, reset defaults
  useEffect(() => {
    reset(toFormDefaults(template));
  }, [template, reset]);

  const apiError = useMemo(() => {
    const e = (updateMut.error as any) ?? (deleteMut.error as any) ?? (publishMut.error as any) ?? (unpublishMut.error as any);
    if (!e) return undefined;
    const msg =
      e?.response?.data?.error?.message ||
      e?.response?.data?.message ||
      e?.message ||
      'Request failed';
    const code = e?.response?.status ? ` (HTTP ${e.response.status})` : '';
    return `${msg}${code}`;
  }, [updateMut.error, deleteMut.error, publishMut.error, unpublishMut.error]);

  const onSubmit = async (values: FormValues) => {
    const payload: UpdateTemplateInput = {
      name: values.name,
      description: values.description || undefined,
      visibility: values.visibility,
      status: values.status,
      tags: (values.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    await updateMut.mutateAsync(payload);
  };

  async function handleDelete() {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    await deleteMut.mutateAsync(slug);
    navigate('/admin/templates');
  }

  async function handlePublish() {
    await publishMut.mutateAsync(slug);
  }

  async function handleUnpublish() {
    await unpublishMut.mutateAsync(slug);
  }

  // Assets upload
  const [uploadKind, setUploadKind] = useState<'thumbnail' | 'cover' | 'preview'>('preview');
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAssetMut.mutateAsync({ slug, kind: uploadKind, file });
    e.currentTarget.value = '';
  }

  // Promote to thumbnail
  async function promoteToThumbnail(assetId: string) {
    await updateAssetMut.mutateAsync({ id: assetId, payload: { kind: 'thumbnail' } });
  }

  async function deleteAsset(assetId: string) {
    await deleteAssetMut.mutateAsync(assetId);
  }

  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin • Templates • Edit</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/admin/templates')}>Back to List</button>
          <button onClick={handleDelete} disabled={deleteMut.isPending} style={{ color: 'crimson' }}>
            Delete
          </button>
        </div>
      </header>

      {isLoading ? (
        <div>Loading template…</div>
      ) : isError ? (
        <div style={{ color: 'crimson' }}>Failed to load template: {(error as any)?.message ?? 'Unknown error'}</div>
      ) : !template ? (
        <div>Template not found.</div>
      ) : (
        <>
          {apiError ? (
            <div style={{ color: 'crimson', border: '1px solid #f5c2c7', background: '#fde2e4', padding: 12, borderRadius: 8 }}>
              {apiError}
            </div>
          ) : null}

          <section style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
            <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
              <div>
                <label style={labelStyle}>Slug</label>
                <input value={template.slug} readOnly style={{ ...inputStyle, background: '#f9f9f9' }} />
                <div style={{ color: '#777', fontSize: 12, marginTop: 4 }}>Slug is immutable here.</div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input {...register('name')} placeholder="Template name" style={inputStyle} />
                  {errors.name ? <div style={errStyle}>{errors.name.message}</div> : null}
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea {...register('description')} placeholder="Optional description" rows={4} style={textAreaStyle} />
                  {errors.description ? <div style={errStyle}>{errors.description.message}</div> : null}
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 200 }}>
                    <label style={labelStyle}>Visibility</label>
                    <select {...register('visibility')} style={inputStyle}>
                      <option value="public">public</option>
                      <option value="private">private</option>
                    </select>
                    {errors.visibility ? <div style={errStyle}>{errors.visibility.message}</div> : null}
                  </div>

                  <div style={{ minWidth: 200 }}>
                    <label style={labelStyle}>Status</label>
                    <select {...register('status')} style={inputStyle}>
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                      <option value="archived">archived</option>
                    </select>
                    {errors.status ? <div style={errStyle}>{errors.status.message}</div> : null}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Tags</label>
                  <input {...register('tags')} placeholder="comma,separated,tags" style={inputStyle} />
                  {errors.tags ? <div style={errStyle}>{errors.tags.message}</div> : null}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={isSubmitting || updateMut.isPending}>
                    {updateMut.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
            <h2>Publish</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span>
                Status: <strong>{template.status}</strong>
              </span>
              <button
                onClick={handlePublish}
                disabled={publishMut.isPending || template.status === 'published' || !template.thumbnail_url}
                title={!template.thumbnail_url ? 'Add a thumbnail to enable Publish' : undefined}
              >
                Publish
              </button>
              <button
                onClick={handleUnpublish}
                disabled={unpublishMut.isPending || template.status !== 'published'}
              >
                Unpublish
              </button>
              <div style={{ color: '#777', fontSize: 12 }}>
                Note: Publish requires a valid thumbnail_url (backend guard 422).
              </div>
            </div>
          </section>

          <section style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, display: 'grid', gap: 12 }}>
            <h2>Assets</h2>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label>Upload kind:</label>
              <select value={uploadKind} onChange={(e) => setUploadKind(e.target.value as any)} style={inputStyle} disabled={uploadAssetMut.isPending || isAssetsLoading}>
                <option value="preview">preview</option>
                <option value="thumbnail">thumbnail</option>
                <option value="cover">cover</option>
              </select>
              <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} disabled={uploadAssetMut.isPending || isAssetsLoading} />
            </div>

            {isAssetsLoading ? (
              <div>Loading assets…</div>
            ) : assets.length === 0 ? (
              <div style={{ padding: 12, border: '1px dashed #ccc' }}>No assets yet. Upload to get started.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {assets.map((a: TemplateAssetAdmin) => (
                  <div key={a.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, display: 'grid', gap: 8 }}>
                    <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 6, background: '#f6f6f6' }}>
                      <img
                        src={a.url}
                        alt={`${a.kind}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div>
                        kind: <strong>{a.kind}</strong>
                      </div>
                      <div>sort: {a.sort_order}</div>
                      {a.kind === 'thumbnail' ? (
                        <span style={{ padding: '2px 6px', background: '#e6f4ff', border: '1px solid #b3ddff', borderRadius: 999, fontSize: 11 }}>
                          Current thumbnail
                        </span>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => promoteToThumbnail(a.id)} disabled={updateAssetMut.isPending || a.kind === 'thumbnail'}>
                        Make Thumbnail
                      </button>
                      <button onClick={() => deleteAsset(a.id)} disabled={deleteAssetMut.isPending} style={{ color: 'crimson' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: 6,
};
const textAreaStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: 6,
};
const errStyle: React.CSSProperties = { color: 'crimson', marginTop: 4 };
