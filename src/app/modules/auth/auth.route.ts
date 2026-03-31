import express from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import requestValidator from "../../middlewares/requestValidator";
import { AuthController } from "./auth.controller";
import { loginValidationSchema, registerValidationSchema } from "./auth.validation";

const router = express.Router();

router.post("/register", requestValidator(registerValidationSchema), AuthController.register);

router.post("/login", requestValidator(loginValidationSchema), AuthController.login);

router.post("/logout", authenticate, AuthController.logout);

router.get("/me", authenticate, AuthController.getCurrentUser);

export const AuthRoutes = router;
