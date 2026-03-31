import express from "express";

import passport from "../../config/passport.config";
import { authenticate, verifyRefreshToken } from "../../middlewares/auth.middleware";
import requestValidator from "../../middlewares/requestValidator";
import { AuthController } from "./auth.controller";
import {
  forgotPasswordValidationSchema,
  loginValidationSchema,
  registerValidationSchema,
  resendVerificationValidationSchema,
  resetPasswordValidationSchema,
  verifyEmailValidationSchema,
} from "./user.validation";

const router = express.Router();

router.post("/register", requestValidator(registerValidationSchema), AuthController.register);

router.post("/login", requestValidator(loginValidationSchema), AuthController.login);

router.post("/refresh-token", verifyRefreshToken, AuthController.refreshToken);

router.post("/logout", authenticate, AuthController.logout);

router.get(
  "/verify-email/:token",
  requestValidator(verifyEmailValidationSchema),
  AuthController.verifyEmail
);

router.post(
  "/resend-verification-email",
  requestValidator(resendVerificationValidationSchema),
  AuthController.resendVerificationEmail
);

router.post(
  "/forgot-password",
  requestValidator(forgotPasswordValidationSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password/:token",
  requestValidator(resetPasswordValidationSchema),
  AuthController.resetPassword
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.googleOAuth
);

router.get("/me", authenticate, AuthController.getCurrentUser);

export const AuthRoutes = router;
