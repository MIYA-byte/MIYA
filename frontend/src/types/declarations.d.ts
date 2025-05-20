// Import Meta Environment declaration
interface ImportMeta {
  env: {
    VITE_API_BASE_URL: string;
    [key: string]: any;
  };
}

// Global declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  }
} 