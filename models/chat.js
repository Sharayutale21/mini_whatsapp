const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  from: String,
  to: String,
  msg: String,
  created_at: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model("Chat", chatSchema);
