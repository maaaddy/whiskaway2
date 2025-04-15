const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    recipeId: { 
        type: String, 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    username: String,
    text: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
  });
  
  module.exports = mongoose.model('Comment', commentSchema);