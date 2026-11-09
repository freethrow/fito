# DatoCMS guide — Друштво за фитотерапију Србије

This guide explains everything you do in DatoCMS for this website, step by step:
creating the project, building the content structure (automatically or by hand),
editing every section of the home page, writing articles, images, publishing,
and fixing common problems.

Deploying the website itself is covered in **[NETLIFY.md](NETLIFY.md)**.

---

## Contents

0. [How the website and DatoCMS fit together](#0-how-the-website-and-datocms-fit-together)
1. [Create the account and the project](#1-create-the-account-and-the-project)
2. [A quick tour of the DatoCMS screen](#2-a-quick-tour-of-the-datocms-screen)
3. [API tokens (the keys the website uses)](#3-api-tokens-the-keys-the-website-uses)
4. [Create the content structure](#4-create-the-content-structure)
   - [4A. Automatically (recommended)](#4a-automatically-recommended)
   - [4B. By hand, field by field](#4b-by-hand-field-by-field)
   - [4C. Check that everything is right](#4c-check-that-everything-is-right)
5. [The 13 home-page sections — what each field shows](#5-the-13-home-page-sections--what-each-field-shows)
6. [Editing a section, step by step](#6-editing-a-section-step-by-step)
7. [Writing articles](#7-writing-articles)
8. [Images and the Media area](#8-images-and-the-media-area)
9. [When do changes appear on the website?](#9-when-do-changes-appear-on-the-website)
10. [Inviting other editors](#10-inviting-other-editors)
11. [History and undo](#11-history-and-undo)
12. [Formatting text (Markdown cheat sheet)](#12-formatting-text-markdown-cheat-sheet)
13. [Troubleshooting](#13-troubleshooting)
14. [Free-plan limits](#14-free-plan-limits)
15. [Reference for developers](#15-reference-for-developers)

---

## 0. How the website and DatoCMS fit together

```
   You (editor)                         Website visitors
        │                                      ▲
        ▼                                      │
   ┌──────────┐   1. Publish    ┌──────────┐   │   static pages
   │ DatoCMS  │ ──────────────► │ Netlify  │ ──┘
   │ content  │   2. Netlify    │ builds   │
   └──────────┘   reads all     │ the site │
                  published     └──────────┘
                  content
```

- DatoCMS stores the **text** of the home page and the **articles**.
- The website is rebuilt from DatoCMS each time something is published
  (about 1 minute). Only **published** content appears. Drafts never do.
- The site uses three DatoCMS "models" (content types):

| Model (as shown in DatoCMS) | What it is | How many records |
|---|---|---|
| **Секција** | One part of the home page (hero, О нама, Митологија…) | exactly **13**, one per section |
| **Ставка секције** | A *block* inside a section: one card, list item or numbered point | as many as you need |
| **Чланак** | One article on the **Чланци** page (`/clanci`) | as many as you write |

**What stays in the code (not in DatoCMS):** the design (colours, fonts,
layout), the order of the sections, the logo, the hero video, and the menu
labels. Changing those needs a developer.

**Two simple rules the site follows:**

1. **Sections:** if a section exists in DatoCMS, the site shows exactly what is
   there; an empty field is simply not shown. If a section does *not* exist
   in DatoCMS at all, the site shows the original design text for it.
2. **Articles:** if there are published articles, the site shows them: the
   menu item **Блог** opens the **Чланци** page, and the Блог section on the
   home page shows the three latest. If there are **no** published articles,
   nothing about articles appears anywhere.

---

## 1. Create the account and the project

1. Go to <https://www.datocms.com> → **Sign up** (or **Try it free**). You can
   sign up with Google, GitHub or an e-mail address. Confirm your e-mail if asked.
2. After logging in you are in the **dashboard** (<https://dashboard.datocms.com>),
   the list of your projects.
3. Click **New project**.
4. Choose **Blank project** (not a template, because the site needs its own structure).
5. Name it, for example `Fitoterapija Srbije`. Leave the other options as they
   are and confirm. The Free plan is enough.
6. Wait a few seconds and then click the project to open it. The project has
   its own address, for example `https://fitoterapija-srbije.admin.datocms.com`.
   **Bookmark it**: this is where editors log in every day.

> **Language of the project.** DatoCMS shows its own menus in English. The
> labels of *our* fields are in Serbian Cyrillic (Наслов, Текст…). The project
> locale (Project settings → Locales) can stay at the default. The site does
> not use translations.

---

## 2. A quick tour of the DatoCMS screen

At the top of the project you see the main areas:

| Area | What you do there |
|---|---|
| **Content** | Edit records, meaning the 13 sections and the articles. Editors work only here. |
| **Media** | All uploaded images. Upload, search, add descriptions. |
| **Schema** | The structure: models, fields, blocks. You only need it once (step 4). In some accounts this is under **Project settings → Models**. |
| **Project settings** | API tokens, collaborators, build triggers, webhooks. Only for the administrator. |

Inside **Content**, the left sidebar lists the models: **Секција** and **Чланак**.
Click one to see its records in a table. Click a record to open its form.

Each record shows its **status** at the top right:

| Status | Meaning | On the website? |
|---|---|---|
| **Draft** | never published | no |
| **Published** | the website shows this version | yes |
| **Updated** | published, but you have unpublished changes since | the *old* version until you publish again |

Buttons at the top right of a record:

- **Save** stores your changes as a draft. The website does not change.
- **Publish** makes the current version public and starts a website rebuild (step 9).
- The **⋯** / arrow menu next to Publish offers **Unpublish** (remove from the
  website without deleting), **Duplicate** and **Delete**.

---

## 3. API tokens (the keys the website uses)

A token is a password for programs. You need **two** tokens:

| Token | Used by | Where it goes | Can do |
|---|---|---|---|
| **Read-only** | the website, at every build | Netlify environment variable `DATOCMS_API_TOKEN`, and your local `.env` | read published content only |
| **Full-access** | the setup script, once | your local `.env` as `DATOCMS_CMA_TOKEN` | create models and records. **Keep it secret.** |

### 3.1 Copy the read-only token

1. **Project settings → API tokens**.
2. A new project already contains a token called **Read-only API token**. Click it.
3. Click the eye/copy icon to reveal the token and copy it. It is a long string.
4. Save it somewhere safe for now (a password manager is ideal).

### 3.2 Create a full-access token

New projects (since May 2025) no longer come with a full-access token, so you
create one:

1. **Project settings → API tokens** → the button to add a new token
   (**+ New API token** / **Add new**).
2. **Name:** `Setup script (full access)`.
3. **Role:** **Admin**.
4. **API access:** tick **Content Management API**. You can also tick **Content
   Delivery API**, but it isn't needed.
5. **Save** and copy the token.

> After the setup in step 4 is done, you can **delete** this token (open it →
> Delete). If you need it again, create a new one. Never put it in Netlify,
> GitHub, an e-mail or a chat.

---

## 4. Create the content structure

The site expects exactly the models and fields below. You can create them
**automatically** in one minute (4A) or **by hand** (4B). The automatic way also
fills all 13 sections with the current text of the design, so the site looks
the same as before from the first build.

### 4A. Automatically (recommended)

You need Node.js 22.23+ on your computer and the project files (see NETLIFY.md, part 1).

1. In the project folder, create the settings file:

   ```bash
   cp .env.example .env
   ```

   (On Windows: copy `.env.example` and rename the copy to `.env`.)

2. Open `.env` in a text editor and paste both tokens from step 3:

   ```dotenv
   DATOCMS_API_TOKEN=paste-the-read-only-token-here
   DATOCMS_CMA_TOKEN=paste-the-full-access-token-here
   ```

3. Install and run the setup:

   ```bash
   npm install
   npm run cms:setup
   ```

4. You should see output like this:

   ```
   → Creating models and fields…
   ✓ created model "section_item" (Ставка секције)
   ✓ created model "section" (Секција)
   ✓ created model "article" (Чланак)
     ✓ section_item.title
     …
   → Creating home-page sections…
   ✓ section "hero" created and published
   …
   13 section(s) created, 0 already existed.
   ✔ Done.
   ```

5. In DatoCMS open **Content → Секција**. You will see 13 records, all **Published**.

Good to know:

- Running `npm run cms:setup` again is **safe**. It never overwrites or
  duplicates anything. It only adds what is missing. So if someone deletes a
  section by mistake, run it again and that section comes back with the
  original design text.
- `npm run cms:setup -- --schema-only` creates only the models, with no
  sections. Use this if you want to type all the content yourself.
- The script does **not** create articles. You write those (step 7).

Now continue with **4C** to check the result.

### 4B. By hand, field by field

Use this only if you can't run the script. It takes about 30–40 minutes.
Names (labels) can be anything, but the **API keys must be exactly as written**,
because the website looks for them.

General procedure for every field:
**Schema → (model) → Add new field → choose the field type → fill Name (label)
→ check the API key (Field ID) → set options on the Validations and
Presentation tabs → Save field.** DatoCMS proposes an API key from the name.
**Overwrite it** with the one in the tables below.

#### Step 1 — the block "Ставка секције"

1. **Schema → Blocks library → New block** (or **+**).
2. Name: `Ставка секције`. API key: **`section_item`**. Save.
3. Add these fields:

| # | Name (label) | Field type | API key | Validations | Presentation |
|---|---|---|---|---|---|
| 1 | Наслов | Single-line string | `title` | **Required** | – |
| 2 | Текст | Multiple-paragraph text | `text` | – | Editor: **Markdown** |

#### Step 2 — the model "Секција"

1. **Schema → Models → New model** (or **+**).
2. Name: `Секција`. API key: **`section`**.
3. Options: leave **draft/published** *enabled*. **Not** a single-instance
   (singleton) model. **Not** sortable. Save.
4. Add these fields **in this order**:

| # | Name (label) | Field type | API key | Validations | Presentation / notes |
|---|---|---|---|---|---|
| 1 | Кључ секције | Single-line string | `section_key` | **Required**, **Unique**, **Accept only specified values**: the 13 keys from the table below | Presentation: **Select input**, and add the same 13 values as options |
| 2 | Прикажи на сајту | Boolean | `visible` | – | Default value: **true** (checked) |
| 3 | Наднаслов | Single-line string | `kicker` | – | – |
| 4 | Наслов | Single-line string | `title` | – | Tick **"This field represents the title of the record"** / *Use as title* |
| 5 | Поднаслов | Single-line string | `subtitle` | – | – |
| 6 | Текст | Multiple-paragraph text | `text` | – | Editor: **Markdown** |
| 7 | Ставке | Modular content (multiple blocks) | `items` | Allowed blocks: **only "Ставка секције"** | – |
| 8 | Напомена | Multiple-paragraph text | `note` | – | Editor: **Markdown** |
| 9 | Текст дугмета | Single-line string | `button_label` | – | – |
| 10 | Линк дугмета | Single-line string | `button_link` | – | – |

The 13 values for **Кључ секције** (type them exactly, lowercase Latin):

```
hero
o-nama
citat
zasto-vazna
zasto-udruzenje
bilje
mitologija
energetski-kodovi
edukacije
blog
apoteka
clanstvo
kontakt
```

#### Step 3 — the model "Чланак"

1. **Schema → Models → New model**. Name: `Чланак`. API key: **`article`**.
   Draft/published enabled. Save.
2. Fields:

| # | Name (label) | Field type | API key | Validations | Presentation / notes |
|---|---|---|---|---|---|
| 1 | Наслов | Single-line string | `title` | **Required** | Use as record title |
| 2 | Slug (адреса чланка) | Slug | `slug` | **Required**, **Unique**. Reference (title) field: **Наслов** | URL prefix: `/clanci/` |
| 3 | Датум | Date | `date` | **Required** | – |
| 4 | Аутор | Single-line string | `author` | – | – |
| 5 | Увод | Multiple-paragraph text | `excerpt` | – | Editor: **Simple textarea** |
| 6 | Насловна слика | Single asset | `cover` | Accept only **images** | – |
| 7 | Текст | Multiple-paragraph text | `body` | **Required** | Editor: **Markdown** |

#### Step 4 — create the 13 sections

**Content → Секција → + New record**, 13 times. Choose a different
**Кључ секције** each time, fill in the fields as described in part 5, then
**Save** and **Publish**. (Or run `npm run cms:setup` later. It fills only
the sections that are still missing.)

### 4C. Check that everything is right

Tick these off:

- [ ] **Schema** shows the models **Секција** (`section`) and **Чланак** (`article`)
      and the block **Ставка секције** (`section_item`).
- [ ] **Content → Секција** has **13** records and all are **Published**.
- [ ] Opening any section shows the dropdown **Кључ секције** with a value.
- [ ] In the "Ставке" area of a section you can see cards and add a new one.
- [ ] On your computer, `npm run dev` (with `DATOCMS_API_TOKEN` in `.env`)
      shows the site at <http://localhost:4321>. Change the hero title in
      DatoCMS, **Publish**, stop the dev server (Ctrl+C) and start it again.
      The new title appears.

---

## 5. The 13 home-page sections — what each field shows

Every section has the same fields, but each one uses only some of them.
Fields marked **–** are ignored for that section, so you can leave them empty.

| Key (Кључ секције) | Where on the page | Наднаслов | Наслов | Поднаслов | Текст | Ставке | Напомена | Дугме |
|---|---|---|---|---|---|---|---|---|
| `hero` | top, with video and logo | small gold text above the title | big title | green italic line | paragraph under the title | – | – | green button (e.g. "Придружи нам се" → `#clanstvo`) |
| `o-nama` | О нама / Мисија и визија | – | heading | bold line above the list ("Удружење ће се залагати за:") | the paragraphs | list with gold dots (only **Наслов** of each item is needed) | small text under the list | – |
| `citat` | big quote | – | **the quote itself** (italic) | – | text under the quote | – | – | – |
| `zasto-vazna` | Зашто је фитотерапија важна | – | heading | italic line under heading | intro | numbered points: **Наслов** = point title, **Текст** = explanation (numbers 1., 2.… are automatic) | – | – |
| `zasto-udruzenje` | Зашто баш удружење… | – | heading | green italic line | intro | numbered points; **Текст** may contain a bullet list | – | – |
| `bilje` | Фитотерапија / Лековите биљке | – | heading | – | optional intro | white cards (**Наслов** bold; optional **Текст**) | text under the cards | – |
| `mitologija` | Митологија и симболика | – | heading | – | intro line | cards: **Наслов** = plant (italic), **Текст** = meaning ("Света биљка") | line under the cards | – |
| `energetski-kodovi` | dark section | – | heading | – | intro | places: **Наслов** = place (green), **Текст** = description | line under the places | – |
| `edukacije` | Едукације и догађаји | – | heading | – | optional intro | outlined boxes (Наслов; optional Текст) | text under the boxes | – |
| `blog` | Блог / Новости | – | heading | – | optional intro | outlined boxes | – | **Текст дугмета** = label of the "all articles" button (default "Сви чланци"); shown only when articles exist |
| `apoteka` | Биљна апотека | – | heading | – | optional intro | outlined boxes | text under the boxes | button, shown only if both label **and** link are filled |
| `clanstvo` | green Чланство section | – | heading | italic line ("Постани део покрета") | paragraphs | white cards above | – | button (e.g. → `#kontakt`) |
| `kontakt` | dark band at the bottom of **every** page | – | heading | – | optional paragraph | lines side by side (e-mail, address, partners…) | small text at the bottom | – |

**Every section also has "Прикажи на сајту".** Uncheck it to hide the whole
section. If the section has a menu item, the menu item disappears too.

**Menu items** (fixed in the code) belong to these sections: О нама → `o-nama`,
Биље → `bilje`, Митологија → `mitologija`, Енергетски кодови →
`energetski-kodovi`, Едукације → `edukacije`, Блог → `blog` (or the Чланци
page when there are articles), Апотека → `apoteka`, Чланство → `clanstvo`,
Контакт → `kontakt`.

**Links inside the page** (for buttons and text): `#o-nama`, `#bilje`,
`#mitologija`, `#energetski-kodovi`, `#edukacije`, `#blog`, `#apoteka`,
`#clanstvo`, `#kontakt`. The articles page is `/clanci`. External links start
with `https://`. E-mail links use `mailto:` (see part 12).

---

## 6. Editing a section, step by step

### 6.1 Change a text

1. **Content → Секција**.
2. Click the section, for example **О нама / Мисија и визија**. (The table shows
   the **Наслов**. The quote section shows the quote text.)
3. Click into a field and change the text.
4. Click **Save**. The status becomes **Updated**, and the website is not changed yet.
5. Click **Publish**. The status becomes **Published**, and the website
   rebuilds and shows the change in 1–2 minutes.

> Tip: you can edit several fields and click **Publish** once at the end.
> **Publish** also saves, so **Save** is only needed if you're not ready to go live.

### 6.2 Add a card / list item / numbered point ("Ставке")

1. Open the section and scroll to **Ставке**.
2. At the bottom of the list click **Add new / + Ставка секције**.
3. Fill **Наслов** (required) and, if the section uses it, **Текст**.
4. **Publish**.

### 6.3 Change the order of items

Each item has a **drag handle** (⋮⋮ or ↕ on its left/top edge). Drag the
item up or down, then **Publish**. In numbered sections (`zasto-vazna`,
`zasto-udruzenje`) the numbers follow the new order automatically.

### 6.4 Delete an item

Open the item's menu (**⋯** or the trash icon on the item) → **Remove / Delete** → **Publish**.

You can collapse items (the arrow on the item) to see the list more easily.
Collapsing changes nothing on the site.

### 6.5 Hide or show a whole section

Open the section → uncheck **Прикажи на сајту** → **Publish**. To show it
again, check the box and **Publish**.

> **Do not delete sections.** Use the checkbox instead. A deleted section
> makes the site fall back to the *original design text* for that place (see
> part 0), which is probably not what you want. (Running `npm run cms:setup`
> recreates a deleted section with the original text.)

### 6.6 Never change "Кључ секције"

This dropdown tells the website *where* the record goes. Changing it moves the
text to another part of the page. DatoCMS will refuse two records with the same key.

### 6.7 Example: put real contact details in the footer

1. **Content → Секција → Контакт и сарадња**.
2. In **Ставке**, edit the three items, for example:
   - Наслов: `[kontakt@fitoterapija.rs](mailto:kontakt@fitoterapija.rs)`
   - Наслов: `Београд, Улица и број`
   - Наслов: `Партнери, донације, сарадње — пишите нам`
3. **Publish**. The e-mail becomes a clickable link.

---

## 7. Writing articles

### 7.1 Create an article

1. **Content → Чланак → + New record** (top right).
2. Fill in the fields:

| Field | What to write | Example |
|---|---|---|
| **Наслов** *(required)* | the title, in Cyrillic | `Пролећно чишћење јетре биљкама из дворишта` |
| **Slug** *(required)* | the web address. **Only lowercase Latin letters, numbers and hyphens**, no spaces or č/ć/š/ž/đ | `prolecno-ciscenje-jetre` → page `/clanci/prolecno-ciscenje-jetre` |
| **Датум** *(required)* | publication date (articles are sorted newest first) | 20.03.2027 |
| **Аутор** | name, optional | `Друштво за фитотерапију Србије` |
| **Увод** | 1–2 sentences, shown in the list and under the title | `Маслачак и коприва — прво пролећно биље…` |
| **Насловна слика** | optional image (see part 8) | – |
| **Текст** *(required)* | the article, formatted with the editor toolbar (part 12) | – |

3. **Save** to keep it as a draft, or **Publish** to put it online.

**About the slug:** DatoCMS fills it in automatically from the title. With a
Cyrillic title the result may contain Cyrillic letters, and then you get a red
error on the field. Click into **Slug** and type a Latin version yourself
(`пролећно чишћење` → `prolecno-ciscenje`). **Don't change the slug after
publishing**, because links that people shared would stop working.

### 7.2 What happens on the website

- The **first** published article makes the menu item **Блог** open the
  **Чланци** page (`/clanci`), and the three newest articles appear in the
  Блог section on the home page with a **Сви чланци** button.
- Each article gets its own page `/clanci/<slug>` with title, intro, date,
  author, image, text and links to other articles.
- With no published articles, none of this is shown.

### 7.3 Edit, unpublish, delete

- **Edit:** open the article → change → **Publish**.
- **Take offline but keep it:** **⋯ → Unpublish**. It returns to Draft, and the
  page disappears after the next rebuild.
- **Delete for good:** **⋯ → Delete**. (Unpublish first if you might want it back.)

### 7.4 Images inside the article text

In **Текст**, use the **image** button on the toolbar to pick an image from
**Media**. It is inserted as `![description](https://www.datocms-assets.com/…)`.
Write a short description between the square brackets.

---

## 8. Images and the Media area

- **Upload:** in an image field click **Add / Upload** (or drag a file onto
  it), or go to **Media → Upload** first and pick it later.
- **Alt text (description):** open the image in **Media** (or click the
  image in the field → edit) and fill **Alternative text / Alt**, for
  example `Цвет маслачка на ливади`. It helps blind visitors and Google.
- **Size:** upload JPG or PNG about **2000 px wide** at most. Larger files
  only fill up the free storage. DatoCMS automatically resizes and
  compresses images for the website.
- **Replace an image:** in the record, remove the image (✕) and choose
  another, then **Publish**.
- **Delete unused images** from **Media** to save space. DatoCMS warns you if an
  image is still used somewhere.

---

## 9. When do changes appear on the website?

The website is rebuilt whenever content is **published**, once automatic
rebuilds are connected (NETLIFY.md, part 6). A rebuild takes about 1–2
minutes. Then refresh the page (Ctrl+F5 / Cmd+Shift+R to skip the browser cache).

Setting it up on the DatoCMS side (do **one** of these, details in NETLIFY.md):

- **Build trigger (recommended):** **Project settings → Build triggers →
  Add new → Netlify** → *Grant access* → choose the Netlify site and branch
  `main` → Save. DatoCMS then shows a build status indicator at the top, and a
  manual **Build** button.
- **Webhook:** **Project settings → Webhooks → Add new webhook** → URL =
  Netlify *build hook* → events: **Record: publish, unpublish, delete** → Save.

If a change does not appear after 5 minutes, see part 13.

---

## 10. Inviting other editors

1. **Project settings → Collaborators** (sometimes **Users / Invite**) → **Invite collaborator**.
2. Enter their e-mail and choose a **role**:
   - **Editor** can edit and publish content, but can't change the structure,
     tokens or settings. **Use this for everyone except the administrator.**
   - **Admin** can do everything.
3. They get an e-mail, create a DatoCMS login and see the project.

The Free plan allows very few collaborators. Check
<https://www.datocms.com/pricing> for the current number. If the association
needs more editors, a paid plan is required.

---

## 11. History and undo

Every save creates a **version**. To go back:

1. Open the record → find **History / Versions** in the right sidebar
   (clock icon).
2. Click an older version to compare it with the current one.
3. **Restore** that version, then **Publish**.

Deleted records cannot be restored from History. That is one more reason to
**unpublish** or **hide** instead of deleting.

---

## 12. Formatting text (Markdown cheat sheet)

Fields with the editor toolbar (**Текст**, **Напомена**, article **Текст**, item
**Текст**) use *Markdown*. You can click the toolbar buttons or type it yourself:

| You type | Result |
|---|---|
| `**подебљано**` | **подебљано** |
| `*курзив*` | *курзив* |
| empty line between two paragraphs | new paragraph |
| `- ставка` (each on a new line) | bullet list |
| `1. ставка` | numbered list |
| `## Поднаслов` | sub-heading (use in articles) |
| `> цитат` | highlighted quote |
| `[текст линка](https://primer.rs)` | link |
| `[пишите нам](mailto:kontakt@primer.rs)` | e-mail link |
| `[чланство](#clanstvo)` | link to a section of the home page |

Fields **Наслов** and **Поднаслов** are plain text: no Markdown. In item
**Наслов** fields, `**bold**` and links work.

**Example: a numbered point with a list (section `zasto-udruzenje`):**

```
Знање о лековитом биљу треба да буде приступачно свима. Кроз наше активности:

- Организујемо курсеве фитотерапије за све узрасте
- Промовишемо здрав стил живота
```

(Note the **empty line** before the list. Without it the list is not recognised.)

---

## 13. Troubleshooting

| Problem | Cause and solution |
|---|---|
| I changed text but the site didn't change | 1) Did you click **Publish**? The status must be **Published**, not Updated or Draft. 2) Wait 2 minutes and hard-refresh. 3) Check Netlify → **Deploys**: if no new deploy started, automatic rebuilds aren't connected (NETLIFY.md, part 6). |
| The site shows old/original text for a section | That section's record doesn't exist or isn't published. Check **Content → Секција** (13 records, all Published). Run `npm run cms:setup` to recreate a missing one. |
| A whole section disappeared | **Прикажи на сајту** is unchecked. Check it and publish. |
| Red error on **Slug** | Use only `a–z`, `0–9` and `-`. No Cyrillic, spaces or `č ć š ž đ`. The slug must also be unique. |
| "Кључ секције must be unique" | A section with that key already exists. Edit the existing one instead. |
| Блог still scrolls to the section, no Чланци page | No article is **published**, or the site wasn't rebuilt yet. |
| List shows as one line of text | Add an **empty line** before the list and start each item with `- `. |
| An image is huge / slow | Upload a smaller original (≤ 2000 px). The site resizes, but storage is limited. |
| `npm run cms:setup` says "DATOCMS_CMA_TOKEN is missing" | Put the full-access token in `.env` (part 3.2). |
| `npm run cms:setup` fails with 401/403 | The token is wrong or has no Content Management API access. Create it again as in 3.2 (role **Admin**). |
| A field "already exists with a different type" | Someone created a field with the same API key by hand. Delete or rename that field in **Schema** and run the script again. |
| Netlify build fails with `401` | The Netlify variable `DATOCMS_API_TOKEN` is wrong. Use the read-only token (3.1) and redeploy. |

---

## 14. Free-plan limits

- **300 records** in total. Every section counts as one record, and so does
  every *item* inside a section. The starter content uses about **60**, which
  leaves room for roughly **240 articles**.
- **Media storage** is limited (a few hundred MB). Upload reasonably sized images.
- **API calls:** the website makes **one** request per rebuild, so this is never an issue.
- Collaborators are limited (part 10).

Check the current numbers at <https://www.datocms.com/pricing>.

---

## 15. Reference for developers

GraphQL query used by the site (`src/lib/datocms.ts`):

```graphql
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
```

| Model | API key | Fields (API keys) |
|---|---|---|
| Ставка секције *(block)* | `section_item` | `title`, `text` |
| Секција | `section` | `section_key`, `visible`, `kicker`, `title`, `subtitle`, `text`, `items`, `note`, `button_label`, `button_link` |
| Чланак | `article` | `title`, `slug`, `date`, `author`, `excerpt`, `cover`, `body` |

- Section keys and the fallback text: `src/lib/sections.ts`.
- Rendering of each section: `src/pages/index.astro`.
- Adding a **new** section type means: add the key to `SECTION_KEYS` and
  `SECTION_META` in `sections.ts`, add its markup to `index.astro`, add the
  value to the **Кључ секције** dropdown in DatoCMS (Schema → Секција →
  Кључ секције → Validations *and* Presentation), then create its record.
- Draft preview: a deploy with `DATOCMS_INCLUDE_DRAFTS=true` shows unpublished
  drafts. Use it only on a separate preview site, never on the main site.
