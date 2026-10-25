import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env.CI);

// 基準画像は公式イメージの Chromium でだけ作る。
// 手元は tests/visual/docker/run.sh が run-server に繋ぎ（PW_TEST_CONNECT_WS_ENDPOINT）、
// CI はジョブ全体を公式イメージの中で動かす。
const viaRunServer = Boolean(process.env.PW_TEST_CONNECT_WS_ENDPOINT);
const inOfficialImage = process.env.PLAYWRIGHT_BROWSERS_PATH === "/ms-playwright";
if (!viaRunServer && !inOfficialImage) {
  throw new Error("ブラウザは Playwright 公式イメージで動かす。npm run test:visual を使う");
}

export default defineConfig({
  testDir: "./tests/visual",
  // 既定の {-snapshotSuffix} はランナーの OS（手元 darwin / CI linux）になり、名前が揃わない
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFileName}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  workers: isCI ? 2 : undefined,
  // 基準画像は --update-snapshots（npm run test:visual:update）を付けたときだけ書く
  updateSnapshots: "none",
  reporter: isCI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  expect: {
    timeout: 10_000,
    // 同じイメージの Chromium なら画素は決定的に揃う。既定の threshold 0.2 だと Tailwind 1 段の色の変化を見逃す
    toHaveScreenshot: { animations: "disabled", caret: "hide", scale: "css", threshold: 0 }
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    timezoneId: "Asia/Tokyo",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1
      }
    },
    {
      name: "mobile",
      testIgnore: /console\.spec\.ts$/,
      use: { ...devices["Pixel 5"], deviceScaleFactor: 1 }
    }
  ],
  webServer: {
    // npm run build は next-sitemap が git 管理下の public/sitemap*.xml を書き換えるので使わない
    command: `npx next build && npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/ja`,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
    // .env.local の値を build に取り込ませない（GA の ID と reCAPTCHA のキーを空にする。
    // gtag のスクリプト自体は読み込まれ、fixtures が空の応答を返す）
    env: { NEXT_PUBLIC_GA_ID: "", NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY: "" }
  }
});
