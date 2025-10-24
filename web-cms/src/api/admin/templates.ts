import api, { unwrap } from '../client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AdminTemplatesParams,
  AdminTemplatesList,
  CreateTemplateInput,
  TemplateAdmin,
  UpdateTemplateInput,
  TemplateAssetAdmin,
} from '../../types/admin';
import type { Envelope, APIError } from '../../types/envelope';

const base = '/v1/admin/templates';

export async function listAdminTemplates(params: AdminTemplatesParams = {}): Promise<TemplateAdmin[]> {
  const searchParams: Record<string, string | number> = {};
  if (typeof params.limit === 'number') searchParams.limit = params.limit;
  if (typeof params.offset === 'number') searchParams.offset = params.offset;
  if (params.q) searchParams.q = params.q;
  if (params.tags) searchParams.tags = params.tags;
  if (params.status) searchParams.status = params.status;
  if (params.visibility) searchParams.visibility = params.visibility;
  if (params.sort) searchParams.sort = params.sort;

  const promise = api.get(base, { params: searchParams });
  const data = await unwrap<AdminTemplatesList>(promise);
  return data.templates;
}

export async function getAdminTemplate(slug: string): Promise<TemplateAdmin> {
  const promise = api.get(`${base}/${encodeURIComponent(slug)}`);
  const data = await unwrap<TemplateAdmin>(promise);
  return data;
}

export async function createAdminTemplate(input: CreateTemplateInput): Promise<TemplateAdmin> {
  const promise = api.post(base, input);
  const data = await unwrap<TemplateAdmin>(promise);
  return data;
}

export async function updateAdminTemplate(slug: string, input: UpdateTemplateInput): Promise<TemplateAdmin> {
  const promise = api.put(`${base}/${encodeURIComponent(slug)}`, input);
  const data = await unwrap<TemplateAdmin>(promise);
  return data;
}

export async function deleteAdminTemplate(slug: string): Promise<void> {
  const res = await api.delete(`${base}/${encodeURIComponent(slug)}`);
  const env = res.data as Envelope<unknown>;
  if (!env.success) {
    const err = env.error as APIError | undefined;
    const e: any = new Error(err?.message ?? 'API error');
    e.code = err?.code;
    e.meta = env.meta;
    throw e;
  }
}

export async function publishTemplate(slug: string): Promise<TemplateAdmin> {
  const promise = api.post(`${base}/${encodeURIComponent(slug)}/publish`, {});
  const data = await unwrap<TemplateAdmin>(promise);
  return data;
}

export async function unpublishTemplate(slug: string): Promise<TemplateAdmin> {
  const promise = api.post(`${base}/${encodeURIComponent(slug)}/unpublish`, {});
  const data = await unwrap<TemplateAdmin>(promise);
  return data;
}

// React Query hooks

export function useAdminTemplatesQuery(params: AdminTemplatesParams = {}) {
  return useQuery({
    queryKey: ['admin-templates', params],
    queryFn: () => listAdminTemplates(params),
  });
}

export function useAdminTemplateQuery(slug: string) {
  return useQuery({
    queryKey: ['admin-template', slug],
    queryFn: () => getAdminTemplate(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTemplateInput) => createAdminTemplate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
    },
  });
}

export function useUpdateTemplateMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTemplateInput) => updateAdminTemplate(slug, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
      qc.invalidateQueries({ queryKey: ['admin-template', slug] });
    },
  });
}

export function useDeleteTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => deleteAdminTemplate(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
    },
  });
}

export function usePublishTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => publishTemplate(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
    },
  });
}

export function useUnpublishTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => unpublishTemplate(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
    },
  });
}

// Assets API

export async function listTemplateAssets(slug: string): Promise<TemplateAssetAdmin[]> {
  const promise = api.get(`${base}/${encodeURIComponent(slug)}/assets`);
  const data = await unwrap<TemplateAssetAdmin[]>(promise);
  return data;
}

export async function uploadTemplateAsset(slug: string, kind: 'thumbnail' | 'cover' | 'preview', file: File): Promise<TemplateAssetAdmin> {
  const fd = new FormData();
  fd.append('kind', kind);
  fd.append('file', file);
  // Do NOT set Content-Type header manually; let browser set multipart boundary
  const promise = api.post(`${base}/${encodeURIComponent(slug)}/assets`, fd);
  const data = await unwrap<TemplateAssetAdmin>(promise);
  return data;
}

export async function updateTemplateAsset(slug: string, id: string, payload: Partial<Pick<TemplateAssetAdmin, 'kind' | 'sort_order'>>): Promise<TemplateAssetAdmin> {
  const promise = api.put(`${base}/${encodeURIComponent(slug)}/assets/${encodeURIComponent(id)}`, payload);
  const data = await unwrap<TemplateAssetAdmin>(promise);
  return data;
}

export async function deleteTemplateAsset(slug: string, id: string): Promise<void> {
  const res = await api.delete(`${base}/${encodeURIComponent(slug)}/assets/${encodeURIComponent(id)}`);
  const env = res.data as Envelope<unknown>;
  if (!env.success) {
    const err = env.error as APIError | undefined;
    const e: any = new Error(err?.message ?? 'API error');
    e.code = err?.code;
    e.meta = env.meta;
    throw e;
  }
}

// React Query hooks for assets

export function useTemplateAssetsQuery(slug: string) {
  return useQuery({
    queryKey: ['admin-template-assets', slug],
    queryFn: () => listTemplateAssets(slug),
    enabled: Boolean(slug),
  });
}

export function useUploadTemplateAssetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, kind, file }: { slug: string; kind: 'thumbnail' | 'cover' | 'preview'; file: File }) =>
      uploadTemplateAsset(slug, kind, file),
    onSuccess: (_data, variables) => {
      const s = variables.slug;
      qc.invalidateQueries({ queryKey: ['admin-template-assets', s] });
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
      qc.invalidateQueries({ queryKey: ['admin-template', s] });
    },
  });
}

export function useUpdateTemplateAssetMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Pick<TemplateAssetAdmin, 'kind' | 'sort_order'>> }) =>
      updateTemplateAsset(slug, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-template-assets', slug] });
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
      qc.invalidateQueries({ queryKey: ['admin-template', slug] });
    },
  });
}

export function useDeleteTemplateAssetMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTemplateAsset(slug, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-template-assets', slug] });
      qc.invalidateQueries({ queryKey: ['admin-templates'] });
      qc.invalidateQueries({ queryKey: ['admin-template', slug] });
    },
  });
}
