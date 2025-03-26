const express = require('express');
const router = express.Router();
const { getUser, logoutUser } = require('../controllers/userController');

router.get('/', getUser);
router.get('/logout', logoutUser);

module.exports = router; // ✅ Ensure this line exists
