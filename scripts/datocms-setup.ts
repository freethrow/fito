/**
 * One-time DatoCMS setup (see DATOCMS.md, part 4A):
 *   1. creates the three models the website expects:
 *        - "Ставка секције"  (block, api key: section_item)
 *        - "Секција"         (api key: section)
 *        - "Чланак"          (api key: article)
 *   2. creates one "Секција" record for every home-page section, filled with
 *      the text from the original design, and publishes it.
 *      Articles are NOT created — you write those yourself.
 *
 * Usage:   npm run cms:setup                  (models + sections)
 *          npm run cms:setup -- --schema-only (models only)
 *
 * Needs DATOCMS_CMA_TOKEN (the Full-access API token) in .env or the
 * environment. Safe to run again: existing models and fields are kept and
 * only missing sections are created — so it also restores a deleted section.
 */
import { buildBlockRecord, buildClient, type ApiTypes, type Client } from '@datocms/cma-client-node';
import { DEFAULT_SECTIONS, SECTION_KEYS, SECTION_META } from '../src/lib/sections';

try {
  process.loadEnvFile('.env');
} catch {
  /* no .env file — use real environment variables */
}

const token = process.env.DATOCMS_CMA_TOKEN;
if (!token) {
  console.error(
    '\n✖ DATOCMS_CMA_TOKEN is missing.\n' +
      '  DatoCMS → Project settings → API tokens → "Full-access API token" → copy it,\n' +
      '  put it in .env as DATOCMS_CMA_TOKEN=... and run `npm run cms:setup` again.\n',
  );
  process.exit(1);
}

const client: Client = buildClient({
  apiToken: token,
  ...(process.env.DATOCMS_ENVIRONMENT ? { environment: process.env.DATOCMS_ENVIRONMENT } : {}),
});

/* ------------------------------------------------------------------ */
/* Field helpers                                                       */
/* ------------------------------------------------------------------ */

type FieldDef = ApiTypes.FieldCreateSchema & { api_key: string; label: string };
type Ids = Record<string, string>;

const MD_TOOLBAR = ['heading', 'bold', 'italic', 'unordered_list', 'ordered_list', 'quote', 'link', 'image', 'fullscreen'];

const f = {
  string: (label: string, api_key: string, o: { required?: boolean; heading?: boolean; hint?: string } = {}): FieldDef => ({
    label, api_key, field_type: 'string', hint: o.hint ?? null,
    validators: o.required ? { required: {} } : {},
    appearance: { editor: 'single_line', parameters: { heading: Boolean(o.heading) }, addons: [] },
  }),
  textarea: (label: string, api_key: string, hint?: string): FieldDef => ({
    label, api_key, field_type: 'text', hint: hint ?? null, validators: {},
    appearance: { editor: 'textarea', parameters: {}, addons: [] },
  }),
  markdown: (label: string, api_key: string, hint?: string, required = false): FieldDef => ({
    label, api_key, field_type: 'text', hint: hint ?? null, validators: required ? { required: {} } : {},
    appearance: { editor: 'markdown', parameters: { toolbar: MD_TOOLBAR }, addons: [] },
  }),
  select: (label: string, api_key: string, options: { value: string; label: string }[], hint?: string): FieldDef => ({
    label, api_key, field_type: 'string', hint: hint ?? null,
    validators: { required: {}, unique: {}, enum: { values: options.map((o) => o.value) } },
    appearance: { editor: 'string_select', parameters: { options: options.map((o) => ({ ...o, hint: '' })) }, addons: [] },
  }),
  blocks: (label: string, api_key: string, blockId: string, hint?: string): FieldDef => ({
    label, api_key, field_type: 'rich_text', hint: hint ?? null,
    validators: { rich_text_blocks: { item_types: [blockId] } },
    appearance: { editor: 'rich_text', parameters: { start_collapsed: false }, addons: [] },
  }),
  boolean: (label: string, api_key: string, hint?: string): FieldDef => ({
    label, api_key, field_type: 'boolean', hint: hint ?? null, validators: {}, default_value: true,
    appearance: { editor: 'boolean', parameters: {}, addons: [] },
  }),
  slug: (titleFieldId: string): FieldDef => ({
    label: 'Slug (адреса чланка)', api_key: 'slug', field_type: 'slug',
    hint: 'Део адресе: само мала латинична слова, бројеви и цртице, нпр. prolecno-ciscenje-jetre',
    validators: {
      required: {},
      unique: {},
      slug_format: { predefined_pattern: 'webpage_slug' },
      slug_title_field: { title_field_id: titleFieldId },
    },
    appearance: { editor: 'slug', parameters: { url_prefix: '/clanci/' }, addons: [] },
  }),
  date: (label: string, api_key: string): FieldDef => ({
    label, api_key, field_type: 'date', validators: { required: {} },
    appearance: { editor: 'date_picker', parameters: {}, addons: [] },
  }),
  image: (label: string, api_key: string, hint?: string): FieldDef => ({
    label, api_key, field_type: 'file', hint: hint ?? null,
    validators: { extension: { predefined_list: 'image' } },
    appearance: { editor: 'file', parameters: {}, addons: [] },
  }),
};

interface ModelDef {
  api_key: string;
  name: string;
  hint: string | null;
  block?: boolean;
  draft: boolean;
  titleField?: string;
  fields: (ids: Ids) => FieldDef[];
}

const MODELS: ModelDef[] = [
  {
    api_key: 'section_item',
    name: 'Ставка секције',
    hint: 'Картица, ставка листе или нумерисана тачка унутар секције',
    block: true,
    draft: false,
    fields: () => [
      f.string('Наслов', 'title', { required: true }),
      f.markdown('Текст', 'text', 'Није обавезно'),
    ],
  },
  {
    api_key: 'section',
    name: 'Секција',
    hint: 'Делови почетне стране. Сваку секцију одређује „Кључ секције“ — не мењајте га.',
    draft: true,
    titleField: 'title',
    fields: (ids) => [
      f.select(
        'Кључ секције', 'section_key',
        SECTION_KEYS.map((k) => ({ value: k, label: SECTION_META[k].label })),
        'Који део почетне стране попуњава овај запис. Свака секција може постојати само једном.',
      ),
      f.boolean('Прикажи на сајту', 'visible', 'Искључите да сакријете целу секцију (и њену ставку у менију)'),
      f.string('Наднаслов', 'kicker', { hint: 'Мали текст изнад наслова (користи само Хиро)' }),
      f.string('Наслов', 'title', { heading: true }),
      f.string('Поднаслов', 'subtitle', { hint: 'Курзивни ред или наслов листе — зависи од секције' }),
      f.markdown('Текст', 'text'),
      f.blocks('Ставке', 'items', ids.section_item, 'Картице, листе и нумерисане тачке. Редослед мењате превлачењем.'),
      f.markdown('Напомена', 'note', 'Текст испод ставки'),
      f.string('Текст дугмета', 'button_label'),
      f.string('Линк дугмета', 'button_link', { hint: 'Нпр. #kontakt (секција на страни) или https://…' }),
    ],
  },
  {
    api_key: 'article',
    name: 'Чланак',
    hint: 'Чланци на страници /clanci. Без објављених чланака страница се нигде не приказује.',
    draft: true,
    titleField: 'title',
    fields: () => [], // added below because the slug needs the title field's id
  },
];

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

async function ensureFields(modelId: string, model: string, defs: FieldDef[], existing: Map<string, string>) {
  for (const [i, def] of defs.entries()) {
    if (existing.has(def.api_key)) continue;
    const field = await client.fields.create(modelId, { ...def, position: i });
    existing.set(def.api_key, field.id);
    console.log(`  ✓ ${model}.${def.api_key}`);
  }
}

async function createSchema(): Promise<Ids> {
  const ids: Ids = {};
  const current = await client.itemTypes.list();

  for (const m of MODELS) {
    let model = current.find((it) => it.api_key === m.api_key);
    if (model) {
      console.log(`• model "${m.api_key}" already exists`);
    } else {
      model = await client.itemTypes.create({
        name: m.name,
        api_key: m.api_key,
        hint: m.hint,
        modular_block: Boolean(m.block),
        singleton: false,
        sortable: false,
        draft_mode_active: m.draft,
        collection_appearance: 'table',
      });
      console.log(`✓ created model "${m.api_key}" (${m.name})`);
    }
    ids[m.api_key] = model.id;
  }

  for (const m of MODELS) {
    const existing = new Map((await client.fields.list(ids[m.api_key])).map((fl) => [fl.api_key, fl.id]));

    if (m.api_key === 'article') {
      await ensureFields(ids.article, 'article', [f.string('Наслов', 'title', { required: true, heading: true })], existing);
      await ensureFields(ids.article, 'article', [
        f.string('Наслов', 'title', { required: true, heading: true }),
        f.slug(existing.get('title')!),
        f.date('Датум', 'date'),
        f.string('Аутор', 'author'),
        f.textarea('Увод', 'excerpt', 'Једна-две реченице; приказују се у листи чланака и испод наслова'),
        f.image('Насловна слика', 'cover', 'Није обавезно. Попуните и „Alternative text“ (опис слике).'),
        f.markdown('Текст', 'body', undefined, true),
      ], existing);
    } else {
      await ensureFields(ids[m.api_key], m.api_key, m.fields(ids), existing);
    }

    if (m.titleField) {
      await client.itemTypes.update(ids[m.api_key], {
        title_field: { type: 'field', id: existing.get(m.titleField)! },
      });
    }
  }
  return ids;
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const orNull = (v: string) => (v ? v : null);

async function importSections(ids: Ids) {
  const existing = await client.items.list({ filter: { type: 'section' }, page: { limit: 100 } });
  const have = new Set(existing.map((r) => String((r as Record<string, unknown>).section_key)));

  let created = 0;
  for (const key of SECTION_KEYS) {
    if (have.has(key)) {
      console.log(`• section "${key}" already exists — kept as it is`);
      continue;
    }
    const s = DEFAULT_SECTIONS[key];
    const item = await client.items.create({
      item_type: { type: 'item_type', id: ids.section },
      section_key: key,
      visible: true,
      kicker: orNull(s.kicker),
      title: orNull(s.title),
      subtitle: orNull(s.subtitle),
      text: orNull(s.text),
      items: s.items.map((i) =>
        buildBlockRecord({ item_type: { type: 'item_type', id: ids.section_item }, title: i.title, text: orNull(i.text) }),
      ),
      note: orNull(s.note),
      button_label: orNull(s.buttonLabel),
      button_link: orNull(s.buttonLink),
    });
    await client.items.publish(item.id);
    created++;
    console.log(`✓ section "${key}" created and published`);
  }
  console.log(`\n${created} section(s) created, ${SECTION_KEYS.length - created} already existed.`);
}

/* ------------------------------------------------------------------ */

console.log('\n→ Creating models and fields…');
const ids = await createSchema();

if (process.argv.includes('--schema-only')) {
  console.log('\n(--schema-only: sections not created)');
} else {
  console.log('\n→ Creating home-page sections…');
  await importSections(ids);
}
console.log('\n✔ Done. Open DatoCMS → Content → Секција.\n');
