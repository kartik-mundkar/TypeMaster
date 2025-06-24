const express = require('express');
const router = express.Router();
const textService = require('../services/textService');

// GET /api/text/random - Get random text
router.get('/random', async (req, res) => {
  try {
    const { 
      source = 'local', 
      mode = 'time', 
      wordCount = 50,
      difficulty = 'medium'
    } = req.query;

    const text = await textService.getRandomText({
      source,
      mode,
      wordCount: parseInt(wordCount),
      difficulty
    });

    res.json({
      success: true,
      data: {
        text,
        source,
        wordCount: text.split(' ').length,
        characterCount: text.length
      }
    });
  } catch (error) {
    console.error('Error in /random route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch text',
      message: error.message
    });
  }
});

// GET /api/text/quotes - Get quotes specifically
router.get('/quotes', async (req, res) => {
  try {
    const { category, minLength = 100, maxLength = 300 } = req.query;
    
    const text = await textService.getQuotes({
      category,
      minLength: parseInt(minLength),
      maxLength: parseInt(maxLength)
    });

    res.json({
      success: true,
      data: {
        text,
        source: 'quotes',
        wordCount: text.split(' ').length,
        characterCount: text.length
      }
    });
  } catch (error) {
    console.error('Error in /quotes route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quotes',
      message: error.message
    });
  }
});

// GET /api/text/lorem - Get lorem ipsum text
router.get('/lorem', async (req, res) => {
  try {
    const { paragraphs = 4 } = req.query;
    
    const text = await textService.getLoremText({
      paragraphs: parseInt(paragraphs)
    });

    res.json({
      success: true,
      data: {
        text,
        source: 'lorem',
        wordCount: text.split(' ').length,
        characterCount: text.length
      }
    });
  } catch (error) {
    console.error('Error in /lorem route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lorem text',
      message: error.message
    });
  }
});

// GET /api/text/news - Get news-based text
router.get('/news', async (req, res) => {
  try {
    const { topic = 'technology' } = req.query;
    
    const text = await textService.getNewsText({
      topic
    });

    res.json({
      success: true,
      data: {
        text,
        source: 'news',
        wordCount: text.split(' ').length,
        characterCount: text.length
      }
    });
  } catch (error) {
    console.error('Error in /news route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news text',
      message: error.message
    });
  }
});

// GET /api/text/sources - Get available text sources
router.get('/sources', (req, res) => {
  res.json({
    success: true,
    data: {      sources: [
        { id: 'mixed', name: 'Mixed Content', description: 'Random selection from various sources' },
        { id: 'quotes', name: 'Quotes', description: 'Inspirational and famous quotes' },
        { id: 'lorem', name: 'Lorem Ipsum', description: 'Classic placeholder text' },
        { id: 'news', name: 'News Articles', description: 'Recent news content' }
      ]
    }
  });
});

module.exports = router;
