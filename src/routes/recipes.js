const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');

// Validation middleware
const validateRecipe = [
  body('title').trim().notEmpty(),
  body('ingredients').isArray().notEmpty(),
  body('ingredients.*.name').trim().notEmpty(),
  body('ingredients.*.quantity').trim().notEmpty(),
  body('instructions').isArray().notEmpty(),
  body('instructions.*').trim().notEmpty(),
  body('tags').optional().isArray()
];

// Create recipe
router.post('/', auth, validateRecipe, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recipe = new Recipe({
      ...req.body,
      createdBy: req.user.id
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe' });
  }
});

// Get all recipes or search by title/tag
router.get('/', async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    const recipes = await Recipe.find(query)
      .populate('createdBy', 'email')
      .sort('-createdAt');

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes' });
  }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'email');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe' });
  }
});

// Update recipe
router.put('/:id', auth, validateRecipe, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const recipe = await Recipe.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    Object.assign(recipe, req.body);
    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe' });
  }
});

// Delete recipe
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe' });
  }
});

module.exports = router;