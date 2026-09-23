const mongoose = require('mongoose');

const leadsSchema = new mongoose.Schema({
  campaignId: { type: String, required: true },
  email: { type: String, required: true },
  domain: { type: String, required: true },
  lead_status: { type: String, default: 'Pending' },
  creationTime: { type: Date, default: Date.now }
}, { strict: false });

leadsSchema.index({ campaignId: 1, email: 1, domain: 1 });
module.exports = mongoose.model('Leads', leadsSchema);
