import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useAdminTemplatesQuery,
  useDeleteTemplateMutation,
  usePublishTemplateMutation,
  useUnpublishTemplateMutation,
} from '../../../api/admin/templates';
import type { TemplateAdmin } from '../../../types/admin';

function formatDate(dt?: string | null) {
  if (!dt) return '-';
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function AdminTemplatesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = Number(searchParams.get('offset') ?? 0);
  const q = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';
  const visibility = searchParams.get('visibility') ?? '';
  const sort = searchParams.get('sort') ?? 'updated';

  // Narrow query param types to expected unions
  const statusParam =
    status === 'draft' || status === 'published' || status === 'archived'
      ? (status as 'draft' | 'published' | 'archived')
      : undefined;

  const visibilityParam =
    visibility === 'public' || visibility === 'private'
      ? (visibility as 'public' | 'private')
      : undefined;

  const sortParam =
    sort === 'updated' || sort === 'newest' || sort === 'popular' || sort === 'name'
      ? (sort as 'updated' | 'newest' | 'popular' | 'name')
      : undefined;

  const params = useMemo(
    () => ({
      limit,
      offset,
      q: q || undefined,
      status: statusParam,
      visibility: visibilityParam,
      sort: sortParam,
    }),
    [limit, offset, q, statusParam, visibilityParam, sortParam]
  );

  const { data: templates, isLoading, isError, error } = useAdminTemplatesQuery(params);
  const delMut = useDeleteTemplateMutation();
  const pubMut = usePublishTemplateMutation();
  const unpubMut = useUnpublishTemplateMutation();

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'offset') next.set('offset', '0'); // reset paging when filters change
    setSearchParams(next);
  }

  function nextPage() {
    const next = new URLSearchParams(searchParams);
    next.set('offset', String(offset + limit));
    setSearchParams(next);
  }
  function prevPage() {
    const next = new URLSearchParams(searchParams);
    next.set('offset', String(Math.max(0, offset - limit)));
    setSearchParams(next);
  }

  async function handleDelete(slug: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    await delMut.mutateAsync(slug);
  }

  async function handlePublish(slug: string) {
    await pubMut.mutateAsync(slug);
  }
  async function handleUnpublish(slug: string) {
    await unpubMut.mutateAsync(slug);
  }

  return (
    <div className="bg-blue-500 text-white p-4 rounded" style={{ padding: 24, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin • Templates</h1>
        <button onClick={() => navigate('/admin/templates/new')}>New Template</button>
      </header>

      <section style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            aria-label="Search name or slug"
            placeholder="Search name or slug…"
            value={q}
            onChange={(e) => updateParam('q', e.target.value)}
          />
          <select aria-label="Status filter" value={status} onChange={(e) => updateParam('status', e.target.value)}>
            <option value="">Status: All</option>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
          <select aria-label="Visibility filter" value={visibility} onChange={(e) => updateParam('visibility', e.target.value)}>
            <option value="">Visibility: All</option>
            <option value="public">public</option>
            <option value="private">private</option>
          </select>
          <select aria-label="Sort templates" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            <option value="updated">sort: updated</option>
            <option value="newest">sort: newest</option>
            <option value="popular">sort: popular</option>
            <option value="name">sort: name</option>
          </select>
        </div>
      </section>

      {isLoading ? (
        <div>Loading…</div>
      ) : isError ? (
        <div style={{ color: 'crimson' }}>Error loading templates: {(error as any)?.message ?? 'Unknown error'}</div>
      ) : !templates || templates.length === 0 ? (
        <div style={{ padding: 24, border: '1px dashed #ccc', display: 'grid', gap: 8 }}>
          <p>No templates found.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSearchParams({})}>Reset filters</button>
            <button onClick={() => navigate('/admin/templates/new')}>Create your first template</button>
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Thumbnail</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Visibility</th>
                <th style={thStyle}>Published</th>
                <th style={thStyle}>Usage</th>
                <th style={thStyle}>Updated</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t: TemplateAdmin) => (
                <tr key={t.slug}>
                  <td style={tdStyle}>
                    {t.thumbnail_url ? (
                      <img
                        src={t.thumbnail_url}
                        alt={`${t.name} thumbnail`}
                        style={{ width: 56, height: 'auto', borderRadius: 4, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: 56, height: 40, borderRadius: 4, background: '#eee', display: 'grid', placeItems: 'center' }}>
                        —
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <strong>{t.name}</strong>
                  </td>
                  <td style={tdStyle}>
                    <code>{t.slug}</code>
                  </td>
                  <td style={tdStyle}>{t.status}</td>
                  <td style={tdStyle}>{t.visibility}</td>
                  <td style={tdStyle}>{formatDate(t.published_at)}</td>
                  <td style={tdStyle}>{t.usage_count ?? 0}</td>
                  <td style={tdStyle}>{formatDate(t.updated_at)}</td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <Link to={`/admin/templates/${encodeURIComponent(t.slug)}`}>Edit</Link>{' '}
                    <button
                      onClick={() => handlePublish(t.slug)}
                      disabled={pubMut.isPending || t.status === 'published' || !t.thumbnail_url}
                      title={!t.thumbnail_url ? 'Add a thumbnail to enable Publish' : undefined}
                    >
                      Publish
                    </button>{' '}
                    <button
                      onClick={() => handleUnpublish(t.slug)}
                      disabled={unpubMut.isPending || t.status !== 'published'}
                    >
                      Unpublish
                    </button>{' '}
                    <button onClick={() => handleDelete(t.slug)} disabled={delMut.isPending} style={{ color: 'crimson' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={prevPage} disabled={offset <= 0}>
          Prev
        </button>
        <span>
          offset {offset} • limit {limit}
        </span>
        <button onClick={nextPage}>Next</button>
      </footer>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  padding: '8px 6px',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '8px 6px',
};
