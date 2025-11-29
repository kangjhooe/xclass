const DEFAULT_FRONTEND_URL = 'http://localhost:3001';

const ensureProtocol = (value: string): string => {
  if (!value) {
    return value;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `http://${value}`;
};

export const normalizeOrigin = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  try {
    return new URL(ensureProtocol(value.trim())).origin;
  } catch {
    // Fallback: strip trailing slashes and return as-is
    return value.trim().replace(/\/+$/, '') || null;
  }
};

export interface FrontendUrlConfig {
  primaryUrl: string;
  primaryOrigin: string;
  urls: string[];
  origins: string[];
}

export const parseFrontendUrls = (raw?: string | null): FrontendUrlConfig => {
  const fallbackOrigin = normalizeOrigin(DEFAULT_FRONTEND_URL) as string;
  const baseConfig: FrontendUrlConfig = {
    primaryUrl: DEFAULT_FRONTEND_URL,
    primaryOrigin: fallbackOrigin,
    urls: [DEFAULT_FRONTEND_URL],
    origins: [fallbackOrigin],
  };

  if (!raw || !raw.trim()) {
    return baseConfig;
  }

  const candidates = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const uniqueUrls = Array.from(new Set(candidates));

  if (uniqueUrls.length === 0) {
    return baseConfig;
  }

  const uniqueOrigins = Array.from(
    new Set(
      uniqueUrls
        .map((value) => normalizeOrigin(value))
        .filter((value): value is string => Boolean(value)),
    ),
  );

  return {
    primaryUrl: uniqueUrls[0],
    primaryOrigin: uniqueOrigins[0] || baseConfig.primaryOrigin,
    urls: uniqueUrls,
    origins: uniqueOrigins.length ? uniqueOrigins : baseConfig.origins,
  };
};

export const FRONTEND_DEFAULT_URL = DEFAULT_FRONTEND_URL;

