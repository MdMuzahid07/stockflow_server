import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

import config from "../../config";
import { ITokenPayload } from "./auth.interface";

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
