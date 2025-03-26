const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  name: String,
  accessToken: String,
  refreshToken: String
});

module.exports = mongoose.model('User', userSchema);
