/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Schema } from "mongoose";

import config from "../../config";
import { IUser, IUserMethods, IUserModel } from "./user.interface";

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must not exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      select: false, // Don't return password by default
      minlength: [8, "Password must be at least 8 characters"],
    },
    avatar: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values to be non-unique
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false, // Don't return refresh tokens by default
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ===== Indexes =====
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ createdAt: -1 });

// ===== Pre-save Middleware =====
/**
 * Hash password before saving
 * Only hash if password is modified
 */
userSchema.pre("save", async function (next) {
  // Only hash password if it's modified or new
  if (!this.isModified("password")) {
    return next();
  }

  // Don't hash if password is undefined (OAuth users)
  if (!this.password) {
    return next();
  }

  try {
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(this.password, config.bcrypt_salt_rounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ===== Instance Methods =====
/**
 * Compare password with hashed password
 * @param candidatePassword - Password to compare
 * @returns Promise<boolean>
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate email verification token
 * @returns string - Verification token
 */
userSchema.methods.generateEmailVerificationToken = function (): string {
  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

  // Set expiration (24 hours)
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Return unhashed token (to be sent via email)
  return verificationToken;
};

/**
 * Generate password reset token
 * @returns string - Reset token
 */
userSchema.methods.generatePasswordResetToken = function (): string {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expiration (1 hour)
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  // Return unhashed token (to be sent via email)
  return resetToken;
};

// ===== Static Methods =====
/**
 * Check if email is already taken
 * @param email - Email to check
 * @param excludeUserId - Optional user ID to exclude from check
 * @returns Promise<boolean>
 */
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  const user = await this.findOne({
    email,
    _id: { $ne: excludeUserId },
    isDeleted: false,
  });
  return !!user;
};

/**
 * Compare password with hashed password (static method)
 * @param plainPassword - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Promise<boolean>
 */
userSchema.statics.comparePassword = async function (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// ===== Query Middleware =====
/**
 * Exclude deleted users from queries
 */
userSchema.pre(/^find/, function (this: any, next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export default userSchema;
