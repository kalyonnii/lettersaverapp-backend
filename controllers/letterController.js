// controllers/letterController.js
const Letter = require('../models/Letter');
const { google } = require('googleapis');

// Create a new letter
exports.createLetter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const letter = new Letter({
      user: req.user._id,
      title,
      content,
      status: 'draft'
    });
    await letter.save();
    res.status(201).json(letter);
  } catch (error) {
    res.status(500).json({ message: 'Error creating letter', error: error.message });
  }
};

// Get user's letters with optional filtering
exports.getUserLetters = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    const query = { user: req.user._id, ...(status && { status }) };

    const letters = await Letter.find(query)
      .limit(Number(limit))
      .skip((page - 1) * Number(limit))
      .sort({ savedAt: -1 });

    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching letters', error: error.message });
  }
};

// Get a specific letter by ID
exports.getLetterById = async (req, res) => {
  try {
    const letter = await Letter.findOne({ _id: req.params.letterId, user: req.user._id });
    if (!letter) return res.status(404).json({ message: 'Letter not found' });

    res.json(letter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching letter', error: error.message });
  }
};

// Update a letter
exports.updateLetter = async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const letter = await Letter.findOneAndUpdate(
      { _id: req.params.letterId, user: req.user._id },
      { ...(title && { title }), ...(content && { content }), ...(status && { status }) },
      { new: true }
    );

    if (!letter) return res.status(404).json({ message: 'Letter not found' });

    res.json(letter);
  } catch (error) {
    res.status(500).json({ message: 'Error updating letter', error: error.message });
  }
};

// Delete a letter
exports.deleteLetter = async (req, res) => {
  try {
    const letter = await Letter.findOneAndDelete({ _id: req.params.letterId, user: req.user._id });
    if (!letter) return res.status(404).json({ message: 'Letter not found' });

    res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting letter', error: error.message });
  }
};

// Save all letters to Google Drive
exports.saveLetterToDrive = async (req, res) => {
  try {
    // Authenticate Google Drive
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ access_token: req.user.accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Find or create the user's Letters folder
    const folderId = await findOrCreateLettersFolder(drive, req.user._id);

    // Fetch user's letters
    const letters = await Letter.find({ user: req.user._id });
    const syncResults = [];

    // Sync letters to Google Drive
    for (const letter of letters) {
      try {
        const fileMetadata = {
          name: `${letter.title}.doc`,
          parents: [folderId],
          mimeType: 'application/vnd.google-apps.document'
        };
        const media = {
          mimeType: 'text/plain',
          body: letter.content
        };

        let driveFileId = letter.driveFileId;
        if (driveFileId) {
          const updateResponse = await drive.files.update({
            fileId: driveFileId,
            media: media,
            fields: 'id'
          });
          syncResults.push({ letterId: letter._id, driveFileId: updateResponse.data.id, status: 'updated' });
        } else {
          const createResponse = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
          });
          letter.driveFileId = createResponse.data.id;
          letter.status = 'saved';
          await letter.save();
          syncResults.push({ letterId: letter._id, driveFileId: createResponse.data.id, status: 'created' });
        }
      } catch (syncError) {
        syncResults.push({ letterId: letter._id, status: 'failed', error: syncError.message });
      }
    }

    res.json({
      message: 'Letters synced with Google Drive',
      totalLetters: letters.length,
      syncResults
    });

  } catch (error) {
    console.error('Error syncing letters to Drive:', error);
    res.status(500).json({ message: 'Failed to sync letters to Google Drive', error: error.message });
  }
};

// Helper: Find or create user's "My Letters" folder
async function findOrCreateLettersFolder(drive, userId) {
  try {
    const folderName = `My Letters`;
    const folderQuery = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      spaces: 'drive'
    });

    if (folderQuery.data.files.length > 0) return folderQuery.data.files[0].id;

    const folderMetadata = { name: folderName, mimeType: 'application/vnd.google-apps.folder' };
    const folder = await drive.files.create({ resource: folderMetadata, fields: 'id' });
    return folder.data.id;
  } catch (error) {
    console.error('Error finding/creating folder:', error);
    throw error;
  }
}

// Get all Drive-synced letters
exports.getDriveLetters = async (req, res) => {
  try {
    const letters = await Letter.find({
      user: req.user._id,
      driveFileId: { $ne: null }
    });

    res.json(letters);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching synced letters',
      error: error.message
    });
  }
};