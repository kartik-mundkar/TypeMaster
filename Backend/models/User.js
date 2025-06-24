const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileData: {
    firstName: String,
    lastName: String,
    avatar: String,
    joinDate: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    defaultTestMode: {
      type: String,
      enum: ['time', 'words', 'quote'],
      default: 'time'
    },
    defaultTimeLimit: {
      type: Number,
      default: 30
    },
    defaultWordCount: {
      type: Number,
      default: 50
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalTests: {
      type: Number,
      default: 0
    },
    totalTimeTyping: {
      type: Number,
      default: 0 // in seconds
    },
    averageWPM: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    },
    bestWPM: {
      type: Number,
      default: 0
    },
    bestAccuracy: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
