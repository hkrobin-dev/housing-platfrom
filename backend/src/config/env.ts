import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    // Fail fast at boot instead of silently breaking later at runtime
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: required("DATABASE_URL"),
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  // The backend's own publicly reachable URL — used for payment gateway callbacks
  // (SSLCommerz redirects the browser here first; this route then verifies and
  // forwards on to CLIENT_URL). Defaults to localhost using the same PORT.
  API_BASE_URL: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@housing.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@12345",
};