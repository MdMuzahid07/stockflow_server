import bcrypt from "bcryptjs";
import { Schema } from "mongoose";

import config from "../../config";
import { IUser, IUserMethods, IUserModel } from "./auth.interface";

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
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "manager"],
      default: "manager",
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
userSchema.index({ isDeleted: 1 });

// ===== Pre-save Middleware =====
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ===== Instance Methods =====
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // Since password is select: false, we need to handle it in the service by selecting it
  // or use this.password if it's already there
  return await bcrypt.compare(candidatePassword, this.password);
};

// ===== Static Methods =====
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

// ===== Query Middleware =====
userSchema.pre(/^find/, function (this: any, next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export default userSchema;
