declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    POSTGRES_URL: string;
    NODE_DEV: string;
  }
}
