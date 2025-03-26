const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback } = require('../controllers/authController');

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router; // ✅ Ensure this line exists
