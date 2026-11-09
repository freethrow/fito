import { marked } from 'marked';
import type { CmsImage } from './datocms';

marked.setOptions({ gfm: true, breaks: false });

/** Markdown → HTML. Content comes from trusted editors in DatoCMS. */
export function md(text: string | null | undefined): string {
  if (!text) return '';
  return marked.parse(text, { async: false }) as string;
}

/** Inline markdown (bold, italic, links) without a wrapping <p>. */
export function mdInline(text: string | null | undefined): string {
  if (!text) return '';
  return marked.parseInline(text, { async: false }) as string;
}

/** DatoCMS images are served by imgix: resize and convert on the fly. */
export function imgUrl(image: CmsImage, width: number, height?: number): string {
  const u = new URL(image.url);
  u.searchParams.set('auto', 'format,compress');
  u.searchParams.set('w', String(width));
  if (height) {
    u.searchParams.set('h', String(height));
    u.searchParams.set('fit', 'crop');
  }
  return u.toString();
}

export function imgSrcSet(image: CmsImage, width: number, height?: number): string {
  return [1, 2].map((d) => `${imgUrl(image, width * d, height ? height * d : undefined)} ${d}x`).join(', ');
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('sr-Cyrl-RS', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Belgrade',
  }).format(new Date(iso));
}

/** Strip markdown/HTML for meta descriptions. */
export function plain(text: string, max = 160): string {
  const s = text.replace(/<[^>]+>/g, '').replace(/[#*_>`[\]()]/g, '').replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}
