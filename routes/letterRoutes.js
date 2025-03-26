// routes/letterRoutes.js
const express = require('express');
const router = express.Router();
const letterController = require('../controllers/letterController');

router.post('/', letterController.createLetter);

router.get('/', letterController.getUserLetters);

router.get('/:letterId', letterController.getLetterById);

router.patch('/:letterId', letterController.updateLetter);

router.delete('/:letterId', letterController.deleteLetter);

router.post('/:letterId/drive', letterController.saveLetterToDrive);

router.get('/drive', letterController.getDriveLetters);

module.exports = router;