/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";

import CustomAppError from "../../errors/CustomAppError";
import UserModel from "./auth.model";
import { generateTokenPair } from "./auth.utils";
import { UserRole } from "./auth.interface";

const registerUser = async (payload: { name: string; email: string; password: string; role?: UserRole }) => {
  // Check if email is already taken
  const isEmailTaken = await UserModel.isEmailTaken(payload.email);
  if (isEmailTaken) {
    throw new CustomAppError(httpStatus.CONFLICT, "Email is already registered");
  }

  // Create user
  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || "manager",
  });

  // Return user without sensitive data
  const userObject: any = user.toObject();
  delete userObject.password;

  // Generate tokens for auto-login
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role as UserRole,
  });

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (email: string, password: string) => {
  // Find user with password field
  const user = await UserModel.findOne({ email, isDeleted: false }).select("+password");

  if (!user) {
    throw new CustomAppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomAppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role as UserRole,
  });

  // Return user without sensitive data
  const userObject: any = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

const logoutUser = async () => {
  return { message: "Logged out successfully" };
};

const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

export const AuthService = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};

export default AuthService;
