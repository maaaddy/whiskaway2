const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  recipeId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

likeSchema.index({ 
  recipeId: 1, 
  userId: 1 
}, { 
  unique: true 
});

module.exports = mongoose.model('Like', likeSchema);
