import { configDefaults, defineConfig } from "vitest/config";

// ロジックの単体テスト。テストはソースの隣に *.test.ts で置く。
// tests/visual/ は Playwright（*.spec.ts、npm run test:visual）の担当なので外す
export default defineConfig({
  // tsconfig の paths（lib/* など）を Vite の組み込みで解決する（別名の表を二重に持たない）
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    // .claude/ には worktree を置くことがある（中のテストまで拾わない）
    exclude: [...configDefaults.exclude, "tests/visual/**", ".claude/**"],
    // テストごとに mock・env・global を元に戻す
    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true
  }
});
