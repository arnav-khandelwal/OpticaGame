const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// @route   POST api/ai/generate
// @desc    Generate AI response
// @access  Private
router.post('/generate', auth, aiController.generateResponse);

// @route   POST api/ai/gemini
// @desc    Generate Gemini AI response
// @access  Private
router.post('/gemini', auth, aiController.generateGeminiResponse);

module.exports = router;