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
    message: "Registration successful",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.loginUser(email, password);

  // Set httpOnly cookies (15 mins for access, 7 days for refresh)
  res.cookie("accessToken", result.accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", result.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

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

const logout = catchAsync(async (req: Request, res: Response) => {
  await AuthService.logoutUser();

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

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;

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
  logout,
  getCurrentUser,
};
