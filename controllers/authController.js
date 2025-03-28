const passport = require('passport');

// Google Authentication Middleware
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
  accessType: 'offline', // Request offline access for refresh token
  prompt: 'consent', // Force user account selection and consent screen
});

// // Google Authentication Callback Handler
// exports.googleCallback = (req, res, next) => {
//   passport.authenticate('google', { failureRedirect: '/login' }, async (err, user) => {
//     if (err) {
//       console.error('Google Auth Error:', err);
//       return res.redirect('/login');
//     }

//     if (!user) {
//       console.warn('No user returned from Google authentication');
//       return res.redirect('/login');
//     }

//     try {
//       await new Promise((resolve, reject) => {
//         req.login(user, (loginErr) => (loginErr ? reject(loginErr) : resolve()));
//       });

//       const redirectUrl = new URL(process.env.FRONTEND_URL + '/dashboard');
//       console.log('Redirect URL:', redirectUrl.toString());
//       // Send redirect
//       return res.redirect(redirectUrl.toString());
//     } catch (error) {
//       console.error('Login Process Error:', error);
//       return next(error);
//     }
//   })(req, res, next);
// };


exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err || !user) {
      return res.status(401).send('Login failed');
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.save(() => {
        console.log('User logged in and session saved:', req.session);
        res.redirect(`${process.env.FRONTEND_URL}/#/dashboard`);
      });
    });
  })(req, res, next);
};
