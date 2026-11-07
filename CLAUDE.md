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
npm run build         # 本番ビルド
npm run start         # 本番サーバー
npm run lint          # oxlint
npm run lint:fix      # oxlint --fix
npm run format        # oxfmt --write
npm run format:check  # oxfmt --check
npm run typecheck     # tsgo --noEmit
npm run test          # 単体テスト（Vitest）
npm run test:watch    # 単体テストを watch で回す
npm run test:visual   # スクリーンショット比較 + コンソール検査（Docker 必須。next build から走る）
npm run test:visual:update  # 基準画像を更新する
```

### コミット前（必須）

```bash
npm run pre-commit-check  # lint・format・型検査・単体テスト
```

## 技術スタック

- **フレームワーク:** Next.js 16 + React 19 + TypeScript 5 (tsgo)
- **スタイリング:** Tailwind CSS 4 + @tailwindcss/typography
- **フォーム:** react-hook-form + zod
- **テーマ:** next-themes（ダークモード）
- **チャート:** @amcharts/amcharts5（スキルツリー）
- **日付:** date-fns
- **OG画像:** next/og
- **Linter/Formatter:** oxlint + oxfmt
- **単体テスト:** Vitest（node 環境）
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
│   ├── layout.tsx      # ルートレイアウト
│   ├── robots.ts       # /robots.txt
│   └── sitemap.ts      # /sitemap.xml（静的ページは STATIC_PATHS を手で保守する）
├── components/         # React コンポーネント
├── lib/                # ユーティリティ、型、フック
│   ├── hook/           # カスタムフック
│   ├── locales/        # i18n 翻訳ファイル
│   └── testing/        # 単体テスト用の偽物（*.test.ts からだけ import する）
├── _posts/             # Works データ (JSON)
├── features/           # BDD spec（epic.md / spec.md。gitignore・ローカルのみ）
├── public/             # 静的アセット
│   ├── images/
│   └── favicons/
├── styles/             # グローバル CSS
├── tests/visual/       # スクリーンショット比較・コンソール検査（Playwright）
└── proxy.ts            # Next.js 16 Proxy（旧 middleware.ts）
```

## 単体テスト（Vitest）

問い合わせの入力の制約・bot 判定・送信上限と、sitemap / robots の出力を固める。CI は `test` ジョブで回す。

- 置き場所: テストはソースの隣に `*.test.ts` で置く（例: `lib/contact-guard.test.ts`、`app/api/sendMail/route.test.ts`）。`tests/visual/` の `*.spec.ts` は Playwright の担当なので、`vitest.config.mts` で対象から外している
- 外部サービス: `processSubmission` と route を通すテストの siteverify・Upstash REST の偽物は `lib/testing/contact-backend.ts` の 1 か所に置く。`verifyRecaptcha` の単体テストは、応答だけ返すスタブを `fetchFn` に直接渡す。Resend は `processSubmission` には `sendMail` を注入し、route では `vi.mock("resend")` で差し替える
- 時計: siteverify の応答は、判定と同じ時計で作る（`processSubmission` のテストは固定の `NOW`、route は `Date.now()`）。固定時刻の応答を route に流すと stale で隔離される
- 時間切れ: `verifyRecaptcha` は `timeoutMs` を注入して縮める。`processSubmission` を通す siteverify の 3 秒と Upstash の 1 秒は注入口が無く、fake timers も `AbortSignal.timeout` に効かないので実時間で待つ
- route: `lib/rate-limit` は IP ごとの状態を持つので、リクエストごとに `x-forwarded-for` を変える
- 期待値: 境界の数字（60/61 文字、20/50 件など）は spec の値をテストに直接書き、実装の定数を import しない

## スクリーンショット比較（tests/visual/）

今の見た目を基準画像で固定し、内部実装の入れ替えで見た目がずれたら CI で落とす。

- 対象: 13 ページ × ja/en × light/dark × desktop/mobile の 104 枚（Chromium、DPR 1）と、desktop だけで回すコンソール検査 52 回・status 検査（`status.spec.ts`）。ページの目録は `tests/visual/support/site.ts`、撮影前の待ち合わせは `tests/visual/support/fixtures.ts` の `visit()`
- 仕組み: `next build` と `next start`（:3100）は手元で動かし、ブラウザだけを Playwright 公式イメージのコンテナ（run-server :3101）で動かす。CI は `ubuntu-24.04-arm` でジョブ全体を同じイメージの中で動かす（`visual` ジョブ）
- 前提: Apple Silicon の Mac で、Docker Desktop が起動していて、`npm ci` 済みであること（基準画像は arm64 の Chromium で作り、CI も `ubuntu-24.04-arm` で揃える）
- 日本語フォント: 公式イメージの既定は中国語の字形なので、`tests/visual/docker/local.conf` で IPA P ゴシックを優先させている

### 基準画像の更新手順

1. `npm run test:visual` で落ちたら、`npx playwright show-report` で差分を見る
2. 意図した変更なら `npm run test:visual:update` で書き直す。範囲を絞るときは `npm run test:visual:update -- --grep about` のように `--` の後ろに足す
3. `git status tests/visual/__screenshots__` で、変わった画像が意図した範囲だけか確かめる
4. 基準画像は変更と同じ PR に入れる

- 基準画像は、手元の `npm run test:visual:update` か、下の「PR からの作り直し」でだけ作る。macOS の Chromium で直接走らせると config が止める。PR の `visual` は基準画像を書かない
- CI で落ちたときは、PR に付く「visual の差分」のコメント（`ci.yml` の `visual-summary`）で、変わった画像と画素数を差分の大きい順に見る。画像そのものは artifact の `playwright-report` を取ってきて `npx playwright show-report <展開したディレクトリ>` で見る

### PR からの作り直し（依存の更新の PR など）

手元にブランチを取り出さずに、基準画像を作り直して PR に push する（`.github/workflows/visual-refresh.yml`）。

1. PR の「visual の差分」のコメントと `playwright-report` で差分を見て、受け入れるか決める
2. 受け入れるなら、Actions の Visual refresh を Run workflow で PR 番号を入れて走らせる（`gh workflow run visual-refresh.yml -f pr=<番号>`）
3. 作り直したコミットが PR に push され、続けて CI が PR のブランチで走り直す。必須チェックが揃えば、auto-merge の付いた PR はそのまま merge される想定（`workflow_dispatch` の結果で必須チェックが揃うかは、最初に使う PR で確かめる）

- 走らせられるのは repo の owner だけで、扱う PR は、Dependabot か owner がこの repo のブランチから出したものだけ。閾値は 0 のままにし、作り直しは自動では走らせない（2026-11-07 決定）
- main より古い PR は、main を merge してから作り直す（必須チェックの `test` ジョブや `ci.yml` の `workflow_dispatch` が無い PR があるため）。衝突したら止まるので、PR を rebase（Dependabot は `@dependabot rebase`）してから走らせ直す
- 画像の比較以外（コンソール検査・status 検査）でも落ちる PR は作り直さない。変わった画像が無ければ push しない
- `GITHUB_TOKEN` の push では `pull_request` のワークフローが起きないので、作り直しの最後に `ci.yml` を PR のブランチで `workflow_dispatch` で呼ぶ
- PR のコードを動かすジョブ（`regenerate`）は読み取りの権限だけで動かし、push するジョブはコードを動かさず、受け取った tar が基準画像の png だけかを確かめてから commit する
- `@playwright/test` は `^` なしで固定する（イメージのタグと揃える）。上げる PR で `visual` が落ちたら、そのブランチで `npm ci` してから基準画像を作り直す。Dependabot の patch は単独の PR で届き、`visual` が通れば自動で merge される（通ったなら基準画像は変わらない）
- ページを足すときは `site.ts` の `PAGES` に足して update する。ページを消したら、その基準画像も消す
- spec は `tests/visual/support/fixtures` の `test` を使う。コンソール検査で既知のエラーを除外する仕組みは作らない（例外は、status 404 のページでページ自体の 404 を Chromium が console error で知らせる 1 行だけ）

## Next.js 16 固有

- `middleware.ts` は `proxy.ts` にリネーム
- `proxy()` 関数をエクスポート
- CSP nonce 生成 + 言語リダイレクト + `x-locale` ヘッダー設定を担当
- API や規約は学習データと違うことがあるので、`node_modules/next/dist/docs/` の同梱 docs で確かめる（インストール済みの版と一致するので context7 より優先する。`next.config.js` の `agentRules: false` で、`next dev` が同じ案内の `AGENTS.md` を作るのを止めている）

## ページ

| パス            | ファイル                             | 説明         |
| --------------- | ------------------------------------ | ------------ |
| `/`             | `app/[locale]/page.tsx`              | ホーム       |
| `/about`        | `app/[locale]/about/page.tsx`        | About        |
| `/works`        | `app/[locale]/works/page.tsx`        | Works 一覧   |
| `/works/[slug]` | `app/[locale]/works/[slug]/page.tsx` | Works 詳細   |
| `/service`      | `app/[locale]/service/page.tsx`      | サービス詳細 |
| `/contact`      | `app/[locale]/contact/page.tsx`      | お問い合わせ |

ページを足す・消す・パスを変えるときは、`app/sitemap.ts` の `STATIC_PATHS`、`app/sitemap.test.ts` の `STATIC_PATHS`、`tests/visual/support/site.ts` の `PAGES` の 3 か所を直す（`STATIC_PATHS` は `/sitemap.xml` に載せるため）。`app/sitemap.test.ts` は固定ページの URL（トップ・`/about`・`/contact`・`/service`・`/works`）と Works の `hitokoto`・`netfjix` も `it.each` で名前を挙げて確かめている。それらを消す・パスを変えるときは同じファイルの `it.each` も直す。Works 詳細は sitemap には `_posts/` から自動で入るが、`tests/visual/support/site.ts` の `WORKS_SLUGS` は手で書いているので、Works を足す・消すときはここも直して `test:visual:update` する。

## API Routes

| エンドポイント  | メソッド | 説明                           |
| --------------- | -------- | ------------------------------ |
| `/api/sendMail` | POST     | bot 判定 + Resend でメール送信 |
| `/api/og`       | GET      | 動的 OG 画像生成               |

## セキュリティ

- **CSP:** nonce ベース（`proxy.ts`）
- **レート制限:** `lib/rate-limit.ts`（IP 単位・インメモリ）。自動返信と隔離通知の 1 日の送信上限は Upstash で数え、Upstash が使えないときは自動返信を送らない
- **入力検証:** zod。問い合わせの入力の制約は `lib/contact-schema.ts` の 1 つのスキーマを、フォームと `/api/sendMail` で共有する
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
