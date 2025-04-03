const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const letterRoutes = require('./routes/letterRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const cors = require('cors');
require('dotenv').config();

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
    secure: true, // Set to true for HTTPS
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });


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

require('./config/passport');


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
app.use('/auth', authRoutes);

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

app.use('/api/user', userRoutes);
app.use('/api/letters', letterRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;


// server.js

// // server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const passport = require('passport');
// const cors = require('cors');
// require('dotenv').config();
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const letterRoutes = require('./routes/letterRoutes');
// const MongoStore = require('connect-mongo');
// const path = require('path');
// const app = express();


// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:4200',
//   credentials: true
// }));

// app.use(express.json());
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
//   cookie: {
//     secure: true, // Secure cookies in production
//     httpOnly: true,
//     sameSite: 'none', // Use 'none' if cross-domain redirect is needed
//     maxAge: 24 * 60 * 60 * 1000
//     // Allow cookies across origins
//   }
// }));

// require('./config/passport');

// app.use(passport.initialize());
// app.use(passport.session());

// app.use((req, res, next) => {
//   console.log("Session Middleware: ", req.session);
//   console.log("User Middleware: ", req.user);
//   next();
// });


// // ✅ MongoDB Connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('MongoDB connected successfully');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   }
// };
// connectDB();


// // Routes
// app.use('/auth', authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/letters', letterRoutes);


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;