const mongoose = require('mongoose');

const LetterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  driveFileId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'saved', 'archived'],
    default: 'draft'
  }
});

const Letter = mongoose.model('Letter', LetterSchema);
module.exports = Letter;