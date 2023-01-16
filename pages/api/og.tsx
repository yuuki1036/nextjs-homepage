import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge"
};

export default async function handler() {
  return new ImageResponse(
    (
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
              height={220}
              src="https://yuuki1036.com/images/avatar.png"
              style={{
                margin: "0 30px",
                borderRadius: "50%",
                backgroundColor: "#ff6666"
              }}
              width={220}
            />
          </picture>
        </div>
        <div
          style={{
            fontSize: 60,
            fontStyle: "nomal",
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
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
