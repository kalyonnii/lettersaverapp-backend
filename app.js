// const express = require('express');
// const mongoose = require('mongoose');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const session = require('express-session');
// const letterRoutes = require('./routes/letterRoutes');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:4200',
//   credentials: true
// }));
// app.use(express.json());
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: false, // Set to true for HTTPS

//   }
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// // User Model
// const User = mongoose.model('User', {
//   googleId: String,
//   email: String,
//   name: String,
//   accessToken: String,
//   refreshToken: String
// });

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "http://localhost:3000/auth/google/callback" // Ensure it's correct!
// },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ googleId: profile.id });

//       if (!user) {
//         user = new User({
//           googleId: profile.id,
//           email: profile.emails[0].value,
//           name: profile.displayName,
//           accessToken,
//           refreshToken
//         });
//         await user.save();
//       } else {
//         user.accessToken = accessToken;
//         user.refreshToken = refreshToken;
//         await user.save();
//       }

//       return done(null, user);
//     } catch (error) {
//       return done(error);
//     }
//   }
// ));


// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     // console.log('Deserializing user with ID:', id);
//     const user = await User.findById(id);
//     // console.log('Deserialized user:', user);
//     done(null, user);
//   } catch (error) {
//     console.error('Deserialization error:', error);
//     done(error);
//   }
// });

// // Authentication Routes
// app.get('/auth/google',
//   passport.authenticate('google', {
//     scope: [
//       'profile',
//       'email',
//       'https://www.googleapis.com/auth/drive.file'
//     ]
//   })
// );

// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     // console.log(req)
//     // Successful authentication, redirect home.
//     res.redirect('http://localhost:4200/editor');
//   }
// );

// app.get('/api/user', (req, res) => {
//   if (req.user) {
//     res.json({
//       id: req.user.googleId,
//       name: req.user.name,
//       email: req.user.email
//     });
//   } else {
//     res.status(401).json({ message: 'Not authenticated' });
//   }
// });
// app.get('/api/user/logout', (req, res) => {
//   console.log("Force logout called");

//   req.session.destroy((err) => {
//     if (err) {
//       console.error("Session destroy error:", err);
//       return res.status(500).json({ message: "Logout failed" });
//     }
//     res.clearCookie('connect.sid');
//     res.status(200).json({ message: "Force logout successful" });
//   });
// });



// app.use('/api/letters', letterRoutes);
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;


// server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const letterRoutes = require('./routes/letterRoutes');
require('./config/passport');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true,
  sameSite: none, // Use 'none' if cross-domain redirect is needed
  maxAge: 24 * 60 * 60 * 1000
    // Allow cookies across origins
  }
}));
app.use(passport.initialize());
app.use(passport.session());



// ✅ MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();


// Routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/letters', letterRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;