import { NextResponse } from "next/server";

// 互換スタブ: bot 判定は /api/sendMail に移した。デプロイ前に開いたままのタブ
// （このエンドポイントを呼んでから送信する旧クライアント）が送信できるよう、判定せず 200 を返す。
// 旧クライアントが残っていない頃合い（デプロイの 2 週間後）に、lib/rate-limit.ts の recaptchaRateLimit と一緒に削除する
export async function POST() {
  return NextResponse.json({ success: true });
}
