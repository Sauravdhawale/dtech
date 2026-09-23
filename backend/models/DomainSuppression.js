const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  campaignId: { type: String, required: true },
  domain: { type: String, required: true },
  createdBy: { type: String, required: true }
});

schema.index({ campaignId: 1, domain: 1 });
module.exports = mongoose.model('DomainSuppression', schema);
