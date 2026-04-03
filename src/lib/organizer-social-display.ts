import type { SocialMedia } from '@/types/shop';

export type OrganizerSocialDisplayItem =
  | { kind: 'link'; key: string; label: string; href: string }
  | { kind: 'text'; key: string; content: string };

const LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  website: 'Sitio web',
  other: 'Más redes',
};

/** Línea generada por CreateRaffleForm en specialConditions */
export function extractSocialLineFromSpecialConditions(specialConditions: string | undefined): string | null {
  if (!specialConditions?.trim()) return null;
  for (const line of specialConditions.split('\n')) {
    const m = line.match(/^\s*Redes sociales:\s*(.+)\s*$/i);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return null;
}

const LINK_KEYS = new Set(['facebook', 'instagram', 'twitter', 'tiktok', 'whatsapp', 'website']);

function hrefForStructuredKey(key: string, value: string): string {
  const v = String(value).trim();
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  switch (key) {
    case 'instagram':
      return `https://instagram.com/${v.replace(/^@/, '')}`;
    case 'facebook':
      return `https://facebook.com/${v.replace(/^@/, '')}`;
    case 'whatsapp':
      return `https://wa.me/${v.replace(/\D/g, '')}`;
    case 'tiktok':
      return `https://tiktok.com/@${v.replace(/^@/, '')}`;
    case 'twitter':
      return `https://twitter.com/${v.replace(/^@/, '')}`;
    case 'website':
      return `https://${v.replace(/^\/+/, '')}`;
    default:
      return v;
  }
}

function itemsFromSocialObject(obj: Record<string, unknown>): OrganizerSocialDisplayItem[] {
  const out: OrganizerSocialDisplayItem[] = [];
  for (const [key, raw] of Object.entries(obj)) {
    if (raw == null) continue;
    const value = String(raw).trim();
    if (!value) continue;
    if (key === 'other') {
      out.push({ kind: 'text', key, content: value });
      continue;
    }
    if (LINK_KEYS.has(key)) {
      const href = hrefForStructuredKey(key, value);
      if (href.startsWith('http://') || href.startsWith('https://')) {
        out.push({ kind: 'link', key, label: LABELS[key] || key, href });
      } else {
        out.push({ kind: 'text', key, content: value });
      }
      continue;
    }
    out.push({ kind: 'text', key, content: `${key}: ${value}` });
  }
  return out;
}

/**
 * Normaliza shop.socialMedia (objeto, string legacy) y opcionalmente el texto de specialConditions.
 */
export function getOrganizerSocialDisplayItems(
  socialMedia: SocialMedia | string | Record<string, unknown> | null | undefined,
  specialConditions?: string | null
): OrganizerSocialDisplayItem[] {
  const sm = socialMedia as unknown;

  if (typeof sm === 'string' && sm.trim()) {
    return [{ kind: 'text', key: 'legacy', content: sm.trim() }];
  }

  if (sm && typeof sm === 'object' && !Array.isArray(sm)) {
    const fromObj = itemsFromSocialObject(sm as Record<string, unknown>);
    if (fromObj.length > 0) return fromObj;
  }

  const fromConditions = extractSocialLineFromSpecialConditions(specialConditions ?? undefined);
  if (fromConditions) {
    return [{ kind: 'text', key: 'conditions', content: fromConditions }];
  }

  return [];
}
