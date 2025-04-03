const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// passport.use(new GoogleStrategy(
//   {
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
//     passReqToCallback: true, // Allows passing the request object
//   },
//   async (req, accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ googleId: profile.id });

//       if (!user) {
//         user = new User({
//           googleId: profile.id,
//           email: profile.emails[0]?.value || '',
//           name: profile.displayName,
//           accessToken,
//           refreshToken,
//         });
//         await user.save();
//       } else {
//         // Update tokens if they have changed
//         const updatedFields = {};
//         if (accessToken !== user.accessToken) updatedFields.accessToken = accessToken;
//         if (refreshToken !== user.refreshToken) updatedFields.refreshToken = refreshToken;

//         if (Object.keys(updatedFields).length > 0) {
//           await User.updateOne({ _id: user._id }, { $set: updatedFields });
//         }

//       }

//       return done(null, user);
//     } catch (error) {
//       console.error('Error during Google OAuth:', error);
//       return done(error);
//     }
//   }
// ));
// // Store user ID in session
// passport.serializeUser((user, done) => {
//   console.log('👉 Serializing User:', user.id);
//   process.nextTick(function() {
//     return done(null, user.id);
//   });
// });

// // Retrieve user from session
// passport.deserializeUser(async (id, done) => {
//   console.log('🔍 Deserializing ID:', id);
//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       console.error('❌ User Not Found');
//       return done(null, false);
//     }
//     console.log('✅ User Found:', user);
//     done(null, user);
//   } catch (error) {
//     console.error('❌ Deserialize Error:', error);
//     done(error);
//   }
// });



passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`, // Ensure it's correct!
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          accessToken,
          refreshToken
        });
        await user.save();
      } else {
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user with ID:', id);
    const user = await User.findById(id);
    console.log('Deserialized user:', user);
    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error);
  }
});