declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    NODE_DEV: string;
    COOKIE_SECRET: string;
    DATABASE_URL: string;
  }
}
