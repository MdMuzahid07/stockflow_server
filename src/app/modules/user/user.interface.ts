import { Document, Model, Types } from "mongoose";

/**
 * User Interface
 * Defines the structure of a user document in MongoDB
 */
export interface IUser extends Document, IUserMethods {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  avatar?: string;
  googleId?: string; // For Google OAuth
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens: string[]; // Array for multi-device support
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Model Interface
 * Extends the Mongoose Model with custom static methods
 */
export interface IUserModel extends Model<IUser> {
  /**
   * Check if email is already taken
   * @param email - Email to check
   * @param excludeUserId - Optional user ID to exclude from check (for updates)
   * @returns Promise<boolean>
   */
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;

  /**
   * Check if password matches the hashed password
   * @param plainPassword - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns Promise<boolean>
   */
  comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

/**
 * User Methods Interface
 * Instance methods available on user documents
 */
export interface IUserMethods {
  /**
   * Compare password with hashed password
   * @param candidatePassword - Password to compare
   * @returns Promise<boolean>
   */
  comparePassword(candidatePassword: string): Promise<boolean>;

  /**
   * Generate email verification token
   * @returns string - Verification token
   */
  generateEmailVerificationToken(): string;

  /**
   * Generate password reset token
   * @returns string - Reset token
   */
  generatePasswordResetToken(): string;
}

/**
 * Auth Response Interface
 * Structure of authentication response
 */
export interface IAuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Token Payload Interface
 * JWT token payload structure
 */
export interface ITokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
