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
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
    if (err) {
      console.error('Google Auth Error:', err);
      return res.redirect('/login');
    }
    if (!user) {
      console.error('User Not Found');
      return res.redirect('/login');
    }

    req.login(user, (err) => {
      if (err) {
        console.error('Login Error:', err);
        return next(err);
      }
      console.log('User Authenticated:', user);
      console.log('Redirecting to dashboard');
      console.log('Redirecting to:', `${process.env.FRONTEND_URL}/dashboard`);
      req.session.save((err) => {
        if (err) {
          console.error('Session Save Error:', err);
          return next(err);
        }
        console.log('Redirecting to:', `${process.env.FRONTEND_URL}/#/dashboard`);

        // res.redirect(`${process.env.FRONTEND_URL}/#/dashboard`);
        res.send(`
          <script>
            window.location.href = "${process.env.FRONTEND_URL}/#/dashboard";
          </script>
        `);
      });
    });
  })(req, res, next);
};
