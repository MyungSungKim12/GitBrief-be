export type EnvironmentConfig = {
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  SESSION_COOKIE_NAME: string;
  SESSION_TTL_SECONDS: number;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_CALLBACK_URL?: string;
  GEMINI_API_KEY?: string;
};

function positiveInteger(value: unknown, fallback: number, name: string) {
  const parsed = value === undefined || value === '' ? fallback : Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new Error('Expected a string value');
  return value;
}

function stringValue(value: unknown, fallback: string, name: string) {
  if (value === undefined || value === '') return fallback;
  if (typeof value !== 'string') throw new Error(`${name} must be a string`);
  return value;
}

export function validateEnvironment(
  raw: Record<string, unknown>,
): EnvironmentConfig {
  return {
    NODE_ENV: stringValue(raw.NODE_ENV, 'development', 'NODE_ENV'),
    PORT: positiveInteger(raw.PORT, 4000, 'PORT'),
    FRONTEND_URL: stringValue(
      raw.FRONTEND_URL,
      'http://localhost:3000',
      'FRONTEND_URL',
    ),
    SESSION_COOKIE_NAME: stringValue(
      raw.SESSION_COOKIE_NAME,
      'gitbrief_session',
      'SESSION_COOKIE_NAME',
    ),
    SESSION_TTL_SECONDS: positiveInteger(
      raw.SESSION_TTL_SECONDS,
      604800,
      'SESSION_TTL_SECONDS',
    ),
    SUPABASE_URL: optionalString(raw.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: optionalString(raw.SUPABASE_SERVICE_ROLE_KEY),
    GITHUB_CLIENT_ID: optionalString(raw.GITHUB_CLIENT_ID),
    GITHUB_CLIENT_SECRET: optionalString(raw.GITHUB_CLIENT_SECRET),
    GITHUB_CALLBACK_URL: optionalString(raw.GITHUB_CALLBACK_URL),
    GEMINI_API_KEY: optionalString(raw.GEMINI_API_KEY),
  };
}
