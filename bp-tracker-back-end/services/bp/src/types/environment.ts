// Environment configuration types
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  SESSION_SECRET: string;
  FRONTEND_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}
