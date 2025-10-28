import { registerAs } from '@nestjs/config';

export default registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_API_KEY,
  baseUrl: process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com',
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image',
  timeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS || '45000', 10),
}));

