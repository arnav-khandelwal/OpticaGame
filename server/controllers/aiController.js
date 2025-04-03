const fetch = require('node-fetch');
const TableEntry = require('../models/TableEntry');
const config = require('../config/config');

// Generate AI response
exports.generateResponse = async (req, res) => {
  try {
    const { prompt, entryId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }
    
    if (!config.aiApiEnabled) {
      return res.status(400).json({ message: 'AI API integration is disabled' });
    }
    
    if (!config.aiApiKey) {
      return res.status(400).json({ message: 'AI API key is not configured' });
    }
    
    // Call AI API (OpenAI used as example)
    const response = await fetch(config.aiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiApiKey}`
      },
      body: JSON.stringify({
        model: config.aiModel,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Update entry with AI response if entryId is provided
    if (entryId) {
      await TableEntry.findByIdAndUpdate(entryId, { 
        aiResponse,
        updatedAt: Date.now()
      });
    }
    
    res.json({ aiResponse });
  } catch (err) {
    console.error('AI API Error:', err);
    res.status(500).json({ message: 'Error generating AI response', error: err.message });
  }
};

// Alternative AI providers
exports.generateGeminiResponse = async (req, res) => {
  try {
    const { prompt, entryId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }
    
    if (!config.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API key is not configured' });
    }
    
    // Call Gemini API
    const response = await fetch(`${config.geminiApiUrl}?key=${config.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Update entry with AI response if entryId is provided
    if (entryId) {
      await TableEntry.findByIdAndUpdate(entryId, { 
        aiResponse,
        updatedAt: Date.now()
      });
    }
    
    res.json({ aiResponse });
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ message: 'Error generating Gemini response', error: err.message });
  }
};