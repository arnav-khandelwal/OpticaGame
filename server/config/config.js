const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  mongoURI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tableProject',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  jwtExpire: '1d', // Token expires in 1 day
  
  // AI API configuration
  aiApiEnabled: process.env.AI_API_ENABLED === 'true',
  aiApiUrl: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'gpt-3.5-turbo',
  
  // Gemini AI API configuration
  geminiApiUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  // File upload configuration
  uploadDir: 'uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif']
};