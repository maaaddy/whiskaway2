const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  instructions: { type: String },
  ingredients: [{ type: String }],
  apiId: { type: String, required: true },
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
