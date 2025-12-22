const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tool: { type: String, required: true },
  inputs: { type: String, required: true },
  result: { type: String, required: true },
  date: { type: String }, // Store formatted date string
}, { timestamps: true });

module.exports = mongoose.model('History', HistorySchema);