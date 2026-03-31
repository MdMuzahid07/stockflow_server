/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";

import CustomAppError from "../../errors/CustomAppError";
import { EmailService } from "./email.service";
import UserModel from "./user.model";
import { generateTokenPair, hashToken } from "./user.utils";

const registerUser = async (payload: { name: string; email: string; password: string }) => {
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
    isEmailVerified: false,
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email (non-blocking)
  EmailService.sendVerificationEmail(user.email, verificationToken).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to send verification email:", err);
  });

  // Return user without sensitive data
  const userObject: any = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;

  // Generate tokens for auto-login
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
  });

  // Store refresh token
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push(refreshToken);

  // Limit refresh tokens to 5 devices
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loginUser = async (email: string, password: string, rememberMe: boolean = false) => {
  // Find user with password field
  const user = await UserModel.findOne({ email, isDeleted: false }).select(
    "+password +refreshTokens"
  );

  if (!user) {
    throw new CustomAppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new CustomAppError(httpStatus.FORBIDDEN, "Please verify your email before logging in");
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
  });

  // Store refresh token in database
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push(refreshToken);

  // Limit refresh tokens to 5 devices
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  // Return user without sensitive data
  const userObject: any = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  // Verify refresh token (will be done in middleware)
  // Find user with this refresh token
  const user = await UserModel.findOne({
    refreshTokens: refreshToken,
    isDeleted: false,
  }).select("+refreshTokens");

  if (!user) {
    throw new CustomAppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  // Remove old refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);

  // Generate new tokens
  const tokens = await generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
  });

  // Store new refresh token
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  return tokens;
};

const logoutUser = async (userId: string, refreshToken?: string) => {
  const user = await UserModel.findById(userId).select("+refreshTokens");

  if (!user) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (refreshToken) {
    // Remove specific refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  } else {
    // Remove all refresh tokens (logout from all devices)
    user.refreshTokens = [];
  }

  await user.save();

  return { message: "Logged out successfully" };
};

const verifyEmail = async (
  token: string
): Promise<{
  message: string;
  user: any;
  accessToken: string;
  refreshToken: string;
}> => {
  // Hash the token to compare with stored hash
  const hashedToken = hashToken(token);

  const user = await UserModel.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
    isDeleted: false,
  }).select("+emailVerificationToken +emailVerificationExpires +refreshTokens");

  if (!user) {
    throw new CustomAppError(httpStatus.BAD_REQUEST, "Invalid or expired verification token");
  }

  // Update user verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  // Generate tokens for auto-login
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
  });

  // Store refresh token
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push(refreshToken);

  // Limit refresh tokens to 5 devices
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  // Return user without sensitive data
  const userObject: any = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;

  return {
    message: "Email verified successfully",
    user: userObject,
    accessToken,
    refreshToken,
  };
};

const resendVerificationEmail = async (email: string) => {
  const user = await UserModel.findOne({ email, isDeleted: false });

  if (!user) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isEmailVerified) {
    throw new CustomAppError(httpStatus.BAD_REQUEST, "Email is already verified");
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email
  await EmailService.sendVerificationEmail(user.email, verificationToken);

  return { message: "Verification email sent successfully" };
};

const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email, isDeleted: false });

  if (!user) {
    // Don't reveal if email exists
    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // Send password reset email
  await EmailService.sendPasswordResetEmail(user.email, resetToken);

  return {
    message: "If the email exists, a password reset link has been sent",
  };
};

const resetPassword = async (token: string, newPassword: string) => {
  // Hash the token to compare with stored hash
  const hashedToken = hashToken(token);

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
    isDeleted: false,
  }).select("+resetPasswordToken +resetPasswordExpires +password");

  if (!user) {
    throw new CustomAppError(httpStatus.BAD_REQUEST, "Invalid or expired reset token");
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "Password reset successfully" };
};

const googleOAuth = async (googleProfile: {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}) => {
  // Check if user exists with Google ID
  let user = await UserModel.findOne({
    googleId: googleProfile.googleId,
    isDeleted: false,
  }).select("+refreshTokens");

  if (!user) {
    // Check if user exists with email
    user = await UserModel.findOne({
      email: googleProfile.email,
      isDeleted: false,
    }).select("+refreshTokens");

    if (user) {
      // Link Google account to existing user
      user.googleId = googleProfile.googleId;
      user.isEmailVerified = true; // Google emails are verified
      if (!user.avatar && googleProfile.avatar) {
        user.avatar = googleProfile.avatar;
      }
    } else {
      // Create new user
      user = await UserModel.create({
        name: googleProfile.name,
        email: googleProfile.email,
        googleId: googleProfile.googleId,
        avatar: googleProfile.avatar,
        isEmailVerified: true,
        password: undefined, // No password for OAuth users
      });
    }
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
  });

  // Store refresh token
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push(refreshToken);

  // Limit refresh tokens to 5 devices
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  // Return user without sensitive data
  const userObject: any = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
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
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  googleOAuth,
  getCurrentUser,
};

export default AuthService;
