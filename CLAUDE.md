# CLAUDE.md

Claude Code がこのリポジトリで作業する際のガイダンス。

---

## 最重要事項: プラン管理

**タスク実行時は必ず以下のルールに従うこと:**

1. **タスク開始時:** `.claude/plans/{plan-name}.md` を作成し、Plan Mode でプランを生成する
2. **「plan 更新」と言われたら:** 該当するプランファイルにセッションの進捗を反映させる
3. **新規セッション開始時:** 現在のブランチ名から該当するプランファイルを読み出し、進捗を確認してから作業を再開する

**ブランチ名の構成：{type}/{task-name}** として扱う。

---

## プロジェクト概要

Next.js 16 を使用したポートフォリオ・ビジネスサイト。フリーランスエンジニア (yuuki1036) の作品紹介とサービス提供を目的としたサイト。

**本番 URL:** https://yuuki1036.com

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # 本番ビルド + サイトマップ生成
npm run start    # 本番サーバー起動
npm run lint     # ESLint 実行
```

## 技術スタック

- **フレームワーク:** Next.js 16.1.1 + React 19.0.0 + TypeScript 5.x
- **スタイリング:** Tailwind CSS 3.2.4 + @tailwindcss/typography
- **フォーム:** react-hook-form 7.71.0 + yup 0.32.11 バリデーション
- **テーマ:** next-themes 0.2.1 (ダークモード)
- **グラフ:** @amcharts/amcharts5 (スキルツリー表示)
- **データ取得:** swr 2.0.0
- **日付処理:** date-fns 2.29.3
- **OG 画像:** @vercel/og 0.8.6
- **外部サービス:** SendGrid (メール), Google reCAPTCHA v3, Google Analytics, Vercel Analytics

## ディレクトリ構造

```
nextjs-homepage/
├── pages/              # Next.js ページ
│   ├── api/            # API Routes
│   ├── works/          # 作品詳細ページ (動的ルート)
│   └── *.tsx           # 各ページ
├── components/         # React コンポーネント
├── layouts/            # レイアウトコンポーネント
├── lib/                # ユーティリティ、型、フック
│   ├── hook/           # カスタムフック
│   └── locales/        # 多言語翻訳データ
├── _posts/             # 作品データ (JSON)
├── public/             # 静的アセット
│   ├── images/         # 画像ファイル
│   │   ├── works/      # 作品画像 ({slug}-main.png, {slug}-preview.png, {slug}-add.png)
│   │   └── service/    # サービス紹介画像
│   └── favicons/       # ファビコン
└── styles/             # グローバルCSS
```

## ページ一覧

| パス            | ファイル                 | 説明                                              |
| --------------- | ------------------------ | ------------------------------------------------- |
| `/`             | `pages/index.tsx`        | ホーム: プロフィール、特集作品 3 件、サービス紹介 |
| `/about`        | `pages/about.tsx`        | 自己紹介: スキルマップ、資格、リンク              |
| `/works`        | `pages/works.tsx`        | 作品一覧: 全作品をカード表示                      |
| `/works/[slug]` | `pages/works/[slug].tsx` | 作品詳細: 動的ルート、静的生成                    |
| `/service`      | `pages/service.tsx`      | サービス詳細: HP 作成、EC 構築、業務システム      |
| `/contact`      | `pages/contact.tsx`      | お問い合わせフォーム                              |
| `/404`          | `pages/404.tsx`          | 404 エラーページ                                  |

## API Routes

| エンドポイント   | メソッド | 説明                  |
| ---------------- | -------- | --------------------- |
| `/api/sendMail`  | POST     | SendGrid でメール送信 |
| `/api/recaptcha` | POST     | reCAPTCHA v3 検証     |
| `/api/og`        | GET      | OG 画像動的生成       |

## コンポーネント一覧

### レイアウト系

- `Container.tsx` - メインレイアウト、ナビ、OGP 設定、言語切替
- `Footer.tsx` - フッター
- `MobileMenu.tsx` - モバイル用ドロワーメニュー

### フォーム系

- `ContactForm.tsx` - お問い合わせフォーム (yup バリデーション、reCAPTCHA)
- `LoadingSpinner.tsx` - ローディングスピナー

### 作品表示系

- `WorksCard.tsx` - 作品一覧カード
- `WorksFeatuteCard.tsx` - 特集作品カード (ホームページ用)
- `WorksItemTitle.tsx` - 作品詳細タイトル
- `WorksItemMainImage.tsx` - メイン画像 (launch/source リンク付き)
- `WorksItemNormal.tsx` - 概要・開発経緯セクション
- `WorksItemOtherImage.tsx` - 追加画像
- `WorksItemSpec.tsx` - 仕様テーブル

### その他

- `ServiceCard.tsx` - サービス紹介カード
- `SkillMap.tsx` - amcharts5 スキルツリー
- `ExternalLink.tsx` / `ExternalLinkIcon.tsx` - 外部リンク
- `Image.tsx` - Next.js Image ラッパー
- `Tag.tsx` - タグ表示

## lib/ 詳細

### 型定義 (`lib/types.ts`)

```typescript
TMeta, TCustomMeta; // メタ情報
TSpec; // 仕様 (key-value)
TWorks, TFeatureWorks; // 作品データ
TForm, TFormState; // フォーム状態
TInput; // フォーム入力
```

### API 操作 (`lib/api.ts`)

- `getPostSlugs()` - \_posts のファイル一覧取得
- `getPostBySlug(slug)` - JSON 読み込み → TWorks
- `getAllPosts()` - 全作品を date 降順ソート

### カスタムフック (`lib/hook/`)

- `useLocale.ts` - ロケール (en/ja) と翻訳テキスト取得
- `usePageView.ts` - GA ページビュー送信
- `useDelayedRender.ts` - 遅延レンダリング

### 定数 (`lib/constants.ts`)

- `SITE_NAME`, `MY_NAME`: "yuuki1036"
- `URL`: "https://yuuki1036.com"
- `FEATURE_WORKS`: 特集作品 3 件
- `SKILL_MAP_DATA`: スキルツリーデータ

### 多言語 (`lib/locales/`)

- `ja.ts` - 日本語翻訳
- `en.ts` - 英語翻訳

## 作品データ構造 (`_posts/*.json`)

```typescript
{
  title: string             // タイトル
  excerpt: string           // 概要 (日本語)
  excerptEn: string         // 概要 (英語)
  featureTitle?: string     // 特集用タイトル
  otherImage: boolean       // 追加画像の有無
  date: string              // 作成日 (YYYY-MM-DD)
  launch?: string           // 公開 URL
  source?: string           // GitHub URL
  tag: string[]             // タグ配列
  overView: string[]        // 概要 (複数段落)
  overViewEn: string[]      // 概要 英語
  chronology?: string[]     // 開発経緯
  spec: { [key]: string }   // 仕様 (Platform, Language 等)
  others?: string[]         // その他情報
  gradient?: string         // 特集カード用グラデーション
}
```

## 多言語対応

- Next.js i18n ルーター (`next.config.js`)
- デフォルト: `ja` (日本語)
- 対応言語: `ja`, `en`
- 使用方法: `useLocale()` フックで `{ locale, t }` 取得

## データフロー

```
作品一覧:
_posts/*.json → lib/api.ts (getAllPosts) → pages/works.tsx → WorksCard.tsx

作品詳細:
_posts/{slug}.json → lib/api.ts (getPostBySlug) → pages/works/[slug].tsx → layouts/works.tsx → WorksItem*.tsx
```

## コード規約

- **Prettier:** ダブルクォート、Tab 幅 2、trailing comma なし
- **Linter:** oxlint
- **ダークモード:** Tailwind CSS class 方式 (next-themes)
- **PR タイトル:** 英語で記述

## 画像配置ルール

作品画像は `public/images/works/` に配置:

- `{slug}-main.png` - メイン画像 (必須)
- `{slug}-preview.png` - プレビュー画像 (必須)
- `{slug}-add.png` - 追加画像 (`otherImage: true` の場合)

## 環境変数

### 本番環境で必要

```bash
# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY  # クライアントキー
RECAPTCHA_SERVER_SECRET_KEY       # サーバーシークレット

# Google Analytics
NEXT_PUBLIC_GA_ID                 # GA ID

# SendGrid メール
SENDGRID_API_KEY                  # API キー
MAIL_FROM                         # 送信元アドレス
MAIL_ADDRESS                      # 送信先アドレス
LAST_NAME                         # 送信者姓
FIRST_NAME                        # 送信者名
PHONE_NUMBER                      # 電話番号
```

## 設定ファイル

| ファイル             | 説明                                           |
| -------------------- | ---------------------------------------------- |
| `next.config.js`     | Next.js 設定 (i18n)                            |
| `tailwind.config.js` | Tailwind CSS 設定 (カスタムカラー, typography) |
| `tsconfig.json`      | TypeScript 設定 (strict: true)                 |
| `sitemap.config.js`  | サイトマップ生成設定                           |
