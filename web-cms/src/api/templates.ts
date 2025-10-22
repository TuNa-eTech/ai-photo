import api, { unwrap } from './client';
import type { GetTemplatesParams, TemplatesList, Template } from '../types/template';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

export async function getTemplates(params: GetTemplatesParams = {}): Promise<Template[]> {
  // Backend supports: limit, offset, q, tags (CSV), sort (newest|popular|name)
  const searchParams: Record<string, string | number> = {};
  if (typeof params.limit === 'number') searchParams.limit = params.limit;
  if (typeof params.offset === 'number') searchParams.offset = params.offset;
  if (params.q) searchParams.q = params.q;
  if (params.tags) searchParams.tags = params.tags;
  if (params.sort) searchParams.sort = params.sort;

  const promise = api.get('/v1/templates', { params: searchParams });
  const data = await unwrap<TemplatesList>(promise);
  return data.templates;
}

export function useTemplatesQuery(params: GetTemplatesParams = {}) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => getTemplates(params),
    placeholderData: keepPreviousData,
  });
}
