# Node.js 24 & Next.js 16 アップグレード計画

## 概要

Node.js を 24 に、Next.js を最新 (16.x) にアップグレードする。

## 現状

| 項目 | 現在 | 変更後 |
|------|------|--------|
| Node.js | >=20 | 24 |
| Next.js | 13.1.1 | 16.x (latest) |
| React | 18.2.0 | 19.x (Next.js 16 の要件) |
| mise 設定 | なし | .mise.toml 作成 |

## 変更内容

### 1. mise 設定ファイルの作成

- [ ] `.mise.toml` を作成し Node.js 24 を指定

### 2. package.json の更新

- [ ] `engines.node` を `>=24` に変更
- [ ] Next.js を最新版に更新
- [ ] React / React DOM を 19.x に更新
- [ ] 関連する依存パッケージを更新
  - `@next/font` → `next/font` に移行（Next.js 13.2+ で組み込み）
  - `eslint-config-next` を Next.js バージョンに合わせる
  - `@types/node`, `@types/react`, `@types/react-dom` を更新

### 3. コードの修正（必要に応じて）

- [ ] `@next/font` のインポートを `next/font` に変更
- [ ] 非推奨 API があれば修正

### 4. 動作確認

- [ ] `npm install` で依存関係の再インストール
- [ ] `npm run build` でビルド確認
- [ ] `npm run lint` で lint 確認
- [ ] `npm run dev` で開発サーバー起動確認

## 注意事項

- Next.js 15+ は React 19 を要求する
- Pages Router は引き続きサポートされている
- `@next/font` は削除され `next/font` に統合済み

## 進捗

- [ ] 未着手
