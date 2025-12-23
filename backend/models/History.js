const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tool: {
    type: String,
    required: true,
    enum: ['EMI', 'BMI', 'SIP', 'GST', 'Interest']
  },
  inputs: {
    type: Object,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  date: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('History', HistorySchema);
