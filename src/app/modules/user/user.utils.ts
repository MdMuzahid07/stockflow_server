import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

import config from "../../config";
import { ITokenPayload } from "./user.interface";

export const generateAccessToken = (payload: ITokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt_access_token_expires_in as SignOptions["expiresIn"],
  };
  return jwt.sign({ ...payload }, config.jwt_access_token_secret_key, options);
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt_refresh_token_expires_in as SignOptions["expiresIn"],
  };
  return jwt.sign({ ...payload }, config.jwt_refresh_token_secret_key, options);
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  try {
    return jwt.verify(token, config.jwt_access_token_secret_key) as ITokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token");
    }
    throw new Error("Token verification failed");
  }
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  try {
    return jwt.verify(token, config.jwt_refresh_token_secret_key) as ITokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw new Error("Token verification failed");
  }
};

export const decodeToken = (token: string): ITokenPayload | null => {
  try {
    return jwt.decode(token) as ITokenPayload;
  } catch (error) {
    return null;
  }
};

export const generateTokenPair = (
  payload: ITokenPayload
): {
  accessToken: string;
  refreshToken: string;
} => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

// ===== Crypto Utilities =====

export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateAndHashToken = (
  length: number = 32
): { token: string; hashedToken: string } => {
  const token = generateSecureToken(length);
  const hashedToken = hashToken(token);
  return { token, hashedToken };
};

export const validatePasswordStrength = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const secureCompare = (a: string, b: string): boolean => {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
};
