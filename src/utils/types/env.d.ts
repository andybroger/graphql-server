declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    COOKIE_SECRET: string;
    DATABASE_URL: string;
    NODE_DEV: string;
  }
}
