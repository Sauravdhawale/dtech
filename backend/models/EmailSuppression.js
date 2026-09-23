const mongoose = require('mongoose');

delete mongoose.connection.models['EmailSuppression'];

const schema = new mongoose.Schema({
  campaignId: { type: String, required: true },
  email: { type: String, required: true },
  createdByUser: { type: String, required: true }
});

schema.index({ campaignId: 1, email: 1 });
module.exports = mongoose.model('EmailSuppression', schema);
