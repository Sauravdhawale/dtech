const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  campaignId: { type: String, required: true },
  domain: { type: String, required: true },
  companyName: { type: String },
  createdBy: { type: String, required: true }
}, { strict: false });

module.exports = mongoose.model('Companies', CompanySchema);
