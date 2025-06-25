const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow guest players
  },
  username: {
    type: String,
    required: true
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  progress: {
    type: Number,
    default: 0, // Percentage completed (0-100)
    min: 0,
    max: 100
  },
  wpm: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 100
  },
  typedText: {
    type: String,
    default: ''
  },
  isFinished: {
    type: Boolean,
    default: false
  },
  finishTime: {
    type: Date,
    default: null
  },
  rank: {
    type: Number,
    default: null
  }
});

const raceSchema = new mongoose.Schema({
  raceId: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  textSource: {
    type: String,
    enum: ['mixed', 'quotes', 'lorem', 'news'],
    default: 'mixed'
  },
  maxPlayers: {
    type: Number,
    default: 6,
    min: 2,
    max: 10
  },
  players: [playerSchema],
  status: {
    type: String,
    enum: ['waiting', 'countdown', 'active', 'finished'],
    default: 'waiting'
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  countdownStartTime: {
    type: Date,
    default: null
  },
  winner: {
    type: String, // username of winner
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries (raceId already has unique index)
raceSchema.index({ status: 1 });
raceSchema.index({ createdAt: -1 });

// Methods
raceSchema.methods.addPlayer = async function(playerData) {
  try {
    // Use atomic operation to add player
    const result = await this.constructor.findOneAndUpdate(
      { 
        _id: this._id,
        status: { $in: ['waiting', 'countdown'] }, // Allow joining during countdown too
        $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] },
        'players.socketId': { $ne: playerData.socketId }
      },
      {
        $push: { players: playerData }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      if (!['waiting', 'countdown'].includes(this.status)) {
        throw new Error('Race has already started or finished');
      }
      if (this.players.length >= this.maxPlayers) {
        throw new Error('Race is full');
      }
      const existingPlayer = this.players.find(p => p.socketId === playerData.socketId);
      if (existingPlayer) {
        throw new Error('Player already in race');
      }
      throw new Error('Failed to add player to race');
    }

    // Update local instance
    this.players = result.players;
    return this;
  } catch (error) {
    console.error('Error adding player:', error);
    throw error;
  }
};

raceSchema.methods.removePlayer = async function(socketId) {
  try {
    // Use atomic operation to avoid version conflicts
    const result = await this.constructor.findOneAndUpdate(
      { 
        _id: this._id,
        'players.socketId': socketId
      },
      {
        $pull: { players: { socketId: socketId } }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      console.log(`Player ${socketId} not found in race or race not found`);
      return this;
    }    // Update local instance
    this.players = result.players;

    // Don't mark race as finished just because it's empty
    // Let the cleanup mechanism in multiplayerRaceService handle empty races
    // This allows other players to still join the race

    return this;
  } catch (error) {
    console.error('Error removing player:', error);
    // Return current instance on error to prevent crashes
    return this;
  }
};

raceSchema.methods.updatePlayerProgress = async function(socketId, progressData) {
  try {
    // Find the player index for atomic update
    const playerIndex = this.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) {
      throw new Error('Player not found in race');
    }

    const updateFields = {};
    
    // Build update object for specific player
    Object.keys(progressData).forEach(key => {
      updateFields[`players.${playerIndex}.${key}`] = progressData[key];
    });

    // Check if player finished
    if (progressData.progress >= 100) {
      const finishedCount = this.players.filter(p => p.isFinished).length + 1;
      
      updateFields[`players.${playerIndex}.isFinished`] = true;
      updateFields[`players.${playerIndex}.finishTime`] = new Date();
      updateFields[`players.${playerIndex}.rank`] = finishedCount;
      
      // Set winner if this is the first to finish
      if (!this.winner) {
        updateFields.winner = this.players[playerIndex].username;
      }
    }

    // Use atomic operation to update player progress
    const result = await this.constructor.findOneAndUpdate(
      { 
        _id: this._id,
        [`players.${playerIndex}.socketId`]: socketId
      },
      { $set: updateFields },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      console.log(`Failed to update player ${socketId} progress`);
      return this;
    }

    // Update local instance
    this.players = result.players;
    this.winner = result.winner;

    // Check if race should end
    const activePlayers = result.players.filter(p => !p.isFinished);
    if (activePlayers.length === 0 || (result.players.length > 1 && activePlayers.length === 1)) {
      await this.constructor.findByIdAndUpdate(
        this._id,
        { 
          status: 'finished',
          endTime: new Date()
        },
        { new: true }
      );
      this.status = 'finished';
      this.endTime = new Date();
    }

    return this;
  } catch (error) {
    console.error('Error updating player progress:', error);
    return this;
  }
};

raceSchema.methods.startCountdown = async function() {
  try {
    const result = await this.constructor.findOneAndUpdate(
      { 
        _id: this._id,
        status: 'waiting'
      },
      {
        status: 'countdown',
        countdownStartTime: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      throw new Error('Race cannot start countdown - not in waiting status');
    }

    // Update local instance
    this.status = result.status;
    this.countdownStartTime = result.countdownStartTime;
    
    return this;
  } catch (error) {
    console.error('Error starting countdown:', error);
    throw error;
  }
};

raceSchema.methods.startRace = async function() {
  try {
    console.log(`Attempting to start race ${this.raceId} with current status: ${this.status}`);
    
    const result = await this.constructor.findOneAndUpdate(
      { 
        _id: this._id,
        status: 'countdown'
      },
      {
        status: 'active',
        startTime: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      const currentRace = await this.constructor.findById(this._id);
      if (!currentRace) {
        throw new Error('Race not found');
      }
      throw new Error(`Race must be in countdown to start. Current status: ${currentRace.status}`);
    }

    // Update local instance
    this.status = result.status;
    this.startTime = result.startTime;
    
    console.log(`Race ${this.raceId} started successfully at ${this.startTime}`);
    return this;
  } catch (error) {
    console.error('Error starting race:', error);
    throw error;
  }
};

module.exports = mongoose.model('Race', raceSchema);
