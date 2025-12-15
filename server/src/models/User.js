const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: String,
  skills: [String],
  vector: { type: [Number], index: '2dsphere' }, // placeholder for vector data
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);