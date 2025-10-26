export interface Meta {
  requestId?: string;
  timestamp?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface EnvelopeSuccess<T> {
  success: true;
  data: T;
  meta?: Meta;
}

export interface EnvelopeError {
  success: false;
  error: APIError;
  meta?: Meta;
}

export type Envelope<T> = EnvelopeSuccess<T> | EnvelopeError;

export function makeMeta(): Meta {
  return {
    requestId: Math.random().toString(16).slice(2, 10),
    timestamp: new Date().toISOString(),
  };
}

export function ok<T>(data: T): EnvelopeSuccess<T> {
  return { success: true, data, meta: makeMeta() };
}

export function err(code: string, message: string, details?: Record<string, any>): EnvelopeError {
  return { success: false, error: { code, message, details }, meta: makeMeta() };
}
