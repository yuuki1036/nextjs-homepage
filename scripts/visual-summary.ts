// visual ジョブの結果（Playwright の JSON reporter）から、PR に置くコメントの本文を作る。
// 使い方: node scripts/visual-summary.ts <results.json> <failure|success>
// 本文は stdout に出す。CI の visual-summary ジョブが、MARKER で始まる既存のコメントを書き直す。
// node の組み込みだけを使う（書き込みの権限を持つジョブで npm ci をしないため）。
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const MARKER = "<!-- visual-summary -->";

export type Links = {
  // 差分の画像（playwright-report）を取りに行く実行のページ
  runUrl: string;
  // 基準画像を作り直すワークフローのページ
  refreshUrl: string;
  sha: string;
  pr: number;
};

export type ImageChange = {
  image: string;
  pixels: number | null;
  ratio: string | null;
  size: string | null;
  missing: boolean;
};

export type OtherFailure = { title: string; message: string };

type ReportError = { message?: string };
type ReportResult = { errors?: ReportError[] };
type ReportTest = { projectName: string; status: string; results: ReportResult[] };
type ReportSpec = { title: string; tests: ReportTest[] };
type ReportSuite = { title: string; specs?: ReportSpec[]; suites?: ReportSuite[] };
export type Report = { suites: ReportSuite[] };

// 正規表現のリテラルに制御文字を書かないよう、ESC は文字コードから作る
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
const stripAnsi = (text: string) => text.replace(ANSI, "");

const PIXELS = /(\d+) pixels \(ratio ([\d.]+) of all image pixels\) are different/;
const SIZE = /Expected an image (\d+)px by (\d+)px, received (\d+)px by (\d+)px/;
const MISSING = /A snapshot doesn't exist at \S*?([^/\s]+\.png)/;
const SNAPSHOT = /Snapshot: (\S+\.png)/;

const collectFailures = (
  suite: ReportSuite,
  titles: string[],
  out: { title: string; test: ReportTest }[]
) => {
  const path = suite.title ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      if (test.status === "unexpected")
        out.push({ title: [...path, spec.title].join(" › "), test });
    }
  }
  for (const child of suite.suites ?? []) collectFailures(child, path, out);
};

// 最後の試行の失敗を、画像の差分とそれ以外に分ける
export const classify = (report: Report) => {
  const failures: { title: string; test: ReportTest }[] = [];
  for (const suite of report.suites) collectFailures(suite, [], failures);

  const changes: ImageChange[] = [];
  const others: OtherFailure[] = [];
  for (const { title, test } of failures) {
    const messages = (test.results.at(-1)?.errors ?? []).map((error) =>
      stripAnsi(error.message ?? "")
    );
    const message = messages.join("\n");
    const pixels = PIXELS.exec(message);
    const size = SIZE.exec(message);
    const missing = MISSING.exec(message);
    const name = SNAPSHOT.exec(message)?.[1] ?? missing?.[1];
    if (name && (pixels || size || missing)) {
      changes.push({
        image: `${test.projectName}/${name}`,
        pixels: pixels ? Number(pixels[1]) : null,
        ratio: pixels?.[2] ?? null,
        size: size ? `${size[1]}×${size[2]} → ${size[3]}×${size[4]}` : null,
        missing: Boolean(missing)
      });
    } else {
      const firstLine =
        message.split("\n").find((line) => line.trim() !== "") ?? "（メッセージなし）";
      others.push({ title: `[${test.projectName}] ${title}`, message: firstLine.trim() });
    }
  }

  // 基準画像が無いもの → 大きさが違うもの → 画素数の多い順
  const rank = (change: ImageChange) => (change.missing ? 2 : change.size ? 1 : 0);
  changes.sort(
    (a, b) =>
      rank(b) - rank(a) || (b.pixels ?? 0) - (a.pixels ?? 0) || a.image.localeCompare(b.image)
  );
  return { changes, others };
};

const formatPixels = (change: ImageChange) => {
  if (change.missing) return "基準画像が無い";
  const parts = [];
  if (change.size) parts.push(`大きさが違う（${change.size}）`);
  if (change.pixels !== null) parts.push(change.pixels.toLocaleString("en-US"));
  return parts.join("・");
};

// | と改行は表を壊すので置き換える
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\s+/g, " ");

export const renderFailure = (report: Report, links: Links) => {
  const { changes, others } = classify(report);
  const lines = [
    MARKER,
    "## visual の差分",
    "",
    `\`visual\` が落ちた（${links.sha.slice(0, 7)}）。変わった画像 ${changes.length} 枚・画像の比較以外の失敗 ${others.length} 件。`
  ];

  if (changes.length > 0) {
    lines.push("", "| 画像 | 変わった画素 | 割合 |", "| --- | ---: | ---: |");
    for (const change of changes) {
      lines.push(
        `| \`${cell(change.image)}\` | ${formatPixels(change)} | ${change.ratio ?? "-"} |`
      );
    }
  }

  if (others.length > 0) {
    lines.push(
      "",
      "### 画像の比較以外の失敗",
      "",
      "基準画像を作り直しても直らない。先にこちらを直す。",
      ""
    );
    for (const other of others) lines.push(`- ${cell(other.title)}: \`${cell(other.message)}\``);
  }

  lines.push(
    "",
    `差分の画像は [この実行](${links.runUrl}) の artifact \`playwright-report\` にある（展開して \`npx playwright show-report <ディレクトリ>\`）。`
  );
  if (changes.length > 0 && others.length === 0) {
    lines.push(
      "",
      "差分を見て受け入れるなら、基準画像を作り直す（作り直したコミットを PR に push し、必須チェックを走らせ直す）:",
      "",
      `- [Visual refresh](${links.refreshUrl}) の Run workflow で、PR 番号に \`${links.pr}\` を入れる`,
      `- または \`gh workflow run visual-refresh.yml -f pr=${links.pr}\``
    );
  }
  return lines.join("\n") + "\n";
};

// テストに入る前（build・起動）で落ちた回は、結果のファイルが無い
export const renderNoResults = (links: Pick<Links, "runUrl" | "sha">) =>
  [
    MARKER,
    "## visual の差分",
    "",
    `\`visual\` が落ちた（${links.sha.slice(0, 7)}）が、テストの結果が残っていない。build かサーバーの起動で落ちた見込みなので、[この実行](${links.runUrl}) のログを見る。`
  ].join("\n") + "\n";

export const renderSuccess = (links: Pick<Links, "sha">) =>
  [
    MARKER,
    "## visual の差分",
    "",
    `最新の実行（${links.sha.slice(0, 7)}）では \`visual\` が通った。`
  ].join("\n") + "\n";

const main = () => {
  const [file, outcome] = process.argv.slice(2);
  const env = (name: string) => {
    const value = process.env[name];
    if (!value) throw new Error(`${name} が無い`);
    return value;
  };
  const sha = env("HEAD_SHA");
  if (outcome === "success") {
    process.stdout.write(renderSuccess({ sha }));
    return;
  }
  if (outcome !== "failure" || !file) {
    throw new Error("使い方: node scripts/visual-summary.ts <results.json> <failure|success>");
  }
  if (!existsSync(file)) {
    process.stdout.write(renderNoResults({ runUrl: env("RUN_URL"), sha }));
    return;
  }
  const report = JSON.parse(readFileSync(file, "utf8")) as Report;
  process.stdout.write(
    renderFailure(report, {
      runUrl: env("RUN_URL"),
      refreshUrl: env("REFRESH_URL"),
      sha,
      pr: Number(env("PR_NUMBER"))
    })
  );
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
