const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  userAgentId: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, default: 'Agent' },
  password: { type: String, required: true },
  campaignCount: { type: Number, default: 0 },
  totalLeads: { type: Number, default: 0 },
  totalAccepted: { type: Number, default: 0 },
  totalRejected: { type: Number, default: 0 },
  totalUnderReview: { type: Number, default: 0 },
  loginStatus: { type: Number, default: 0 },
  userStatus: { type: Number, default: 1 },
  token: { type: String, default: null },
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
