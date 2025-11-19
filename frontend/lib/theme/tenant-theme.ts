'use client';

export interface TenantThemeConfig {
  backgroundGradient: string;
  accentGradient: string;
  accentFrom: string;
  accentTo: string;
  accentSoft: string;
  navBackground: string;
  navBorder: string;
  primaryText: string;
  secondaryText: string;
  cardBackground: string;
  badgeBackground: string;
  glowShadow: string;
}

export type TenantThemePresetKey =
  | 'aurora'
  | 'sunset'
  | 'lagoon'
  | 'blossom'
  | 'foliage';

interface TenantThemePreset {
  key: TenantThemePresetKey;
  label: string;
  description: string;
  preview: string[];
  config: TenantThemeConfig;
}

const PRESETS: Record<TenantThemePresetKey, TenantThemePreset> = {
  aurora: {
    key: 'aurora',
    label: 'Aurora Digital',
    description: 'Gradien ungu-biru futuristik yang elegan',
    preview: ['#6366f1', '#a855f7', '#ec4899'],
    config: {
    backgroundGradient: 'linear-gradient(120deg,#eef2ff 0%,#fdf4ff 45%,#fff7ed 100%)',
    accentGradient: 'linear-gradient(120deg,#6366f1 0%,#a855f7 50%,#ec4899 100%)',
    accentFrom: '#6366f1',
    accentTo: '#ec4899',
    accentSoft: 'rgba(99,102,241,0.15)',
    navBackground: 'rgba(255,255,255,0.85)',
    navBorder: 'rgba(148,163,184,0.35)',
    primaryText: '#0f172a',
    secondaryText: '#475569',
    cardBackground: 'rgba(255,255,255,0.9)',
    badgeBackground: 'rgba(99,102,241,0.15)',
    glowShadow: '0 25px 60px rgba(99,102,241,0.25)',
    },
  },
  sunset: {
    key: 'sunset',
    label: 'Sunset Tropis',
    description: 'Nuansa oranye-pink yang hangat dan ramah',
    preview: ['#f97316', '#fb7185', '#ec4899'],
    config: {
    backgroundGradient: 'linear-gradient(120deg,#ecfccb 0%,#fef3c7 50%,#fee2e2 100%)',
    accentGradient: 'linear-gradient(120deg,#f97316 0%,#fb7185 50%,#ec4899 100%)',
    accentFrom: '#f97316',
    accentTo: '#ec4899',
    accentSoft: 'rgba(249,115,22,0.15)',
    navBackground: 'rgba(255,247,237,0.85)',
    navBorder: 'rgba(251,146,60,0.25)',
    primaryText: '#1e1b4b',
    secondaryText: '#6b7280',
    cardBackground: 'rgba(255,255,255,0.95)',
    badgeBackground: 'rgba(251,191,36,0.18)',
    glowShadow: '0 25px 60px rgba(249,115,22,0.25)',
    },
  },
  lagoon: {
    key: 'lagoon',
    label: 'Lagoon Breeze',
    description: 'Perpaduan cyan-teal yang segar dan modern',
    preview: ['#0ea5e9', '#22d3ee', '#14b8a6'],
    config: {
    backgroundGradient: 'linear-gradient(120deg,#cffafe 0%,#e0f2fe 50%,#ede9fe 100%)',
    accentGradient: 'linear-gradient(120deg,#0ea5e9 0%,#22d3ee 50%,#14b8a6 100%)',
    accentFrom: '#0ea5e9',
    accentTo: '#14b8a6',
    accentSoft: 'rgba(14,165,233,0.18)',
    navBackground: 'rgba(236,253,245,0.8)',
    navBorder: 'rgba(45,212,191,0.25)',
    primaryText: '#0f172a',
    secondaryText: '#0f766e',
    cardBackground: 'rgba(255,255,255,0.95)',
    badgeBackground: 'rgba(16,185,129,0.18)',
    glowShadow: '0 25px 60px rgba(14,165,233,0.25)',
    },
  },
  blossom: {
    key: 'blossom',
    label: 'Cherry Blossom',
    description: 'Warna pink lembut yang romantis',
    preview: ['#db2777', '#f472b6', '#fda4af'],
    config: {
    backgroundGradient: 'linear-gradient(120deg,#fef2f2 0%,#fee2e2 45%,#fce7f3 100%)',
    accentGradient: 'linear-gradient(120deg,#be185d 0%,#db2777 50%,#f472b6 100%)',
    accentFrom: '#db2777',
    accentTo: '#f472b6',
    accentSoft: 'rgba(219,39,119,0.18)',
    navBackground: 'rgba(254,242,242,0.85)',
    navBorder: 'rgba(236,72,153,0.25)',
    primaryText: '#831843',
    secondaryText: '#be185d',
    cardBackground: 'rgba(255,255,255,0.92)',
    badgeBackground: 'rgba(244,114,182,0.18)',
    glowShadow: '0 25px 60px rgba(236,72,153,0.28)',
    },
  },
  foliage: {
    key: 'foliage',
    label: 'Emerald Foliage',
    description: 'Hijau-kuning natural yang optimis',
    preview: ['#10b981', '#34d399', '#fbbf24'],
    config: {
    backgroundGradient: 'linear-gradient(120deg,#ecfdf5 0%,#d1fae5 45%,#fef3c7 100%)',
    accentGradient: 'linear-gradient(120deg,#10b981 0%,#34d399 55%,#fbbf24 100%)',
    accentFrom: '#10b981',
    accentTo: '#fbbf24',
    accentSoft: 'rgba(16,185,129,0.18)',
    navBackground: 'rgba(240,253,244,0.85)',
    navBorder: 'rgba(52,211,153,0.25)',
    primaryText: '#064e3b',
    secondaryText: '#047857',
    cardBackground: 'rgba(255,255,255,0.92)',
    badgeBackground: 'rgba(52,211,153,0.18)',
    glowShadow: '0 25px 60px rgba(16,185,129,0.25)',
    },
  },
};

export const TENANT_THEME_PRESET_OPTIONS = Object.values(PRESETS).map((preset) => ({
  value: preset.key,
  label: preset.label,
  description: preset.description,
  preview: preset.preview,
}));

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getTenantTheme = (
  tenantId: string,
  presetKey?: TenantThemePresetKey | null
): TenantThemeConfig => {
  if (presetKey && PRESETS[presetKey]) {
    return PRESETS[presetKey].config;
  }
  const presetKeys = Object.keys(PRESETS) as TenantThemePresetKey[];
  if (!tenantId) {
    return PRESETS[presetKeys[0]].config;
  }
  const index = hashString(tenantId) % presetKeys.length;
  return PRESETS[presetKeys[index]].config;
};

export const resolveThemePresetFromSettings = (
  settings?: Record<string, any> | string | null
): TenantThemePresetKey | null => {
  if (!settings) return null;
  let parsed: Record<string, any> | null = null;
  if (typeof settings === 'string') {
    try {
      parsed = JSON.parse(settings);
    } catch (error) {
      parsed = null;
    }
  } else {
    parsed = settings;
  }
  const presetKey = parsed?.publicThemePreset;
  if (presetKey && presetKey in PRESETS) {
    return presetKey as TenantThemePresetKey;
  }
  return null;
};

