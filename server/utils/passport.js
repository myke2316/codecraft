
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env';

// Load environment variables from the selected .env file
dotenv.config({ path: envFile });
function passportUtil(app) {
  app.use(
    session({
      secret: process.env.GOOGLE_CLIENT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
        scope: ["profile", "email"],
      },
      (accessToken, refreshToken, profile, callback) => {
        // Additional data you want to include
        const additionalData = {
          someField: "someValue",
          anotherField: "anotherValue",
        };

        // Merge additional data with profile
        const user = { ...profile, ...additionalData };
        callback(null, user);
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

export default passportUtil;
