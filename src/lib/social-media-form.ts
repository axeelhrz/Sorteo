import type { SocialMedia } from '@/types/shop';

export function normalizeSocialMediaForForm(raw: unknown): SocialMedia {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t ? { other: t } : {};
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...(raw as SocialMedia) };
  }
  return {};
}

export function compactSocialMedia(m: SocialMedia | undefined): SocialMedia {
  const o: SocialMedia = {};
  const keys: (keyof SocialMedia)[] = [
    'facebook',
    'instagram',
    'twitter',
    'tiktok',
    'whatsapp',
    'website',
    'other',
  ];
  for (const k of keys) {
    const v = m?.[k];
    if (v != null && String(v).trim()) {
      o[k] = String(v).trim();
    }
  }
  return o;
}
