const mongoose = require('mongoose');

delete mongoose.connection.models['Campaign'];

const campaignSchema = new mongoose.Schema({
  campaignId: { type: String, required: true },
  campaignName: { type: String, required: true },
  campaignType: { type: String, required: true },
  campaignStatus: { type: String, required: true, default: "Created" },
  campaignAssets: { type: Array, required: true },
  campaignPacing: { type: String, required: true, default: "Created" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  uploaded: { type: Number, required: true, default: 0 },
  allocation: { type: Number, required: true, default: 0 },
  accepted: { type: Number, required: true, default: 0 },
  pending: { type: Number, required: true, default: 0 },
  rejected: { type: Number, required: true, default: 0 },
  leadUploadDate: { type: Date },
  createdBy: { type: String, required: true },
  campaignLeadTemplate: { type: Number, required: true, default: 0 },
  leadsUploadLogs: [{
    fileName: String,
    filePath: String,
    fileUploadName: String,
    fileSize: Number,
    uploadTimeStamp: { type: Date, default: Date.now },
    leadsAffected: Number,
    leadsInFile: Number,
    leadsAction: String,
    operationEndTime: Date
  }],
  creationTime: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('Campaign', campaignSchema);
