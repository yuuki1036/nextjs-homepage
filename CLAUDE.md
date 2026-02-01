# CLAUDE.md

## Important: Plan Management

**Follow these rules when executing tasks:**

1. **Task start:** Create `.claude/plans/{plan-name}.md` and generate a plan in Plan Mode
2. **On "update plan":** Reflect session progress in the corresponding plan file
3. **New session start:** Read the plan file matching the current branch name and resume work

**Branch naming:** `{type}/{task-name}`

---

## Project Overview

Portfolio and business website built with Next.js 16 for a freelance engineer.

## Development Commands

```bash
npm run dev           # Dev server (localhost:3000)
npm run build         # Production build + sitemap
npm run start         # Production server
npm run lint          # oxlint
npm run lint:fix      # oxlint --fix
npm run format        # oxfmt --write
npm run format:check  # oxfmt --check
npm run typecheck     # tsgo --noEmit
```

### After Code Changes

```bash
npm run lint && npm run format && npm run build
```

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript 5 (tsgo)
- **Styling:** Tailwind CSS 4 + @tailwindcss/typography
- **Form:** react-hook-form + zod validation
- **Theme:** next-themes (dark mode)
- **Charts:** @amcharts/amcharts5 (skill tree)
- **Data Fetching:** swr
- **Date:** date-fns
- **OG Image:** @vercel/og
- **Linter/Formatter:** oxlint + oxfmt
- **External Services:** SendGrid, Google reCAPTCHA v3, Google Analytics, Vercel Analytics

## Directory Structure

```text
nextjs-homepage/
├── app/                # Next.js App Router
│   ├── [locale]/       # i18n routing
│   │   ├── page.tsx    # Home
│   │   ├── about/
│   │   ├── contact/
│   │   ├── service/
│   │   └── works/
│   ├── api/            # API Routes
│   │   ├── sendMail/
│   │   ├── recaptcha/
│   │   └── og/
│   └── layout.tsx      # Root layout
├── components/         # React components
├── lib/                # Utilities, types, hooks
│   ├── hook/           # Custom hooks
│   └── locales/        # i18n translations
├── _posts/             # Works data (JSON)
├── public/             # Static assets
│   ├── images/
│   └── favicons/
├── styles/             # Global CSS
└── proxy.ts            # Next.js 16 Proxy (formerly middleware.ts)
```

## Next.js 16 Notes

- `middleware.ts` renamed to `proxy.ts`
- Export `proxy()` function

## Pages

| Path            | File                                 | Description    |
| --------------- | ------------------------------------ | -------------- |
| `/`             | `app/[locale]/page.tsx`              | Home           |
| `/about`        | `app/[locale]/about/page.tsx`        | About          |
| `/works`        | `app/[locale]/works/page.tsx`        | Works list     |
| `/works/[slug]` | `app/[locale]/works/[slug]/page.tsx` | Work detail    |
| `/service`      | `app/[locale]/service/page.tsx`      | Service detail |
| `/contact`      | `app/[locale]/contact/page.tsx`      | Contact form   |

## API Routes

| Endpoint         | Method | Description                 |
| ---------------- | ------ | --------------------------- |
| `/api/sendMail`  | POST   | Send email via SendGrid     |
| `/api/recaptcha` | POST   | reCAPTCHA v3 verification   |
| `/api/og`        | GET    | Dynamic OG image generation |

## Security

- **CSP:** Nonce-based Content-Security-Policy in `proxy.ts`
- **Rate Limiting:** `lib/rate-limit.ts` (in-memory)
- **Input Validation:** zod
- **Sanitization:** `sanitizeInput()` in `lib/util.ts`
- **Security Headers:** `headers()` in `next.config.js`

## Code Standards

- **Formatter:** oxfmt (double quotes, tab width 2, no trailing comma)
- **Linter:** oxlint
- **Dark Mode:** Tailwind CSS class strategy (next-themes)
- **PR Titles:** English

## Image Rules

Work images in `public/images/works/`:

- `{slug}-main.png` - Main image (required)
- `{slug}-preview.png` - Preview image (required)
- `{slug}-add.png` - Additional image (if `otherImage: true`)

## Environment Variables

See `.env.example`.
