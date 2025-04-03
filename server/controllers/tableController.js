const TableEntry = require('../models/TableEntry');
const fetch = require('node-fetch');
const config = require('../config/config');

// Create a new table entry
exports.createEntry = async (req, res) => {
  try {
    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }
    
    // Find the highest serial number and increment by 1
    const lastEntry = await TableEntry.findOne({}).sort({ serialNumber: -1 });
    const serialNumber = lastEntry ? lastEntry.serialNumber + 1 : 1;
    
    // Create new table entry
    const newEntry = new TableEntry({
      user: req.user.id,
      serialNumber,
      imageUrl: `/uploads/${req.file.filename}`
    });
    
    // Get AI response if enabled
    if (config.aiApiEnabled && config.aiApiKey) {
      try {
        // Describe what you see in this image
        const prompt = "Analyze this image and describe what you see.";
        
        // Call the AI API
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
        
        if (response.ok) {
          const data = await response.json();
          newEntry.aiResponse = data.choices[0].message.content;
        }
      } catch (error) {
        console.error('AI API Error:', error);
        // Continue even if AI API fails
      }
    }
    
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all entries for current user
exports.getUserEntries = async (req, res) => {
  try {
    const entries = await TableEntry.find({ user: req.user.id }).sort({ serialNumber: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all entries (admin only)
exports.getAllEntries = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const entries = await TableEntry.find().populate('user', 'username').sort({ serialNumber: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
  try {
    // Find entry
    const entry = await TableEntry.findById(req.params.id);
    
    // Check if entry exists
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    // Check if user owns the entry or is admin
    if (entry.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await entry.remove();
    res.json({ message: 'Entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};