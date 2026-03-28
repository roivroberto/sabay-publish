# Sabay Publish — Product Requirements Document
**Paraluman News Challenge | Bilingual Publishing Prototype**  
**Version 2.6 (Branding Color + Logo Update)** | **Author:** Student Team | **Date:** 2026

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Problem Statement](#2-problem-statement)
3. [Why This Matters for Paraluman](#3-why-this-matters-for-paraluman)
4. [User Personas](#4-user-personas)
5. [Jobs to Be Done](#5-jobs-to-be-done)
6. [Product Principles](#6-product-principles)
7. [Goals](#7-goals)
8. [Non-Goals](#8-non-goals)
9. [Scope: MVP vs Later Versions](#9-scope-mvp-vs-later-versions)
10. [End-to-End User Flow](#10-end-to-end-user-flow)
11. [Core Screens and What Each Screen Must Do](#11-core-screens-and-what-each-screen-must-do)
12. [Functional Requirements](#12-functional-requirements)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Data Model / Entities](#14-data-model--entities)
15. [Suggested Backend Architecture and Convex Responsibilities](#15-suggested-backend-architecture-and-convex-responsibilities)
16. [Suggested Frontend Architecture and Page Structure](#16-suggested-frontend-architecture-and-page-structure)
17. [Translation and Review Workflow](#17-translation-and-review-workflow)
18. [Publishing Workflow](#18-publishing-workflow)
19. [AI Disclosure and Editorial Accountability Requirements](#19-ai-disclosure-and-editorial-accountability-requirements)
20. [Accessibility and Multilingual Metadata Requirements](#20-accessibility-and-multilingual-metadata-requirements)
21. [Acceptance Criteria](#21-acceptance-criteria)
22. [Success Metrics](#22-success-metrics)
23. [Risks and Failure Modes](#23-risks-and-failure-modes)
24. [Tradeoffs and Why They Are Acceptable for This Challenge](#24-tradeoffs-and-why-they-are-acceptable-for-this-challenge)
25. [5-Day Implementation Plan for a Student Team](#25-5-day-implementation-plan-for-a-student-team)
26. [Demo Script for Presenting the Prototype](#26-demo-script-for-presenting-the-prototype)
27. [Appendix: 1-Page Design Note Summary](#27-appendix-1-page-design-note-summary)

---

## 1. Product Summary

**Sabay Publish** is a human-in-the-loop bilingual publishing workflow for a small newsroom team that needs to publish the same story in English and Filipino at the same time.

A writer submits an article in English. The system generates an AI-assisted Filipino draft using Google Cloud Translation Advanced with editorial glossary support. An editor reviews the Filipino draft, sees lightweight QA warnings, edits the translation if needed, and then uses one approval action to publish both language versions together.

This is **not** an autonomous AI journalism product. AI handles first-pass translation only. Editors retain final editorial authority. The published Filipino article includes a clear disclosure that the translation was AI-assisted and reviewed by an editor.

The core promise is simple: **make bilingual publishing faster without weakening newsroom standards.**

**MVP stack:** Next.js · Convex · Clerk Auth · Google Cloud Translation Advanced · Tailwind CSS · shadcn/ui · Vercel

---

## 2. Problem Statement

Publishing bilingual news content is slow and inconsistent for under-resourced youth newsrooms like Paraluman. In a typical manual workflow:

- a writer submits an article in English,
- a Filipino translation is done separately or delayed,
- translation review happens informally,
- the two versions are published at different times,
- key terms such as organization names and official titles are translated inconsistently, and
- there is no clear audit trail showing who translated, who reviewed, and when each version went live.

That means bilingual publishing is often skipped, delayed, or delivered unevenly. Readers who prefer Filipino get a worse experience. Editors are forced into a tradeoff between speed and trust. Sabay Publish is designed to reduce that tradeoff with a workflow that is fast enough for a student newsroom and strict enough for editorial use.

---

## 3. Why This Matters for Paraluman

Paraluman is a youth-driven journalism organization. For a newsroom like this, bilingual publishing is not just a formatting upgrade; it directly affects access, mission, and credibility.

Why this matters:

- **Audience accessibility:** Readers may prefer English or Filipino. Both audiences should receive the story at the same publication moment.
- **Mission alignment:** A youth-driven newsroom should meet readers where they are, linguistically and culturally.
- **Operational realism:** Small teams need workflow help, not heavyweight newsroom infrastructure.
- **Responsible AI use:** Paraluman’s AI policy allows support uses like translation, but still requires human review, final editorial approval, reader transparency, and safeguards against unreliable outputs.
- **Trust preservation:** Translation in journalism is not just language conversion. Names, quotes, numbers, dates, attribution, and tone all matter.

Sabay Publish operationalizes that policy. It makes the safe path the default path: generate, review, approve, disclose.

---

## 4. User Personas

### Persona A — The Writer (Ana, 20)
- Junior staff writer, submits 3–5 articles per week
- Comfortable with Google Docs and basic CMS interfaces
- Does not speak Filipino fluently enough to self-translate

**Wants**
- a simple submission flow,
- no extra technical overhead,
- visibility into what stage the article is in.

**Pain point**
- articles can sit in limbo while waiting for translation.

### Persona B — The Editor (Marco, 24)
- Senior editor responsible for final publication decisions
- Reviews both language versions before sign-off

**Cares about**
- correct named entities,
- consistent organizational and government terminology,
- avoiding embarrassing mistranslations,
- a clear record of editorial approval.

**Wants**
- a side-by-side review screen,
- lightweight QA support,
- the ability to edit inline,
- one clean publish action.

**Pain point**
- informal handoffs make the process inconsistent and hard to trust.

### Persona C — The Reader (General Public)
- Visits Paraluman’s published site
- May prefer English or Filipino

**Wants**
- a clean article layout,
- an easy language switcher,
- clarity about how AI was used.

**Pain point**
- many youth publications promise bilingual coverage but deliver it late or inconsistently.

---

## 5. Jobs to Be Done

| Actor | When... | I want to... | So that... |
|---|---|---|---|
| Writer | I finish an article | Submit it for bilingual publishing without extra steps | It can move into review without waiting for a separate translator |
| Editor | I open the review queue | See all articles needing review in one place | I can triage quickly |
| Editor | I review a translated article | See English and Filipino side by side with QA warnings | I can catch errors efficiently |
| Editor | I am satisfied with the translation | Approve and publish both versions in one action | Both pages go live at the same moment |
| Editor | I find a translation problem | Edit the Filipino text inline or reject it with a note | I never publish something I have not personally approved |
| Reader | I visit a published article | Switch between English and Filipino easily | I can read in the language I prefer |
| Reader | I read the Filipino version | Know it was AI-assisted and editor-reviewed | I can make an informed judgment about the text |

---

## 6. Product Principles

1. **Editor control is non-negotiable.** AI output is a draft, not a decision. No article is published without explicit human approval.
2. **Publish both or neither.** The newsroom should not end up with only one language version live.
3. **Transparency builds trust.** AI use is disclosed publicly, and editorial actions are logged internally.
4. **Glossary over model experiments.** A consistent translation of names, titles, places, and house-style terms is more valuable than flashy AI experimentation in an MVP.
5. **Simple beats clever.** This is a five-day student prototype. Reliability matters more than feature theatrics.
6. **Audit trails are infrastructure.** Knowing who requested translation, who reviewed, who rejected, and who published is core editorial accountability.
7. **The workflow must stay legible.** Editors and writers should always know an article’s current state and next action.

---

## 7. Goals

### Primary goals
- A writer can log in and submit a complete English article.
- The system generates a Filipino draft using Google Cloud Translation Advanced with glossary support.
- An editor can review English and Filipino side by side, see QA warnings, edit the Filipino draft inline, and either reject it with a note or approve it.
- One approval action publishes both `/en/articles/[slug]` and `/fil/articles/[slug]` simultaneously.
- Public pages render like real news articles, with correct multilingual metadata and a visible AI disclosure on the Filipino page.
- The editorial UI and public article pages visually reflect Paraluman’s brand language rather than a generic dashboard aesthetic.
- A lightweight audit trail records translation generation, rejection or approval, and publish timestamps.

### Secondary goals
- Writers can see article status in their dashboard.
- Editors can trigger re-translation when needed.
- The workflow remains understandable enough to demo in under 10 minutes.

---

## 8. Non-Goals

The following are explicitly out of scope for this prototype:

- No direct production CMS integration
- No multi-editor collaboration workflow
- No comments or annotations system
- No analytics dashboard
- No image translation
- No mobile app for editorial use
- No reverse translation (Filipino to English)
- No support for languages beyond Filipino in the MVP
- No model fine-tuning or custom training

These exclusions are intentional. They keep the prototype narrow, credible, and finishable by a small team.

---

## 9. Scope: MVP vs Later Versions

### MVP (This Challenge)
- Clerk authentication with writer and editor roles
- English article submission form with metadata and body
- AI-assisted translation via Google Cloud Translation Advanced with glossary support
- Side-by-side review UI with inline Filipino editing and QA warnings
- Reject flow with required editor note
- Single action to approve and publish both routes
- Published article pages at `/en/articles/[slug]` and `/fil/articles/[slug]`
- Visible bilingual AI disclosure on Filipino pages
- Lightweight audit trail
- Demo glossary with 10+ seed terms
- Read-only glossary reference page
- Paraluman-branded editorial and public UI built with shadcn/ui components and Tailwind tokens
- Status flow: `DRAFT → TRANSLATING → NEEDS_REVIEW → PUBLISHED`

### V2 (Post-Challenge)
- Glossary management UI (add / edit / deactivate terms)
- Writer revision loop with richer handoff states
- Notifications on status change
- More advanced QA checks
- CMS integration via webhook or API
- Version history and diff-based review

### V3 (Future)
- Multi-language support beyond Filipino
- Translation memory or newsroom house-style tuning
- Segment-level approvals
- Reader language preference persistence
- Mobile-responsive editorial workflow

**Important status model note:** approval is persisted as an audit event inside the atomic **Approve & Publish** action rather than as a separate visible status. That keeps the MVP state machine simpler while still preserving editorial accountability.

---

## 10. End-to-End User Flow

```text
[Writer logs in via Clerk]
        |
        v
[Writer opens /articles/new]
        |
        v
[Writer fills article form]
  - Headline
  - Deck
  - Byline
  - Category
  - Hero image URL
  - Hero image caption
  - Hero image alt text
  - Body
        |
        v
[Writer clicks Save Draft]
[Status = DRAFT]
        |
        v
[Writer clicks Submit for Translation]
        |
        v
[Status = TRANSLATING]
[Convex action calls Google Cloud Translation Advanced]
  - Applies editorial glossary
  - Translates headline, deck, and body
  - Leaves byline, category, slug, image caption, and alt text unchanged in MVP
        |
        v
[Filipino draft + QA warnings saved]
[Status = NEEDS_REVIEW]
        |
        v
[Editor sees article in /editor/queue]
        |
        v
[Editor opens /editor/review/[articleId]]
  - English on left (read-only)
  - Filipino on right (editable)
  - QA warning panel visible
  - Reject requires a short note
        |
        +------------------------+
        |                        |
        v                        v
[Reject & Return to Writer]   [Approve & Publish]
  - editor note required       - atomic publish mutation
  - status -> DRAFT            - record article_approved
  - note shown to writer       - create publication_record
  - audit log written          - expose both public routes
                                - status -> PUBLISHED
                                - record article_published
        |
        v
[Reader visits /en/articles/[slug] or /fil/articles/[slug]]
  - sees complete article layout
  - can switch languages
  - sees AI disclosure on Filipino page
```

---

## 11. Core Screens and What Each Screen Must Do

### Screen 1: Login Page (`/login`)
**What it must do**
- Authenticate users via Clerk
- Redirect authenticated users to the appropriate dashboard
- Block unauthenticated access to editorial routes

**Key elements**
- Paraluman / Sabay Publish branding
- Clerk sign-in component
- Demo accounts are pre-created; no public sign-up

### Screen 2: Writer Dashboard (`/dashboard`)
**What it must do**
- Show the writer’s submitted articles and current status
- Surface the latest editor note when an article is rejected
- Provide a “New Article” action

**Key elements**
- Article list with headline, category, status, last updated
- Status badges:
  - Draft = gray
  - Translating = yellow
  - Needs Review = orange
  - Published = green
- Optional “Last editor note” column for rejected articles that returned to Draft

### Screen 3: Article Submission / Edit Form (`/articles/new`, `/articles/[id]`)
**What it must do**
- Capture all required English article fields
- Load an existing article for view/edit at `/articles/[id]`
- Save drafts and later edits
- Submit a complete draft for translation

**Fields**
- Headline (required)
- Deck / subheadline (required)
- Byline (required)
- Category (required)
- Hero image URL (required)
- Hero image caption (required)
- Hero image alt text (required)
- Body (required)
- Slug (auto-generated, editable, and required to be unique)

**Actions**
- `Save Draft` → stays `DRAFT`
- `Submit for Translation` → sets `TRANSLATING`

### Screen 4: Editor Review Queue (`/editor/queue`)
**What it must do**
- Show all articles in `NEEDS_REVIEW`
- Let editors open an article for review
- Optionally filter by status for demo convenience

**Key elements**
- Headline
- Writer
- Submitted at
- Status
- Review button

### Screen 5: Review UI (`/editor/review/[articleId]`)
**What it must do**
- Show English and Filipino side by side
- Highlight QA warnings
- Allow inline edits to Filipino headline, deck, and body
- Provide `Approve & Publish`, `Reject & Return to Writer`, and `Re-translate`
- Make the recovery path explicit: editors use `Re-translate` for quick machine reruns before rejecting; rejection sends the article back to the writer when the English source or framing needs revision

**Layout**
- Left column: English source content
- Right column: Filipino draft
- QA warning panel
- Sticky action bar

**Important reject behavior**
- Reject requires a short editor note
- The note is stored in `audit_logs.metadata.rejectionReason`
- The latest rejection note is visible to the writer on the dashboard and article screen

**Example QA warnings**
- **Mismatched number:** “English body contains ‘₱2.3 billion’ but Filipino version shows ‘₱2.3 milyon’ — verify unit consistency.”
- **Named entity mismatch:** “‘Commission on Elections’ appears as ‘Komisyon sa mga Halalan’ — glossary term is ‘Komisyon sa Halalan (COMELEC)’.”
- **Leftover English word:** “‘Ang amendment ay...’ — possible untranslated English term.”
- **Unmatched quote:** “English has 3 quoted passages; Filipino version has 2 — verify quote alignment.”

### Screen 6: Published Article — English (`/en/articles/[slug]`)
**What it must render**
- Headline
- Deck
- Byline
- Date published (from `publication_records.publishedAt`)
- Category
- Hero image
- Hero image caption
- Body
- Language switcher to Filipino
- Correct `lang="en"` and `hreflang` metadata

### Screen 7: Published Article — Filipino (`/fil/articles/[slug]`)
**What it must render**
- Localized content fields in Filipino: **headline, deck, and body**
- Shared metadata from the source article: **byline, category, slug, hero image, hero image caption, and hero image alt text**
- Date published from **`publication_records.publishedAt`**
- Language switcher to English
- Visible bilingual AI disclosure
- Correct `lang="fil"` and `hreflang` metadata

**Disclosure label**
> “Ang artikulong ito ay may AI-assisted na unang salin at sinuri ng editor bago inilathala.”  
> (“This article includes an AI-assisted first draft that an editor reviewed before publication.”)

### Screen 8: Glossary List (`/editor/glossary`)
**What it must do**
- Show the current glossary terms in read-only mode
- Display source term, target term, category, and notes

---

## 12. Functional Requirements

### Authentication
- **FR-01:** Users must log in via Clerk before accessing non-public routes.
- **FR-02:** Two roles are supported: `writer` and `editor`.
- **FR-03:** Role authorization is enforced server-side and/or in Convex mutations, not only in the UI.

### Article Submission
- **FR-04:** A writer can create a new article with all required fields.
- **FR-05:** The system auto-generates a URL-safe slug from the headline; the writer can override it.
- **FR-05a:** Slugs must be unique across articles. On collision, the system appends a numeric suffix such as `-2` unless the writer or editor manually changes the slug.
- **FR-06:** Submitting for translation requires all required fields to be complete.
- **FR-07:** Status transitions are strictly: `DRAFT → TRANSLATING → NEEDS_REVIEW → PUBLISHED`.
- **FR-08:** Approval is captured as an audit event inside the atomic publish action, not as a separate persisted status.
- **FR-09:** A rejected article returns to `DRAFT`.
- **FR-10:** Rejecting an article requires a short editor note.
- **FR-11:** The latest rejection note is visible to the writer.

### Translation
- **FR-12:** Translation is triggered through a Convex action that calls Google Cloud Translation Advanced with the editorial glossary applied.
- **FR-13:** Only the following fields are translated in the MVP: `headline`, `deck`, and `body`.
- **FR-14:** `byline`, `category`, `slug`, `hero image`, `hero image caption`, and `hero image alt text` remain shared source metadata in the MVP unless manually changed in a future version.
- **FR-14a:** The public “Date published” displayed on both language pages comes from `publication_records.publishedAt`.
- **FR-15:** Translation results are stored in `article_localizations`.
- **FR-16:** If translation fails, the English draft remains intact and editable, and a visible retry path is shown.

### Review and Editing
- **FR-17:** The review UI shows English and Filipino side by side.
- **FR-18:** Filipino fields can be edited inline before publish.
- **FR-19:** QA warnings are generated before editor approval.
- **FR-20:** QA checks include mismatched numbers, dates, named entities, quotes, and leftover English words.
- **FR-21:** Re-translation can be triggered by the editor while the article is in `NEEDS_REVIEW` and has not been published.
- **FR-21a:** `Re-translate` is intended for quick machine reruns when the English source is still correct. `Reject & Return to Writer` is the default path when the English source, framing, or facts need revision.

### Publishing
- **FR-22:** `Approve & Publish` is an atomic action that makes both language routes public together.
- **FR-23:** Publishing creates a `publication_record` with shared publish timestamp and both public URLs.
- **FR-24:** Publishing records who approved and who published; in the MVP these may be the same editor.
- **FR-25:** Unpublishing is out of scope.

### Glossary
- **FR-26:** A seed glossary of at least 10 terms is loaded for demo use.
- **FR-27:** Glossary terms are viewable in a read-only glossary page in the MVP.
- **FR-28:** Glossary application uses the translation provider’s glossary feature rather than brittle string replacement.

### Audit Trail
- **FR-29:** Every material workflow action is logged in `audit_logs`.
- **FR-30:** Logged actions include article creation, translation request, translation completion, re-translation request, editor edit, article rejection, article approval, and article publication.
- **FR-31:** Rejection logs must include the editor note in structured metadata.

---

## 13. Non-Functional Requirements

- **NFR-01 Performance:** Published pages should feel fast and render in under roughly 2 seconds on a typical connection.
- **NFR-02 Demo reliability:** The system should remain stable for a live 30-minute demo.
- **NFR-03 Security:** Secrets stay in environment variables. Editorial routes are protected. Role validation happens in backend logic.
- **NFR-04 Accessibility:** Public pages should meet WCAG 2.1 AA basics for contrast, headings, alt text, and keyboard navigation.
- **NFR-05 Atomicity:** A partial publish state where only one language version is live should be architecturally impossible.
- **NFR-06 Data integrity:** Translation failures must never erase English draft content.
- **NFR-07 Metadata correctness:** Public pages must expose accurate `lang`, `hreflang`, title, and canonical metadata.
- **NFR-08 Simplicity:** The MVP should avoid unnecessary infrastructure such as queues, microservices, or CMS adapters.
- **NFR-09 Brand fidelity:** The UI should clearly feel like a Paraluman product through color, typography hierarchy, spacing, and card layout patterns derived from the supplied site screenshot, while still remaining clean and usable for an editorial workflow.
- **NFR-10 Design system consistency:** New UI should be composed primarily from shadcn/ui primitives customized through Tailwind theme tokens instead of ad hoc one-off components.

---

## 14. Data Model / Entities

### `users`
```ts
_id: Id<"users">
clerkId: string
email: string
displayName: string
role: "writer" | "editor"
createdAt: number
updatedAt: number
```

### `articles`
English source-of-truth article record.

```ts
_id: Id<"articles">
authorId: Id<"users">
slug: string
status: "DRAFT" | "TRANSLATING" | "NEEDS_REVIEW" | "PUBLISHED"
sourceLanguage: "en"
headline: string
deck: string
body: string
byline: string
category: "news" | "opinion" | "feature" | "sports" | "culture"
heroImageUrl: string
heroImageCaption: string
heroImageAlt: string
latestEditorNote: string | null
translationError: string | null
createdAt: number
updatedAt: number
```

**Notes**
- `slug` must be unique across all articles.
- Public pages display their publish date from `publication_records.publishedAt`, not from the `articles` record.

### `article_localizations`
Stores translated variants. MVP supports Filipino only.

```ts
_id: Id<"article_localizations">
articleId: Id<"articles">
locale: "fil"
translatedHeadline: string
translatedDeck: string
translatedBody: string
translationSource: "ai_assisted" | "human"
translationProvider: "google_cloud_translation" | null
glossaryApplied: boolean
editorEdited: boolean
qaWarnings: Array<{
  type: string
  severity: "low" | "medium" | "high"
  message: string
  field?: string
}>
generatedAt: number
generatedBy: Id<"users"> | "system"
updatedAt: number
```

### `glossary_terms`
```ts
_id: Id<"glossary_terms">
englishTerm: string
filipinoTerm: string
category: "org" | "title" | "place" | "name" | "house_style"
notes: string
active: boolean
createdBy: Id<"users">
createdAt: number
updatedAt: number
```

### `audit_logs`
```ts
_id: Id<"audit_logs">
articleId: Id<"articles">
actorId: Id<"users"> | "system"
action:
  | "article_created"
  | "article_updated"
  | "translation_requested"
  | "translation_completed"
  | "qa_checks_completed"
  | "editor_edit"
  | "retranslation_requested"
  | "article_rejected"
  | "article_approved"
  | "article_published"
fromStatus: string | null
toStatus: string | null
metadata: {
  rejectionReason?: string
  glossaryApplied?: boolean
  qaWarningsCount?: number
  locale?: string
  [key: string]: unknown
}
timestamp: number
```

### `publication_records`
```ts
_id: Id<"publication_records">
articleId: Id<"articles">
slug: string
approvedBy: Id<"users">
approvedAt: number
publishedBy: Id<"users">
publishedAt: number
enUrl: string
filUrl: string
filLocalizationId: Id<"article_localizations">
createdAt: number
```

**Notes**
- `publishedAt` is the source of truth for the public “Date published” shown on both language pages.
- `approvedBy` and `approvedAt` live here, not in `article_localizations`, to keep approval as a pair-level event for the bilingual publish action.

### Example glossary rule
- **English term:** Commission on Elections
- **Filipino term:** Komisyon sa Halalan (COMELEC)
- **Category:** org
- **Notes:** Use full form on first mention; COMELEC acceptable afterward.

---

## 15. Suggested Backend Architecture and Convex Responsibilities

Convex should serve as the app database, backend logic layer, and real-time sync engine for the editorial workflow.

### Convex queries
Use queries for reactive reads:
- `getArticlesByAuthor(authorId)` → writer dashboard
- `getArticlesNeedingReview()` → editor queue
- `getArticleById(articleId)` → article form / review UI
- `getLocalizationByArticle(articleId, locale)` → Filipino draft
- `getAuditLogsByArticle(articleId)` → audit history
- `getPublishedArticle(slug, locale)` → public article rendering
- `getGlossaryTerms()` → read-only glossary page

### Convex mutations
Use mutations for validated writes and state transitions:
- `createArticle(fields)`
- `updateArticle(articleId, fields)`
- `submitForTranslation(articleId)`
- `requestRetranslation(articleId, editorId)`
- `saveLocalizationEdits(localizationId, fields)`
- `rejectArticle(articleId, editorId, note)`
- `approveAndPublish(articleId, localizationId, editorId)`
- `setTranslationState(articleId, status, translationError?)`
- `writeAuditLog(entry)`

### Convex actions
Use actions for external APIs and non-deterministic work:
- `generateTranslation(articleId, { mode })` where `mode` is `"initial"` or `"retranslate"`
- `runQaChecks(articleId, localizationId)`
- `buildGlossaryPayload()`

### Design rules
- External API calls belong in **actions**, not **mutations**.
- State transitions are validated in backend code, not only in the UI.
- `approveAndPublish` must verify editor role and publish both routes atomically.
- `rejectArticle` must require a note and persist it both to `audit_logs` and `articles.latestEditorNote`.
- `requestRetranslation` should only be available while an article is in `NEEDS_REVIEW`; it should write a `retranslation_requested` audit event and then call `generateTranslation(articleId, { mode: "retranslate" })`.
- Use rejection, not re-translation, when the English source needs writer revision.

This split is realistic for a student MVP: clean, easy to reason about, and not over-engineered.

---

## 16. Suggested Frontend Architecture and Page Structure

### Stack
- Next.js App Router
- Convex React client
- Clerk Auth
- Tailwind CSS
- shadcn/ui
- Vercel deployment

### Route structure

**Editorial routes**
- `/login`
- `/dashboard`
- `/articles/new`
- `/articles/[id]`
- `/editor/queue`
- `/editor/review/[articleId]`
- `/editor/glossary`

**Public routes**
- `/en/articles/[slug]`
- `/fil/articles/[slug]`

### Core components
- `ArticleForm`
- `StatusBadge`
- `TranslationReviewPanel`
- `QaWarningsPanel`
- `RejectDialog`
- `PublishBar`
- `GlossaryTable`
- `LanguageSwitcher`
- `PublicArticleLayout`
- shadcn/ui primitives: `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Table`, `Tabs`, `Dialog`, `Alert`, `Separator`, `ScrollArea`

### Page responsibilities
- **Dashboard:** article list, current status, latest editor note
- **Article form:** create/edit English source article
- **Review UI:** compare, edit, reject with note, approve and publish
- **Public pages:** polished article layout with multilingual metadata and language switcher
- **Glossary page:** read-only list of seed terms for editorial reference


### Paraluman branding and shadcn implementation requirements

The product should **feel unmistakably like Paraluman** while still functioning as a modern editorial tool. The supplied homepage screenshot shows a clear visual language: a strong purple brand accent, white page background, black editorial typography, compact navigation, section labels with purple accents, light-gray content containers, and image-led story cards.

#### Brand translation rules for the prototype
- Use the provided **official Paraluman purple `#73068e`** as the primary accent token for buttons, links, active states, dividers, section markers, focus accents, and selected tabs.
- Keep the overall canvas **light and editorial**, with white backgrounds, subtle gray surfaces, and restrained borders.
- Preserve a **newsroom feel**, not a SaaS dashboard feel. Public pages should resemble a publication with strong headline hierarchy, dense but readable article grids, and image-first story cards.
- Use **serif typography for article headlines** and feature headlines, paired with a clean sans-serif for navigation, metadata, labels, buttons, and form controls.
- Reuse Paraluman-style visual motifs from the screenshot: thin purple section bars, compact uppercase section labels, centered masthead treatment on public-facing pages, and purple CTA chips.
- Use the provided **Paraluman wordmark logo** in brand-sensitive placements such as the login screen, public header/masthead, and optional dashboard top bar. Preserve its proportions, keep ample whitespace around it, and avoid recoloring or stretching the asset.

#### shadcn/ui usage rules
- Build the UI primarily from shadcn/ui primitives customized through Tailwind tokens rather than custom-styled raw HTML everywhere.
- Use `Card` for article tiles, queue rows, dashboard summaries, and related-story modules.
- Use `Badge` for status pills such as `DRAFT`, `TRANSLATING`, `NEEDS_REVIEW`, and `PUBLISHED`.
- Use `Button` for all primary and secondary actions, with the primary variant mapped to the Paraluman purple token.
- Use `Dialog` or `AlertDialog` for reject confirmation and destructive editorial actions.
- Use `Table` for the glossary list and editor queue where tabular scanning matters.
- Use `Tabs` or an equivalent segmented control for the English/Filipino language switcher.
- Use `Alert` for translation warnings, AI disclosure callouts in the editorial UI, and system error states.

#### Page-level design guidance
- **Login page:** minimalist, branded, with Paraluman masthead, purple accent line, and a clean Clerk sign-in card.
- **Writer and editor dashboards:** functional first, but wrapped in brand-consistent cards, badges, spacing, and purple section headers.
- **Review screen:** prioritize readability and editorial confidence. Use a two-column layout with shadcn cards, sticky publish bar, visible warning panel, and restrained brand accents rather than decorative noise.
- **Public article pages:** should be the closest visual match to Paraluman’s site, including masthead-inspired header, serif headline presentation, category markers, image-forward layout, and a compact language switcher.
- **Homepage or demo listing page, if built:** should echo Paraluman’s multi-section news grid so the prototype immediately reads as a newsroom product.

#### Important implementation note
This challenge does **not** require pixel-perfect cloning of Paraluman’s current site. The requirement is to build a **brand-faithful product interpretation**: same editorial tone, same recognizable color language, same newsroom visual cues, but implemented cleanly with Next.js, Tailwind, and shadcn/ui for speed and maintainability.

---

## 17. Translation and Review Workflow

### Why human approval is mandatory
Human approval is mandatory because journalism translation carries editorial risk. An AI system can mishandle:

- attribution,
- quoted speech,
- named entities,
- political or legal nuance,
- numbers and dates,
- tone and context.

In a newsroom, those are not cosmetic issues. They are trust issues. Sabay Publish uses AI to speed up first-pass translation, but it keeps final editorial judgment with the editor because that is the only defensible workflow for this challenge and for Paraluman’s stated AI policy.

### Why glossary support matters more than fancy model experimentation
For this MVP, glossary support matters more than trying multiple models or prompt tricks because:

- newsroom consistency depends heavily on names, organizations, places, titles, and house-style terms,
- glossary-backed accuracy is easier to explain and defend in a demo,
- editors will trust a system that gets terms right more than one that sounds more fluent but is inconsistent,
- a small team can implement glossary support reliably in five days.

A prototype that always renders “Commission on Elections” as “Komisyon sa Halalan (COMELEC)” is more useful than a prototype that uses a more experimental model but occasionally drifts.

### Translation workflow
1. Writer submits a complete English article.
2. Mutation sets status to `TRANSLATING`.
3. Action calls Google Cloud Translation Advanced with glossary support.
4. Only `headline`, `deck`, and `body` are translated in the MVP.
5. Filipino localization is stored.
6. QA checks run on the English/Filipino pair.
7. Status moves to `NEEDS_REVIEW`.
8. Editor reviews the Filipino draft.
9. If the English source is still correct but the draft needs another machine pass, the editor uses `Re-translate`.
10. If the source article or framing needs revision, the editor uses `Reject & Return to Writer` with a note and the article returns to `DRAFT`.
11. If the translation is acceptable, the editor approves and publishes.

### QA checks
Minimum QA checks:
- mismatched numbers or currency
- date mismatch
- named entity mismatch
- leftover English word detection
- unmatched quote count

---

## 18. Publishing Workflow

### Publish rule
No Filipino draft can go live directly. Only `Approve & Publish` can publish an article pair.

### Atomic publish behavior
The publish mutation must:
1. validate that the actor is an editor,
2. validate that English source content exists,
3. validate that a Filipino localization exists,
4. record `article_approved` in `audit_logs`,
5. create a `publication_record` with `approvedBy`, `approvedAt`, and `publishedAt` as the source of truth for the bilingual publish event,
6. expose both `/en/articles/[slug]` and `/fil/articles/[slug]`,
7. set article status to `PUBLISHED`,
8. record `article_published`.

### URL strategy
- English: `/en/articles/[slug]`
- Filipino: `/fil/articles/[slug]`

Example:
- `/en/articles/student-voters-turnout-rises`
- `/fil/articles/student-voters-turnout-rises`

Both pages should reference each other as alternate language versions.

### Why simultaneous publish matters
If only one version goes live first:
- the bilingual promise is broken,
- readers get an uneven experience,
- editors may lose trust in the workflow,
- publication records become harder to interpret.

For this challenge, “publish both together” is both a user-facing feature and a product-quality signal.

---

## 19. AI Disclosure and Editorial Accountability Requirements

### Filipino page disclosure
The Filipino article page must include a visible, non-removable disclosure near the byline:

> “AI-assisted translation, reviewed by an editor.”

A bilingual rendering may also be shown for clarity:

> “Ang artikulong ito ay isinalin sa tulong ng artificial intelligence at sinuri ng isang editor bago ilathala.”

### Editorial accountability requirements
The system must record:
- who requested or generated the translation,
- when translation completed,
- whether the editor made inline edits,
- whether the article was rejected and why,
- who approved publication,
- when publication occurred.

### Why this matters
This directly implements Paraluman’s AI policy: AI is used as a support tool, humans remain accountable, and readers are not misled about how the Filipino version was produced.

---

## 20. Accessibility and Multilingual Metadata Requirements

### Accessibility
Public pages must:
- use semantic headings,
- include alt text for hero images,
- support keyboard navigation,
- meet basic contrast requirements,
- label language switcher controls clearly.

### Multilingual metadata
Each article pair must include:
- correct HTML `lang` attribute,
- `<link rel="alternate" hreflang="en">` and `hreflang="fil"`,
- canonical URLs,
- page titles and descriptions derived from the localized content.

Multilingual publishing is not complete if the page only looks bilingual. Browsers, assistive technologies, and search engines should understand the language relationship too.

---

## 21. Acceptance Criteria

### A. Authentication
- Given an unauthenticated visitor, when they open `/dashboard`, they are redirected to `/login`.
- Given an authenticated editor, when they open `/editor/queue`, access is granted.
- Given an authenticated writer, when they open `/editor/queue`, access is denied.

### B. Create Draft
- Given a logged-in writer, when they complete all required English fields and save, an article is created with status `DRAFT`.
- Given missing required fields, the system shows validation errors and blocks translation submission.

### C. Generate Filipino Draft
- Given a complete English article in `DRAFT`, when the writer clicks `Submit for Translation`, the status becomes `TRANSLATING`.
- After translation completes successfully, a Filipino localization exists and the status becomes `NEEDS_REVIEW`.
- If translation fails, the English draft remains intact and editable, and the UI shows a clear retry path.

### D. Review
- Given an article in `NEEDS_REVIEW`, when the editor opens the review screen, English and Filipino content are shown side by side.
- Given generated QA issues, warnings are visible before the editor publishes.
- Given inline Filipino edits, the system saves them to `article_localizations` and marks `editorEdited = true`.

### E. Re-translate
- Given an article in `NEEDS_REVIEW`, when the editor clicks `Re-translate`, the system records a `retranslation_requested` audit event.
- After re-translation completes successfully, the Filipino localization is refreshed, QA checks run again, and the article remains in `NEEDS_REVIEW`.
- Re-translate is unavailable once an article has been published.

### F. Reject
- Given an article in `NEEDS_REVIEW`, when the editor clicks `Reject & Return to Writer`, a note is required.
- After rejection, the article returns to `DRAFT`.
- The rejection note is stored in `audit_logs.metadata.rejectionReason` and surfaced to the writer.

### G. Publish
- Given an article with English source content and a Filipino localization, when an editor clicks `Approve & Publish`, both `/en/articles/[slug]` and `/fil/articles/[slug]` become public together.
- The article status becomes `PUBLISHED`.
- The system writes both `article_approved` and `article_published` audit entries.
- A `publication_record` is created with both URLs plus pair-level `approvedBy`, `approvedAt`, and a shared `publishedAt` timestamp.
- Both public pages display their publish date from `publication_records.publishedAt`.

### H. Public article experience
- English and Filipino pages both render headline, deck, byline, publish date, category, hero image, image caption, and body.
- The Filipino page shows only `headline`, `deck`, and `body` as localized fields in the MVP; shared article metadata remains aligned with the English source.
- The language switcher links to the corresponding other-language route.
- The Filipino page displays the AI disclosure.

### I. Multilingual metadata
- Given a published English article page, the document exposes `lang="en"`, a canonical URL, and an alternate `hreflang="fil"` link to the Filipino route.
- Given a published Filipino article page, the document exposes `lang="fil"`, a canonical URL, and an alternate `hreflang="en"` link to the English route.
- Page titles and descriptions are derived from the localized content for their respective routes.

### J. Slug handling
- Given a new article whose generated slug already exists, the system creates a unique slug by appending a numeric suffix.
- Given a writer-edited slug that conflicts with an existing article, the system blocks save or prompts for a different unique slug.

### K. Glossary
- At least 10 seed glossary terms appear in the read-only glossary page.
- At least one glossary term demonstrably affects translation output in the demo.

---

## 22. Success Metrics

### Demo-level product metrics
- Time from complete English draft to bilingual publish
- Number of Filipino inline edits before publish
- Number of QA warnings surfaced before publish
- Glossary term consistency rate for seeded terms
- Successful publish rate without partial state

### Qualitative success signals
- A reviewer understands the workflow in under two minutes
- The side-by-side review screen immediately communicates editorial control
- The demo clearly shows why this is a newsroom workflow, not an autonomous AI product

---

## 23. Risks and Failure Modes

### 1. Translation errors
**Risk:** bad rendering of names, quotes, units, or tone  
**Mitigation:** glossary support, QA warnings, mandatory human review, inline edits

### 2. Partial publish state
**Risk:** only one language version goes live  
**Mitigation:** atomic publish mutation, shared publication record, backend validation

### 3. Ambiguous reject loop
**Risk:** writers do not know why an article was returned  
**Mitigation:** required rejection note, latest editor note visible in writer UI, and explicit guidance that `Re-translate` is for draft reruns while rejection is for source-level fixes

### 4. Scope creep
**Risk:** the team overbuilds collaboration, CMS integration, or AI sophistication  
**Mitigation:** narrow MVP boundaries and a five-day plan

### 5. Weak public article experience
**Risk:** the prototype feels like an admin panel instead of a publishing product  
**Mitigation:** polished article pages, language switcher, disclosure, metadata, realistic article layout

---

## 24. Tradeoffs and Why They Are Acceptable for This Challenge

### Standalone prototype instead of CMS integration
This is the right tradeoff because the challenge rewards clarity, practicality, flow, and tradeoffs. CMS integration adds significant engineering complexity while doing little to improve the core demo. A standalone prototype keeps the workflow legible and lets the team prove the idea cleanly.

### Four visible statuses instead of an extra `APPROVED` state
Keeping the state machine to `DRAFT → TRANSLATING → NEEDS_REVIEW → PUBLISHED` reduces complexity while preserving accountability through audit events. The editor’s approval still exists; it is simply recorded inside the publish action rather than shown as a separate status.

### Glossary support over custom AI experimentation
Glossary-backed consistency is more newsroom-relevant, easier to build, and easier to explain than custom model tuning in a five-day MVP.

### Shared image metadata in the MVP
Translating only headline, deck, and body keeps the implementation simpler and avoids contradicting the “no image translation” constraint. Hero image caption and alt text remain shared metadata until a later version. The public publish date is not treated as source metadata; it comes from the pair-level publish event recorded in `publication_records`.

### Reject-to-writer as the default correction loop
When a problem is about the English source, framing, or facts, sending the article back to the writer is better than letting editors repeatedly rerun translation in place. `Re-translate` still exists, but only as a fast recovery tool for minor machine-output issues while the source remains unchanged.

### Single-editor workflow
This excludes collaboration features, but it keeps permissions, UI, and demo flow simple enough for a student team to finish well.

---

## 25. 5-Day Implementation Plan for a Student Team

### Day 1 — Foundation
- Set up Next.js, Convex, Clerk, and Vercel
- Define schema
- Implement login and route protection
- Build article creation and draft saving

**Outcome:** authenticated draft creation works

### Day 2 — Translation pipeline
- Seed glossary terms
- Implement translation action
- Create Filipino localization records
- Add `DRAFT → TRANSLATING → NEEDS_REVIEW` flow

**Outcome:** English draft can produce a Filipino draft

### Day 3 — Review workflow
- Build side-by-side review UI
- Add QA warnings
- Add inline Filipino editing
- Add reject-with-note flow
- Implement `requestRetranslation` + re-run translation/QA for review-stage machine reruns only

**Outcome:** editor can review, reject, or prepare for publish

### Day 4 — Publish and public pages
- Implement atomic publish mutation
- Create `publication_records`
- Build English and Filipino public article pages
- Add language switcher and multilingual metadata

**Outcome:** both public routes go live together

### Day 5 — Polish and demo prep
- Improve UI and error handling
- Verify audit logs
- Test happy paths and obvious failure cases
- Seed demo content
- Rehearse demo script

**Outcome:** stable, understandable prototype ready for presentation

---

## 26. Demo Script for Presenting the Prototype

**Presenter:** [Name]  
**Duration:** ~8 minutes  
**Demo accounts:** use the currently configured writer and editor emails from `DEMO_WRITER_EMAILS` and `DEMO_EDITOR_EMAILS`

### Opening
> “Paraluman wants English and Filipino stories to go live together, but translation is slow and inconsistent. Sabay Publish fixes that with a human-in-the-loop workflow: AI drafts the Filipino version, an editor reviews it, and one action publishes both versions at the same time.”

### Step 1: Writer submits
- Log in as writer
- Create a new article
- Use “Commission on Elections” in the headline to trigger glossary behavior
- Include a date or some untranslated newsroom terms in the body so at least one QA warning is easy to point out in a local mock run
- Submit for translation
- Show the status moving out of `DRAFT`; on a fast local setup, `TRANSLATING` may flash briefly before the article settles in `NEEDS_REVIEW`

### Step 2: Editor reviews
- Log in as editor
- Open `/editor/queue`
- Open the review screen
- Point to English on the left and Filipino on the right
- Show the glossary term resolving correctly in the Filipino draft
- Show at least one QA warning; in local mock mode, leftover English is the most reliable example
- Demonstrate an inline Filipino edit

### Step 3: Optional reject loop
- Click `Reject & Return to Writer`
- Enter a short editor note such as: “Verify the number denomination in paragraph 2.”
- Show that the article returns to `DRAFT`
- Show the rejection note visible in the writer view
- Show that the intended next step is writer revision and resubmission when the source needs fixing
- Reopen the corrected review state after resubmission

### Step 4: Approve and publish
- Click `Approve & Publish`
- Open both `/en/articles/[slug]` and `/fil/articles/[slug]`
- Point to article layout, metadata, language switcher, and Filipino disclosure
- Switch languages live

### Step 5: Show accountability
- Re-open the article detail page in the editorial app
- Point to the in-app Workflow history entries for `translation_completed`, `article_approved`, and `article_published`
- Point to the published article pair summary with both URLs and the shared publish timestamp
- Mention that rejection notes and translation failures also appear in the same history

### Closing
> “Sabay Publish is not trying to replace editors. It is trying to give them a faster workflow with better safeguards. The AI does the first-pass translation. The editor makes the final call. That is what Paraluman’s AI policy requires, and that is what this prototype delivers.”

---

## 27. Appendix: 1-Page Design Note Summary

# Sabay Publish — Design Note

**Paraluman News Challenge | v2.5**

## What we built
Sabay Publish is a bilingual publishing workflow prototype that enables a small newsroom to publish English and Filipino news articles simultaneously. It is not an autonomous AI publishing tool. AI creates a first-pass Filipino draft; a human editor reviews, edits, and approves it before publication.

## The problem
Small youth newsrooms struggle to publish bilingual stories consistently. Translation happens late, review is informal, key terms drift, and one language version often goes live before the other.

## The solution
Sabay Publish gives the newsroom a clear workflow:
1. writer submits an English article,
2. system generates a Filipino draft with glossary support,
3. editor reviews side by side with QA warnings,
4. editor uses re-translate only for quick machine reruns, or rejects with a note when the source needs revision,
5. one action publishes both versions together.

## Why this is the right MVP
- It matches Paraluman’s AI policy.
- It uses AI as assistance, not replacement.
- It prioritizes glossary consistency over flashy AI experimentation.
- It keeps the state machine simple.
- It avoids CMS integration so the team can finish a polished demo in five days.

## Core status model
`DRAFT → TRANSLATING → NEEDS_REVIEW → PUBLISHED`

Approval is recorded in the audit trail inside the publish action.

## Stack
- Next.js
- Convex
- Clerk Auth
- Google Cloud Translation Advanced
- Tailwind CSS
- shadcn/ui
- Vercel

## Key product decisions
- Human approval is mandatory.
- Publish both or neither.
- Reject requires an editor note.
- Translate only headline, deck, and body in the MVP.
- Hero image caption and alt text remain shared metadata.
- The visible publish date comes from the publish record, not the draft article record.
- Filipino pages disclose AI assistance publicly.


## Visual direction
- Use Paraluman’s editorial brand cues from the supplied site screenshot and logo: official purple **`#73068e`**, white canvas, black typography, gray content blocks, purple section markers, and the supplied wordmark in key brand touchpoints.
- Use serif headlines for public-facing stories and sans-serif UI text for controls and metadata.
- Build screens with shadcn/ui primitives customized through Tailwind theme tokens instead of inventing a separate component system.
- Make public article pages feel like a newsroom product first, and an internal tool second.

## URLs
- `/en/articles/[slug]`
- `/fil/articles/[slug]`

## What makes it credible
This prototype is practical, defensible, newsroom-aware, and presentation-ready. It shows editorial control, reader transparency, recognizable Paraluman branding, and a realistic build scope for a student team.
