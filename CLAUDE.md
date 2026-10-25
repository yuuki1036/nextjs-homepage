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
npm run test:visual   # スクリーンショット比較 + コンソール検査（Docker 必須。next build から走る）
npm run test:visual:update  # 基準画像を更新する
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
- **スクリーンショット比較:** @playwright/test（ブラウザは公式 Docker イメージ）
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
├── tests/visual/       # スクリーンショット比較・コンソール検査（Playwright）
└── proxy.ts            # Next.js 16 Proxy（旧 middleware.ts）
```

## スクリーンショット比較（tests/visual/）

今の見た目を基準画像で固定し、内部実装の入れ替えで見た目がずれたら CI で落とす。

- 対象: 12 ページ × ja/en × light/dark × desktop/mobile の 96 枚（Chromium、DPR 1）と、desktop だけで回すコンソール検査 48 回。ページの目録は `tests/visual/support/site.ts`、撮影前の待ち合わせは `tests/visual/support/fixtures.ts` の `visit()`
- 仕組み: `next build` と `next start`（:3100）は手元で動かし、ブラウザだけを Playwright 公式イメージのコンテナ（run-server :3101）で動かす。CI は `ubuntu-24.04-arm` でジョブ全体を同じイメージの中で動かす（`visual` ジョブ）
- 前提: Apple Silicon の Mac で、Docker Desktop が起動していて、`npm ci` 済みであること（基準画像は arm64 の Chromium で作り、CI も `ubuntu-24.04-arm` で揃える）
- 日本語フォント: 公式イメージの既定は中国語の字形なので、`tests/visual/docker/local.conf` で IPA P ゴシックを優先させている

### 基準画像の更新手順

1. `npm run test:visual` で落ちたら、`npx playwright show-report` で差分を見る
2. 意図した変更なら `npm run test:visual:update` で書き直す。範囲を絞るときは `npm run test:visual:update -- --grep about` のように `--` の後ろに足す
3. `git status tests/visual/__screenshots__` で、変わった画像が意図した範囲だけか確かめる
4. 基準画像は変更と同じ PR に入れる

- 基準画像は手元の `npm run test:visual:update` でだけ作る。macOS の Chromium で直接走らせると config が止める。CI は基準画像を書かない
- CI で落ちたときは、artifact の `playwright-report` を取ってきて `npx playwright show-report <展開したディレクトリ>` で見る
- `@playwright/test` は `^` なしで固定する（イメージのタグと揃える）。上げる PR（Dependabot を含む）では、そのブランチで `npm ci` してから基準画像を作り直す
- ページを足すときは `site.ts` の `PAGES` に足して update する。ページを消したら、その基準画像も消す
- spec は `tests/visual/support/fixtures` の `test` を使う。コンソール検査で既知のエラーを除外する仕組みは作らない（例外は、status 404 のページでページ自体の 404 を Chromium が console error で知らせる 1 行だけ）

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

| エンドポイント  | メソッド | 説明                           |
| --------------- | -------- | ------------------------------ |
| `/api/sendMail` | POST     | bot 判定 + Resend でメール送信 |
| `/api/og`       | GET      | 動的 OG 画像生成               |

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
