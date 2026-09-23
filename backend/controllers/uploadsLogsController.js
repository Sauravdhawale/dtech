// uploadLogMiddleware.js
const fs = require('fs');
const path = require('path');
const UploadLog = require('../models/UploadLog');

// Middleware to log file uploads
const uploadLogMiddleware = async (req, res, next) => {
  if (!req.file) {
    return next(); // If there's no file, continue to the next middleware
  }

  const startTime = new Date(); // Start timestamp
  const filePath = req.file.path; // Path of the uploaded file
  const fileName = req.file.originalname; // Original file name
  const fileType = req.file.mimetype; // MIME type of the file
  let numberOfRows = 0;

  try {
    // Count rows if CSV
    if (fileType === 'text/csv') {
      const fileStream = fs.createReadStream(filePath);
      const readline = require('readline');
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        numberOfRows++; // Count each row
      }
    }

    // Prepare the upload log details
    const uploadDetails = {
      fileName,
      filePath,
      numberOfRows,
      fileType,
      uploadStartTimestamp: startTime,
      uploadCompleteTimestamp: new Date(), // Complete timestamp (initially set)
    };

    // Save to uploadLogs collection
    const uploadLog = new UploadLog(uploadDetails);
    await uploadLog.save(); // Save the log to MongoDB

    // Assign uploadDetails to req to pass it to the next middleware/controller
    req.uploadDetails = uploadDetails;
  } catch (err) {
    console.error('Error processing upload log:', err);
  }

  next(); // Move to the next middleware/controller
};

module.exports = uploadLogMiddleware;