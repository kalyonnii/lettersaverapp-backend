const passport = require('passport');

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file']
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
    if (err || !user) {
      return res.redirect('/login');
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      const redirectUrl = new URL(process.env.FRONTEND_URL + '/dashboard');
      console.log('Redirect URL:', redirectUrl.toString());
      // Send redirect
      res.redirect(redirectUrl.toString());
    });
  })(req, res, next);
};
