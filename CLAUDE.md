# CLAUDE.md

## indie-workflow（slug: `hp`）

Issue: `.claude/indie/hp/issues/HP-N.md` | Knowledge: `.claude/indie/hp/knowledge/`
過去の `.claude/plans/` は参照用アーカイブ。新規作成しない。

---

## プロジェクト概要

フリーランスエンジニアのポートフォリオ兼ビジネスサイト。Next.js 16 で構築。
対応言語: `ja`, `en`（`app/[locale]/` によるパスベース i18n）

## 開発コマンド

```bash
npm run dev           # 開発サーバー (localhost:3000)
npm run build         # 本番ビルド + サイトマップ生成
npm run start         # 本番サーバー
npm run lint          # oxlint
npm run lint:fix      # oxlint --fix
npm run format        # oxfmt --write
npm run format:check  # oxfmt --check
npm run typecheck     # tsgo --noEmit
```

### コミット前（必須）

```bash
npm run pre-commit-check
```

## 技術スタック

- **フレームワーク:** Next.js 16 + React 19 + TypeScript 5 (tsgo)
- **スタイリング:** Tailwind CSS 4 + @tailwindcss/typography
- **フォーム:** react-hook-form + zod
- **テーマ:** next-themes（ダークモード）
- **チャート:** @amcharts/amcharts5（スキルツリー）
- **データ取得:** swr
- **日付:** date-fns
- **OG画像:** @vercel/og
- **Linter/Formatter:** oxlint + oxfmt
- **外部サービス:** Resend, Google reCAPTCHA v3, Upstash Redis（自動返信・隔離通知の送信上限）, Google Analytics, Vercel Analytics

## ディレクトリ構造

```text
nextjs-homepage/
├── app/                # App Router
│   ├── [locale]/       # i18n ルーティング (ja, en)
│   │   ├── page.tsx    # ホーム
│   │   ├── about/
│   │   ├── contact/
│   │   ├── service/
│   │   └── works/
│   ├── api/            # API Routes
│   │   ├── sendMail/
│   │   ├── recaptcha/
│   │   └── og/
│   └── layout.tsx      # ルートレイアウト
├── components/         # React コンポーネント
├── lib/                # ユーティリティ、型、フック
│   ├── hook/           # カスタムフック
│   └── locales/        # i18n 翻訳ファイル
├── _posts/             # Works データ (JSON)
├── features/           # BDD spec（epic.md / spec.md。gitignore・ローカルのみ）
├── public/             # 静的アセット
│   ├── images/
│   └── favicons/
├── styles/             # グローバル CSS
└── proxy.ts            # Next.js 16 Proxy（旧 middleware.ts）
```

## Next.js 16 固有

- `middleware.ts` は `proxy.ts` にリネーム
- `proxy()` 関数をエクスポート
- CSP nonce 生成 + 言語リダイレクト + `x-locale` ヘッダー設定を担当

## ページ

| パス            | ファイル                             | 説明         |
| --------------- | ------------------------------------ | ------------ |
| `/`             | `app/[locale]/page.tsx`              | ホーム       |
| `/about`        | `app/[locale]/about/page.tsx`        | About        |
| `/works`        | `app/[locale]/works/page.tsx`        | Works 一覧   |
| `/works/[slug]` | `app/[locale]/works/[slug]/page.tsx` | Works 詳細   |
| `/service`      | `app/[locale]/service/page.tsx`      | サービス詳細 |
| `/contact`      | `app/[locale]/contact/page.tsx`      | お問い合わせ |

## API Routes

| エンドポイント   | メソッド | 説明                           |
| ---------------- | -------- | ------------------------------ |
| `/api/sendMail`  | POST     | bot 判定 + Resend でメール送信 |
| `/api/recaptcha` | POST     | 互換スタブ（削除予定）         |
| `/api/og`        | GET      | 動的 OG 画像生成               |

## セキュリティ

- **CSP:** nonce ベース（`proxy.ts`）
- **レート制限:** `lib/rate-limit.ts`（IP 単位・インメモリ）。自動返信と隔離通知の 1 日の送信上限は Upstash で数え、Upstash が使えないときは自動返信を送らない
- **入力検証:** zod
- **bot 判定:** `lib/contact-guard.ts` / `lib/recaptcha.ts`（理由コードが付いた問い合わせは拒否せず隔離）
- **セキュリティヘッダー:** `headers()`（`next.config.js`）

## コーディング規約

- **Formatter:** oxfmt（ダブルクォート、タブ幅 2、トレーリングカンマなし）
- **Linter:** oxlint
- **ダークモード:** Tailwind CSS class 戦略（next-themes）
- **PR タイトル:** 英語

## 画像ルール

Works 画像は `public/images/works/` に配置:

- `{slug}-main.png` - メイン画像（必須）
- `{slug}-preview.png` - プレビュー画像（必須）
- `{slug}-add.png` - 追加画像（`otherImage: true` の場合）

## 環境変数

`.env.example` を参照。問い合わせフォームの bot 判定と送信上限は次を読む（`lib/contact-guard.ts`）:

| 変数                                                                                                    | 既定値                            | 用途                                                                                    |
| ------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN`（または `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`） | なし                              | 送信上限のカウンタ。未設定だと自動返信が止まる                                          |
| `RECAPTCHA_ALLOWED_HOSTNAMES`                                                                           | `yuuki1036.com,www.yuuki1036.com` | siteverify の hostname の許可リスト。Preview やローカルで合格経路を通すときに上書きする |
| `RECAPTCHA_MIN_SCORE`                                                                                   | `0.5`                             | reCAPTCHA の合格スコア                                                                  |
| `CONTACT_HONEYPOT_FIELD`                                                                                | `subject`                         | ハニーポット欄の name                                                                   |
| `CONTACT_RANDOM_ALPHA_MIN_LENGTH` / `CONTACT_RANDOM_ALPHA_MIN_CASE`                                     | `12` / `3`                        | ランダム英字判定のしきい値                                                              |
