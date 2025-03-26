const mongoose = require('mongoose');

const cookbookSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipes: [{ 
    type: String 
  }],
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  coverImage: {
    type: String,
    default: 'cover5.JPG'
  },  
});

const Cookbook = mongoose.model('Cookbook', cookbookSchema);
module.exports = Cookbook;
