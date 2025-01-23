const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    title: {type:String, required:true},
    servings: {type:Number, required: true},
});

const RecipeModel = mongoose.model('Recipe', RecipeSchema);
module.exports = RecipeModel;