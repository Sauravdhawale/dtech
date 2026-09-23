const mongoose = require('mongoose');

const uploadLogSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  campaignId: { type: String, required: true },
  filePath: { type: String, required: true },
  fileUploadName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  numberOfRows: { type: Number, required: true },
  fileType: { type: String, required: true },
  uploadStartTimestamp: { type: Date, required: true },
  uploadCompleteTimestamp: { type: Date, required: true },
  uploadedBy: { type: String, required: true },
  typeOfFile: { type: String, required: true }
});

module.exports = mongoose.model('UploadLog', uploadLogSchema);
