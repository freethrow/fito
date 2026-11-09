/**
 * Loads content once per build.
 * - Sections: from DatoCMS; a section that has no record there falls back to
 *   the design text in sections.ts.
 * - Articles: only from DatoCMS. No token or no articles → empty list, and the
 *   site shows nothing about articles.
 */
import { fetchFromDato, type Article } from './datocms';
import { DEFAULT_SECTIONS, SECTION_KEYS, type Section, type SectionKey } from './sections';

interface Content {
  sections: Record<SectionKey, Section>;
  articles: Article[];
  fromCms: boolean;
}

let cache: Promise<Content> | null = null;

export function getContent(): Promise<Content> {
  cache ??= load();
  return cache;
}

async function load(): Promise<Content> {
  const token = import.meta.env.DATOCMS_API_TOKEN || process.env.DATOCMS_API_TOKEN;
  if (!token) {
    return { sections: DEFAULT_SECTIONS, articles: [], fromCms: false };
  }

  const data = await fetchFromDato(token);
  const sections = { ...DEFAULT_SECTIONS };
  for (const raw of data.sections) {
    const key = raw.sectionKey as SectionKey;
    if (!SECTION_KEYS.includes(key)) continue;
    sections[key] = {
      key,
      kicker: raw.kicker ?? '',
      title: raw.title ?? '',
      subtitle: raw.subtitle ?? '',
      text: raw.text ?? '',
      items: (raw.items ?? []).map((i) => ({ title: i.title ?? '', text: i.text ?? '' })),
      note: raw.note ?? '',
      buttonLabel: raw.buttonLabel ?? '',
      buttonLink: raw.buttonLink ?? '',
      visible: raw.visible !== false,
    };
  }

  const articles = data.articles.filter((a) => a.slug && a.title);
  return { sections, articles, fromCms: true };
}
