/**
 * Reads the published sections and articles from DatoCMS (Content Delivery
 * API, GraphQL) in one request at build time. Field names match the models
 * created by scripts/datocms-setup.ts and described in DATOCMS.md.
 */
import { executeQuery } from '@datocms/cda-client';

export interface CmsImage {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface RawSection {
  sectionKey: string;
  kicker: string | null;
  title: string | null;
  subtitle: string | null;
  text: string | null;
  items: { title: string | null; text: string | null }[];
  note: string | null;
  buttonLabel: string | null;
  buttonLink: string | null;
  visible: boolean | null;
}

export interface Article {
  title: string;
  slug: string;
  /** YYYY-MM-DD */
  date: string;
  author: string | null;
  excerpt: string | null;
  cover: CmsImage | null;
  /** markdown */
  body: string | null;
}

const QUERY = /* GraphQL */ `
  query Site {
    sections: allSections(first: 100) {
      sectionKey kicker title subtitle text
      items { ... on SectionItemRecord { title text } }
      note buttonLabel buttonLink visible
    }
    articles: allArticles(first: 500, orderBy: date_DESC) {
      title slug date author excerpt body
      cover { url alt width height }
    }
  }
`;

export async function fetchFromDato(token: string) {
  const environment = import.meta.env.DATOCMS_ENVIRONMENT || process.env.DATOCMS_ENVIRONMENT;
  const drafts = (import.meta.env.DATOCMS_INCLUDE_DRAFTS || process.env.DATOCMS_INCLUDE_DRAFTS) === 'true';

  return executeQuery<{ sections: RawSection[]; articles: Article[] }>(QUERY, {
    token,
    includeDrafts: drafts,
    ...(environment ? { environment } : {}),
  });
}
