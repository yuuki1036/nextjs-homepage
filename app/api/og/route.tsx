import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  return new ImageResponse(
    <div
      style={{
        backgroundColor: "#fefefe",
        backgroundSize: "150px 150px",
        height: "100%",
        width: "100%",
        display: "flex",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        flexWrap: "nowrap"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          justifyItems: "center"
        }}
      >
        <picture>
          <img
            alt="yuuki1036"
            height={title ? 160 : 220}
            src="https://yuuki1036.com/images/avatar.jpg"
            style={{
              margin: "0 30px",
              borderRadius: "50%",
              backgroundColor: "#ff6666"
            }}
            width={title ? 160 : 220}
          />
        </picture>
      </div>
      <div
        style={{
          fontSize: title ? 48 : 60,
          fontStyle: "normal",
          letterSpacing: "-0.025em",
          color: "black",
          marginTop: 30,
          padding: "0 120px",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap"
        }}
      >
        yuuki1036
      </div>
      {title && (
        <div
          style={{
            fontSize: 36,
            fontStyle: "normal",
            color: "#666",
            marginTop: 16,
            padding: "0 60px"
          }}
        >
          {title}
        </div>
      )}
    </div>,
    {
      width: 1200,
      height: 630
    }
  );
}
