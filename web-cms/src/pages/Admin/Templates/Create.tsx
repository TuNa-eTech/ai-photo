import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTemplateMutation } from '../../../api/admin/templates';
import type { CreateTemplateInput } from '../../../types/admin';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const slugRegex = /^[a-z0-9-]+$/;

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(slugRegex, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(2000, 'Max 2000 characters').optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.string().optional(), // comma-separated input, will map to string[]
});

type FormValues = z.input<typeof schema>;

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

export default function AdminTemplateCreate() {
  const navigate = useNavigate();
  const createMut = useCreateTemplateMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      visibility: 'public',
      status: 'draft',
      tags: '',
    },
  });

  const name = watch('name');

  // Track if user explicitly edited slug
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setValue('slug', slugify(name || ''), { shouldValidate: true });
    }
  }, [name, slugTouched, setValue]);

  const onSubmit = async (values: FormValues) => {
    const payload: CreateTemplateInput = {
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      visibility: values.visibility,
      status: (values.status ?? 'draft'),
      tags: (values.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const created = await createMut.mutateAsync(payload);
    // Redirect to Edit page for assets/publish workflow
    navigate(`/admin/templates/${encodeURIComponent(created.slug)}`);
  };

  const apiError = useMemo(() => {
    const e = createMut.error as any;
    if (!e) return undefined;
    // Prefer envelope error message if available
    const msg =
      e?.response?.data?.error?.message ||
      e?.response?.data?.message ||
      e?.message ||
      'Request failed';
    const code = e?.response?.status ? ` (HTTP ${e.response.status})` : '';
    return `${msg}${code}`;
  }, [createMut.error]);

  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin • Templates • Create</h1>
        <button onClick={() => navigate('/admin/templates')}>Back to List</button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
        {apiError ? (
          <div style={{ color: 'crimson', border: '1px solid #f5c2c7', background: '#fde2e4', padding: 12, borderRadius: 8 }}>
            {apiError}
          </div>
        ) : null}

        <div>
          <label style={labelStyle}>Name</label>
          <input {...register('name')} placeholder="Template name" style={inputStyle} disabled={isSubmitting || createMut.isPending} />
          {errors.name ? <div style={errStyle}>{errors.name.message}</div> : null}
        </div>

        <div>
          <label style={labelStyle}>Slug</label>
          <input
            {...register('slug')}
            placeholder="kebab-case-slug"
            style={inputStyle}
            disabled={isSubmitting || createMut.isPending}
            onChange={(e) => {
              setSlugTouched(true);
              setValue('slug', e.target.value, { shouldValidate: true });
            }}
          />
          {errors.slug ? <div style={errStyle}>{errors.slug.message}</div> : null}
          <div style={{ color: '#777', fontSize: 12, marginTop: 4 }}>Auto-suggest from name; lowercase, numbers, hyphens only.</div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea {...register('description')} placeholder="Optional description" rows={4} style={textAreaStyle} disabled={isSubmitting || createMut.isPending} />
          {errors.description ? <div style={errStyle}>{errors.description.message}</div> : null}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <label style={labelStyle}>Visibility</label>
            <select {...register('visibility')} style={inputStyle} disabled={isSubmitting || createMut.isPending}>
              <option value="public">public</option>
              <option value="private">private</option>
            </select>
            {errors.visibility ? <div style={errStyle}>{errors.visibility.message}</div> : null}
          </div>

          <div style={{ minWidth: 200 }}>
            <label style={labelStyle}>Status</label>
            <select {...register('status')} style={inputStyle} disabled={isSubmitting || createMut.isPending}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
            {errors.status ? <div style={errStyle}>{errors.status.message}</div> : null}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tags</label>
          <input {...register('tags')} placeholder="comma,separated,tags" style={inputStyle} disabled={isSubmitting || createMut.isPending} />
          {errors.tags ? <div style={errStyle}>{errors.tags.message}</div> : null}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={isSubmitting || createMut.isPending}>
            {createMut.isPending ? 'Creating…' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/admin/templates')} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
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
