import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// joining the .env file in current directory ,and setting in path using nodejs path module
dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = z.object({
  DB_URL: z.string().url(),
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production"]),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  JWT_ACCESS_SECRET_KEY: z.string(),
  JWT_REFRESH_SECRET_KEY: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUND: z.coerce.number().default(12),
  DATABASE_NAME: z.string().default("stockflow"),
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().trim().optional(),
  GOOGLE_CLIENT_SECRET: z.string().trim().optional(),
  // Email Service (SMTP)
  SMTP_HOST: z.string().min(1, "SMTP Host is required"),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().min(1, "SMTP User is required"),
  SMTP_PASS: z.string().min(1, "SMTP Password is required"),
  EMAIL_FROM: z.string().email().default("noreply@StockFlow.io"),
  EMAIL_FROM_NAME: z.string().default("Orbit Drive Support"),
  // URLs
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  BACKEND_URL: z.string().url().default("http://localhost:5000"),
});

const envVars = envVarsSchema.safeParse(process.env);

if (!envVars.success) {
  throw new Error(`Config validation error: ${envVars.error.message}`);
}

const { data } = envVars;

export default {
  database_url: data.DB_URL,
  port: data.PORT,
  NODE_ENV: data.NODE_ENV,
  cloudinary_api_key: data.CLOUDINARY_API_KEY,
  cloudinary_api_secret: data.CLOUDINARY_API_SECRET,
  cloudinary_cloud_name: data.CLOUDINARY_CLOUD_NAME,
  jwt_access_token_secret_key: data.JWT_ACCESS_SECRET_KEY,
  jwt_refresh_token_secret_key: data.JWT_REFRESH_SECRET_KEY,
  jwt_access_token_expires_in: data.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_token_expires_in: data.JWT_REFRESH_EXPIRES_IN,
  bcrypt_salt_rounds: data.BCRYPT_SALT_ROUND,
  database_name: data.DATABASE_NAME,
  // Google OAuth
  google_client_id: data.GOOGLE_CLIENT_ID,
  google_client_secret: data.GOOGLE_CLIENT_SECRET,
  // Email Service
  email: {
    SMTP_HOST: data.SMTP_HOST,
    SMTP_PORT: data.SMTP_PORT,
    SMTP_USER: data.SMTP_USER,
    SMTP_PASS: data.SMTP_PASS,
    EMAIL_FROM: data.EMAIL_FROM,
    EMAIL_FROM_NAME: data.EMAIL_FROM_NAME,
  },
  // URLs
  frontend_url: data.FRONTEND_URL,
  backend_url: data.BACKEND_URL,
};
