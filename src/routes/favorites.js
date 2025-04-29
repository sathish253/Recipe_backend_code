const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');

// Add recipe to favorites
router.post('/:userId/favorites/:recipeId', auth, async (req, res) => {
  try {
    // Ensure user can only modify their own favorites
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Create favorite
    const favorite = new Favorite({
      user: req.user.id,
      recipe: req.params.recipeId
    });

    await favorite.save();
    res.status(201).json({ message: 'Recipe added to favorites' });
  } catch (error) {
    // Handle duplicate favorite
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Recipe already in favorites' });
    }
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

// Remove recipe from favorites
router.delete('/:userId/favorites/:recipeId', auth, async (req, res) => {
  try {
    // Ensure user can only modify their own favorites
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      recipe: req.params.recipeId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites' });
  }
});

// Get user's favorite recipes
router.get('/:userId/favorites', auth, async (req, res) => {
  try {
    // Ensure user can only view their own favorites
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'recipe',
        populate: {
          path: 'createdBy',
          select: 'email'
        }
      })
      .sort('-createdAt');

    const recipes = favorites.map(favorite => favorite.recipe);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

module.exports = router;