#!/usr/bin/env bash
# スクリーンショット比較とコンソール検査を手元で回す。
# ブラウザだけを Playwright 公式イメージのコンテナで動かし（run-server）、
# next build / next start とテストランナーは手元で動かす。
# 引数はそのまま `playwright test` に渡す（例: --grep about）。
set -euo pipefail

cd "$(dirname "$0")/../../.."

ws_port=3101

# イメージのタグと node_modules の版を揃える（^ を付けると run-server と版がずれる）
version="$(node -p 'require("./package.json").devDependencies["@playwright/test"]')"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "package.json の @playwright/test は ^ なしの x.y.z で固定する（今: $version）" >&2
  exit 1
fi
if ! installed="$(node -p 'require("@playwright/test/package.json").version' 2>/dev/null)"; then
  echo "@playwright/test が入っていない。npm ci を実行する" >&2
  exit 1
fi
if [[ "$installed" != "$version" ]]; then
  echo "node_modules の @playwright/test が $installed で、package.json の $version と違う。npm ci を実行する" >&2
  exit 1
fi

image="mcr.microsoft.com/playwright:v${version}-noble"

# 起動に失敗したコンテナも消せるよう、名前を決めて trap を先に張る
container="pw-visual-$$"
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT

# 基準画像は arm64 の Chromium で作る（手元は Apple Silicon、CI も ubuntu-24.04-arm）。
# -i が無いと stdin が閉じて run-server が終わる
docker run -d -i --name "$container" --platform linux/arm64 --init --ipc=host \
  -p "127.0.0.1:${ws_port}:${ws_port}" \
  -v "$PWD/tests/visual/docker/local.conf:/etc/fonts/local.conf:ro" \
  --user pwuser --workdir /home/pwuser \
  "$image" \
  npx -y "playwright@${version}" run-server --port "$ws_port" --host 0.0.0.0 >/dev/null

ready=0
# 120 秒は、毎回 npx が playwright を取得する時間を含む
for _ in $(seq 1 120); do
  if [[ "$(docker inspect -f '{{.State.Running}}' "$container")" != "true" ]]; then
    break
  fi
  if [[ "$(docker logs "$container" 2>&1)" == *"Listening on"* ]]; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "$ready" != 1 ]]; then
  echo "run-server が起動しなかった" >&2
  docker logs "$container" >&2 || true
  exit 1
fi

if ! font="$(docker exec "$container" fc-match "sans-serif:lang=ja")"; then
  echo "コンテナで fc-match を実行できなかった" >&2
  docker logs "$container" >&2 || true
  exit 1
fi
if [[ "$font" != *IPAPGothic* ]]; then
  echo "コンテナの sans-serif:lang=ja が IPAPGothic になっていない（local.conf を確かめる）" >&2
  exit 1
fi

PW_TEST_CONNECT_WS_ENDPOINT="ws://127.0.0.1:${ws_port}/" \
  PW_TEST_CONNECT_EXPOSE_NETWORK="<loopback>" \
  npx playwright test "$@"
