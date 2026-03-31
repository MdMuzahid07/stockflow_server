/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import passport from "passport";
import { Profile, Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ExtractJwt, Strategy as JwtStrategy, VerifiedCallback } from "passport-jwt";

import config from "../config";
import UserModel from "../modules/user/user.model";

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

/**
 * Passport Google OAuth Strategy
 */
if (config.google_client_id && config.google_client_secret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google_client_id as string,
        clientSecret: config.google_client_secret as string,
        callbackURL: `${config.backend_url}/api/v1/auth/google/callback`,
        scope: ["profile", "email"],
        proxy: true, // Important for correct callback URL in production (https)
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any, info?: any) => void
      ) => {
        try {
          // Extract profile data
          const googleProfile = {
            googleId: profile.id,
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          };

          return done(null, googleProfile);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
