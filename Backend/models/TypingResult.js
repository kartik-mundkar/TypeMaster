const mongoose = require('mongoose');

const typingResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isGuest;
    }
  },
  sessionId: {
    type: String,
    required: function() {
      return this.isGuest;
    }
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  testConfig: {
    mode: {
      type: String,
      enum: ['time', 'words', 'quote'],
      required: true
    },
    timeLimit: Number, // for time mode
    wordCount: Number, // for words mode
    textSource: {
      type: String,
      enum: ['mixed', 'quotes', 'lorem', 'news'],
      default: 'mixed'
    },
    textContent: {
      type: String,
      required: true
    }
  },
  results: {
    wpm: {
      type: Number,
      required: true,
      min: 0
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    totalCharacters: {
      type: Number,
      required: true,
      min: 0
    },
    correctCharacters: {
      type: Number,
      required: true,
      min: 0
    },
    incorrectCharacters: {
      type: Number,
      default: 0,
      min: 0
    },
    timeElapsed: {
      type: Number,
      required: true,
      min: 0 // in seconds
    },
    completed: {
      type: Boolean,
      default: false // true if user completed the entire text
    }
  },
  typingData: {
    keystrokes: [{
      key: String,
      timestamp: Number, // relative to test start
      correct: Boolean
    }],
    mistakes: [{
      position: Number,
      expected: String,
      actual: String,
      timestamp: Number
    }],
    wpmHistory: [{
      timestamp: Number, // relative to test start
      wpm: Number
    }]
  },
  metadata: {
    userAgent: String,
    language: String,
    keyboard: String,
    testDate: {
      type: Date,
      default: Date.now
    },
    testDuration: Number, // total test duration in seconds
    tags: [String] // for categorizing tests
  }
}, {
  timestamps: true
});

// Index for efficient queries
typingResultSchema.index({ user: 1, 'metadata.testDate': -1 });
typingResultSchema.index({ sessionId: 1, 'metadata.testDate': -1 });
typingResultSchema.index({ 'results.wpm': -1 });
typingResultSchema.index({ 'results.accuracy': -1 });

module.exports = mongoose.model('TypingResult', typingResultSchema);
