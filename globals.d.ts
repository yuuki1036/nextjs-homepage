/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;
    readonly NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY: string;
  }
}
