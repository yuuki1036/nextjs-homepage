import { describe, expect, it } from "vitest";
import {
  classify,
  MARKER,
  renderFailure,
  renderNoResults,
  renderSuccess,
  type Report
} from "./visual-summary";

// メッセージは Playwright 1.64 の toHaveScreenshot が JSON reporter に出す形（色付き）を写す
const ESC = String.fromCharCode(27);
const header = `Error: ${ESC}[2mexpect(${ESC}[22m${ESC}[31mpage${ESC}[39m${ESC}[2m).${ESC}[22mtoHaveScreenshot${ESC}[2m(${ESC}[22m${ESC}[32mexpected${ESC}[39m${ESC}[2m)${ESC}[22m failed\n\n`;
const pixelsMessage = (pixels: number, ratio: string, name: string) =>
  `${header}  ${pixels} pixels (ratio ${ratio} of all image pixels) are different.\n\n  Snapshot: ${name}\n\nCall log:\n`;
const sizeMessage = (name: string) =>
  `${header}  Expected an image 1280px by 1335px, received 1280px by 1817px. 1086146 pixels (ratio 0.47 of all image pixels) are different.\n\n  Snapshot: ${name}\n`;
const missingMessage = (project: string, name: string) =>
  `Error: A snapshot doesn't exist at /__w/repo/repo/tests/visual/__screenshots__/screenshot.spec.ts/${project}/${name}.\n`;

const failed = (projectName: string, message: string) => ({
  projectName,
  status: "unexpected",
  results: [{ errors: [{ message: "前の試行のエラー" }] }, { errors: [{ message }] }]
});

const report: Report = {
  suites: [
    {
      title: "screenshot.spec.ts",
      suites: [
        {
          title: "light",
          specs: [
            {
              title: "home ja",
              tests: [failed("desktop", pixelsMessage(120, "0.01", "home-ja-light.png"))]
            },
            {
              title: "home en",
              tests: [failed("mobile", pixelsMessage(4500, "0.02", "home-en-light.png"))]
            },
            { title: "about ja", tests: [failed("desktop", sizeMessage("about-ja-light.png"))] },
            {
              title: "about en",
              tests: [failed("mobile", missingMessage("mobile", "about-en-light.png"))]
            },
            {
              title: "works ja",
              tests: [{ projectName: "desktop", status: "expected", results: [{}] }]
            },
            {
              title: "works en",
              tests: [{ projectName: "desktop", status: "flaky", results: [{}] }]
            }
          ]
        }
      ]
    },
    {
      title: "console.spec.ts",
      specs: [
        {
          title: "about ja",
          tests: [
            failed(
              "desktop",
              "Error: コンソールのエラー | 2 件\n\nexpect(received).toEqual(expected)"
            )
          ]
        }
      ]
    }
  ]
};

const links = {
  runUrl: "https://github.com/o/r/actions/runs/1",
  refreshUrl: "https://github.com/o/r/actions/workflows/visual-refresh.yml",
  sha: "0123456789abcdef",
  pr: 42
};

describe("classify", () => {
  it("基準画像が無い → 大きさが違う → 画素数の多い順に並べ、最後の試行のエラーだけを見る", () => {
    const { changes } = classify(report);
    expect(changes).toEqual([
      { image: "mobile/about-en-light.png", pixels: null, ratio: null, size: null, missing: true },
      {
        image: "desktop/about-ja-light.png",
        pixels: 1086146,
        ratio: "0.47",
        size: "1280×1335 → 1280×1817",
        missing: false
      },
      {
        image: "mobile/home-en-light.png",
        pixels: 4500,
        ratio: "0.02",
        size: null,
        missing: false
      },
      { image: "desktop/home-ja-light.png", pixels: 120, ratio: "0.01", size: null, missing: false }
    ]);
  });

  it("画像の比較でない失敗は、テストの名前と最初の行で別に出す（通った・flaky は数えない）", () => {
    expect(classify(report).others).toEqual([
      { title: "[desktop] console.spec.ts › about ja", message: "Error: コンソールのエラー | 2 件" }
    ]);
  });
});

describe("renderFailure", () => {
  it("MARKER で始め、表と artifact の場所を出す。比較以外の失敗があれば作り直しを案内しない", () => {
    const body = renderFailure(report, links);
    expect(body.startsWith(`${MARKER}\n`)).toBe(true);
    expect(body).toContain(
      "`visual` が落ちた（0123456）。変わった画像 4 枚・画像の比較以外の失敗 1 件。"
    );
    expect(body).toContain(
      "| `desktop/about-ja-light.png` | 大きさが違う（1280×1335 → 1280×1817）・1,086,146 | 0.47 |"
    );
    expect(body).toContain("| `mobile/about-en-light.png` | 基準画像が無い | - |");
    // 表の中の | は逃がす
    expect(body).toContain("`Error: コンソールのエラー \\| 2 件`");
    expect(body).toContain(links.runUrl);
    expect(body).not.toContain("visual-refresh.yml -f");
  });

  it("画像の差分だけなら、PR 番号つきで作り直しを案内する", () => {
    const onlyImages: Report = { suites: report.suites.slice(0, 1) };
    const body = renderFailure(onlyImages, links);
    expect(body).toContain("画像の比較以外の失敗 0 件");
    expect(body).not.toContain("### 画像の比較以外の失敗");
    expect(body).toContain(`[Visual refresh](${links.refreshUrl})`);
    expect(body).toContain("`gh workflow run visual-refresh.yml -f pr=42`");
  });
});

describe("renderNoResults / renderSuccess", () => {
  it("結果が無い回は、ログを見るよう案内する", () => {
    const body = renderNoResults(links);
    expect(body.startsWith(`${MARKER}\n`)).toBe(true);
    expect(body).toContain("テストの結果が残っていない");
    expect(body).toContain(links.runUrl);
  });

  it("通った回は、短い sha と通ったことだけを書く", () => {
    expect(renderSuccess(links)).toBe(
      `${MARKER}\n## visual の差分\n\n最新の実行（0123456）では \`visual\` が通った。\n`
    );
  });
});
