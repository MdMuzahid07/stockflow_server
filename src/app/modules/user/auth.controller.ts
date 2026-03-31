import { Request, Response } from "express";
import httpStatus from "http-status";

import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/send.response";
import AuthService from "./auth.service";

/**
 * The function `getCookieOptions` returns an object with options for setting
 * cookies, including `httpOnly`, `secure`, `sameSite`, `maxAge`, and `path`.
 * @param {number} maxAge - The `maxAge` parameter represents the maximum age of
 * the cookie in seconds before it expires.
 */
const getCookieOptions = (maxAge: number) => ({
  httpOnly: true, // not accessible via JavaScript only will accessible via HTTP(S) requests
  secure: config.NODE_ENV === "production", // only sent over HTTPS in production
  sameSite: config.NODE_ENV === "production" ? ("none" as const) : ("lax" as const), // allow cross-site cookies in production, but restrict in development
  maxAge,
  path: "/", // cookie will be sent for all routes
});

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  res.cookie("accessToken", result.accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Registration successful. Please verify your email.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  const result = await AuthService.loginUser(email, password, rememberMe);

  // Set httpOnly cookies
  const accessTokenExpiry = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000; // 7 days or 15 minutes
  const refreshTokenExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days

  res.cookie("accessToken", result.accessToken, getCookieOptions(accessTokenExpiry));
  res.cookie("refreshToken", result.refreshToken, getCookieOptions(refreshTokenExpiry));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshAccessToken(refreshToken);

  const accessTokenExpiry = 15 * 60 * 1000; // 15 minutes
  const refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

  res.cookie("accessToken", result.accessToken, getCookieOptions(accessTokenExpiry));
  res.cookie("refreshToken", result.refreshToken, getCookieOptions(refreshTokenExpiry));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: null,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { refreshToken } = req.cookies;

  await AuthService.logoutUser(userId!, refreshToken);

  // Clear httpOnly cookies
  res.clearCookie("accessToken", getCookieOptions(0));
  res.clearCookie("refreshToken", getCookieOptions(0));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout successful",
    data: null,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;

  const result = await AuthService.verifyEmail(token);

  res.cookie("accessToken", result.accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await AuthService.resendVerificationEmail(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await AuthService.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await AuthService.resetPassword(token, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const googleOAuth = catchAsync(async (req: Request, res: Response) => {
  const googleProfile = req.user as unknown as {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  };

  const result = await AuthService.googleOAuth(googleProfile);

  // Set httpOnly cookies
  res.cookie("accessToken", result.accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  // Redirect to frontend with tokens and user data
  const redirectUrl = new URL(`${config.frontend_url}/login`);
  redirectUrl.searchParams.set("accessToken", result.accessToken);
  redirectUrl.searchParams.set("user", JSON.stringify(result.user));

  res.redirect(redirectUrl.toString());
});

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const result = await AuthService.getCurrentUser(userId!);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  googleOAuth,
  getCurrentUser,
};
