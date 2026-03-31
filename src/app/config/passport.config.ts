import { Request } from "express";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy, VerifiedCallback } from "passport-jwt";

import config from "../config";
import UserModel from "../modules/auth/auth.model";

/**
 * Passport JWT Strategy
 * Extracts JWT from cookies and verifies it
 */
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies.accessToken;
      }
      return token;
    },
  ]),
  secretOrKey: config.jwt_access_token_secret_key,
};

passport.use(
  "jwt",
  new JwtStrategy(
    jwtOptions,
    async (payload: { userId: string; email: string }, done: VerifiedCallback) => {
      try {
        const user = await UserModel.findById(payload.userId);

        if (!user) {
          return done(null, false);
        }

        return done(null, { userId: user._id.toString(), email: user.email });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
