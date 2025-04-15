const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  image: { 
    type: Buffer,
    required: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: [{ 
    type: String 
  }],
  prepTime: {
    type: Number,
    default: 0
  },
  cookTime: {
    type: Number,
    default: 0
  },
  servings: {
    type: Number,
    default: 1
  },
  mealType: [{ 
    type: String 
  }],
  cuisine: [{ 
    type: String 
  }],
  diet: [{ 
    type: String 
  }],
  intolerance: [{ 
    type: String 
  }],
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  index: { 
    type: Number, 
    required: true 
  },
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
