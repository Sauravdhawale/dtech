const fs = require('fs');
const UploadLog = require('../models/uploadLogs');
const User = require('../models/Users');

const uploadLogMiddleware = async (req, res, next) => {
  if (!req.file) return next();

  const user = req.userId ? await User.findById(req.userId) : null;
  const filePath = req.file.path;
  const fileType = req.file.mimetype;
  let numberOfRows = 0;

  try {
    if (fileType === 'text/csv') {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity,
      });
      for await (const line of rl) numberOfRows += 1;
    }

    const uploadDetails = {
      fileName: req.body.fileName || req.file.originalname,
      campaignId: req.body.campaignId || '',
      filePath,
      fileUploadName: req.file.filename,
      fileSize: req.file.size,
      numberOfRows,
      fileType,
      typeOfFile: req.body.typeOfFile || 'Leads',
      uploadStartTimestamp: new Date(),
      uploadedBy: req.body.email || user?.email || 'system',
      uploadCompleteTimestamp: new Date(),
    };

    await UploadLog.create(uploadDetails);
    req.uploadDetails = uploadDetails;
  } catch (err) {
    console.error('Error processing upload log:', err);
  }

  next();
};

module.exports = uploadLogMiddleware;
