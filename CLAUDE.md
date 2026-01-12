# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 13 を使用したポートフォリオ・ビジネスサイト。フリーランスエンジニアの作品紹介とサービス提供を目的としたサイト。

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # 本番ビルド + サイトマップ生成
npm run start    # 本番サーバー起動
npm run lint     # ESLint 実行
```

## 技術スタック

- **フレームワーク:** Next.js 13.1.1 + React 18 + TypeScript
- **スタイリング:** Tailwind CSS (class方式ダークモード)
- **フォーム:** react-hook-form + yup バリデーション
- **外部サービス:** SendGrid (メール), Google reCAPTCHA v3, Google Analytics

## アーキテクチャ

### ページレンダリング
- 静的生成 (getStaticProps/getStaticPaths) で Works ページを事前生成
- `_posts/` 配下の JSON ファイルから作品データを読み込み

### 多言語対応 (日本語/英語)
- Next.js i18n ルーター (`next.config.js` で設定)
- `lib/hook/useLocale.ts` でロケール取得
- `lib/locales/ja.ts`, `lib/locales/en.ts` に翻訳テキスト

### API Routes
- `POST /api/sendMail` - お問い合わせメール送信
- `POST /api/recaptcha` - reCAPTCHA 検証
- `GET /api/og` - OG 画像動的生成 (@vercel/og)

### 主要コンポーネント
- `Container.tsx` - メインレイアウト、ナビ、OGP 設定、言語切替
- `ContactForm.tsx` - フォーム入力、バリデーション、reCAPTCHA、メール送信
- `SkillMap.tsx` - amcharts5 を使用したスキルツリー

### データフロー
- 作品データ: `_posts/*.json` → `lib/api.ts` → ページコンポーネント
- 定数・スキルデータ: `lib/constants.ts`
- 型定義: `lib/types.ts`

## コード規約

- Prettier: ダブルクォート、Tab 幅 2、trailing comma なし
- ESLint: next/core-web-vitals ルール

## 環境変数

本番環境で必要:
- `NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY` - reCAPTCHA クライアントキー
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `SENDGRID_API_KEY` - SendGrid API キー
- `MAIL_FROM`, `MAIL_ADDRESS` - メール送信設定
