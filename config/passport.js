const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    passReqToCallback: true, // Allows passing the request object
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          email: profile.emails[0]?.value || '',
          name: profile.displayName,
          accessToken,
          refreshToken,
        });
        await user.save();
      } else {
        // Update tokens if they have changed
        if (accessToken !== user.accessToken || refreshToken !== user.refreshToken) {
          user.accessToken = accessToken;
          user.refreshToken = refreshToken;
          await user.save();
        }
      }

      return done(null, user);
    } catch (error) {
      console.error('Error during Google OAuth:', error);
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('User not found'));
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});
