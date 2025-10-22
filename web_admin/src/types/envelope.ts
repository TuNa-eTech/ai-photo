export type Meta = {
  requestId?: string;
  timestamp?: string; // ISO-8601
  // Future pagination metadata (optional)
  total?: number;
  hasMore?: boolean;
  nextOffset?: number;
};

export type APIError = {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
};

export type Envelope<T> = {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: Meta;
};
