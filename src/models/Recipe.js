const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    required: true,
    trim: true
  }
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [ingredientSchema],
  instructions: [{
    type: String,
    required: true,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient searching
recipeSchema.index({ title: 'text' });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);