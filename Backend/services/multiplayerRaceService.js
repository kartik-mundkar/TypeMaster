const { Server } = require('socket.io');
const Race = require('../models/Race');
const textService = require('./textService');
const { v4: uuidv4 } = require('uuid');

class MultiplayerRaceService {
  constructor() {
    this.io = null;
    this.activeRaces = new Map(); // raceId -> race data
    this.playerSockets = new Map(); // socketId -> { raceId, username }
    this.scheduledCleanups = new Set(); // Track races scheduled for cleanup
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupSocketHandlers();
    
    // Clean up old races on startup
    this.cleanupOldRaces();
    
    console.log('🚀 Socket.IO server initialized for multiplayer racing');
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 Player connected: ${socket.id}`);

      // Join a race (either find existing or create new)
      socket.on('join-race', async (data) => {
        console.log(`🎯 Join race event received from ${socket.id}:`, data);
        try {
          await this.handleJoinRace(socket, data);
        } catch (error) {
          console.error(`❌ Error in join-race for ${socket.id}:`, error);
          socket.emit('race-error', { message: error.message });
        }
      });

      // Join specific race by ID
      socket.on('join-race-by-id', async (data) => {
        try {
          await this.handleJoinRaceById(socket, data);
        } catch (error) {
          socket.emit('race-error', { message: error.message });
        }
      });

      // Player progress update
      socket.on('player-progress', async (data) => {
        try {
          await this.handlePlayerProgress(socket, data);
        } catch (error) {
          socket.emit('race-error', { message: error.message });
        }
      });

      // Player ready for race start
      socket.on('player-ready', async () => {
        try {
          await this.handlePlayerReady(socket);
        } catch (error) {
          socket.emit('race-error', { message: error.message });
        }
      });

      // Leave race
      socket.on('leave-race', async () => {
        try {
          await this.handleLeaveRace(socket);
        } catch (error) {
          socket.emit('race-error', { message: error.message });
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`👤 Player disconnected: ${socket.id}`);
        // Only handle disconnect if player is still in a race
        const playerInfo = this.playerSockets.get(socket.id);
        if (playerInfo) {
          console.log(`🚨 Disconnect cleanup for player ${playerInfo.username} in race ${playerInfo.raceId}`);
          await this.handleLeaveRace(socket);
        } else {
          console.log(`ℹ️ Player ${socket.id} already cleaned up, no action needed`);
        }
      });
    });
  }

  async handleJoinRace(socket, { username, isGuest = true, userId = null }) {
    console.log(`🏁 handleJoinRace called for ${socket.id}, username: ${username}`);
    
    // Check if player is already in a race
    const existingPlayerInfo = this.playerSockets.get(socket.id);
    if (existingPlayerInfo) {
      console.log(`⚠️ Player ${socket.id} already in race ${existingPlayerInfo.raceId}`);
      return;
    }
    
    // Check current race count before searching
    const totalRaces = await Race.countDocuments();
    const joinableRaces = await Race.countDocuments({ status: { $in: ['waiting', 'countdown'] } });
    console.log(`📊 Current races: ${totalRaces} total, ${joinableRaces} joinable (waiting + countdown)`);
    
    // Find an available race or create a new one
    let race = await this.findAvailableRace();
    console.log(`🔍 Found available race:`, race ? `${race.raceId} (status: ${race.status})` : 'none');
    
    if (!race) {
      console.log(`🆕 Creating new race...`);
      race = await this.createNewRace();
      console.log(`✅ Created new race: ${race.raceId}`);
    }

    await this.joinPlayerToRace(socket, race, { username, isGuest, userId });
  }

  async handleJoinRaceById(socket, { raceId, username, isGuest = true, userId = null }) {
    // Use atomic query to ensure race exists, is joinable, and has space
    const race = await Race.findOne({ 
      raceId, 
      status: { $in: ['waiting', 'countdown'] }, // Allow joining during countdown too
      $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] } // Ensure race has space
    });
    
    if (!race) {
      // Check what the actual issue is for better error messages
      const raceCheck = await Race.findOne({ raceId });
      if (!raceCheck) {
        throw new Error('Race not found');
      } else if (!['waiting', 'countdown'].includes(raceCheck.status)) {
        throw new Error(`Race has already ${raceCheck.status === 'active' ? 'started' : 'finished'}`);
      } else if (raceCheck.players.length >= raceCheck.maxPlayers) {
        throw new Error(`Race is full (${raceCheck.players.length}/${raceCheck.maxPlayers} players)`);
      } else {
        throw new Error('Unable to join race');
      }
    }

    await this.joinPlayerToRace(socket, race, { username, isGuest, userId });
  }

  async joinPlayerToRace(socket, race, playerData) {
    // Double-check race capacity and status before proceeding
    if (race.players.length >= race.maxPlayers) {
      throw new Error(`Race is full (${race.players.length}/${race.maxPlayers} players)`);
    }

    if (!['waiting', 'countdown'].includes(race.status)) {
      throw new Error(`Cannot join race - race has already ${race.status === 'active' ? 'started' : 'finished'}`);
    }

    // Add player to race
    const player = {
      socketId: socket.id,
      username: playerData.username,
      isGuest: playerData.isGuest,
      userId: playerData.userId
    };

    console.log(`📥 Adding player ${playerData.username} to race ${race.raceId}`);
    console.log(`Players before adding: ${race.players.length}/${race.maxPlayers}, status: ${race.status}`);

    await race.addPlayer(player);

    console.log(`Players after adding: ${race.players.length}/${race.maxPlayers}`);

    // Join socket room
    socket.join(race.raceId);
    console.log(`🏠 Player ${playerData.username} joined room: ${race.raceId}`);
    
    // Store player info
    this.playerSockets.set(socket.id, {
      raceId: race.raceId,
      username: playerData.username
    });

    // Send race data to player
    socket.emit('race-joined', {
      raceId: race.raceId,
      text: race.text,
      players: race.players,
      status: race.status,
      maxPlayers: race.maxPlayers
    });

    // Notify other players
    socket.to(race.raceId).emit('player-joined', {
      player: player,
      totalPlayers: race.players.length
    });

    // Check if race should start countdown
    console.log(`🔍 Checking countdown conditions: ${race.players.length} players, status: ${race.status}`);
    const minPlayers = parseInt(process.env.MIN_PLAYERS_TO_START) || 2;
    
    if (race.players.length >= minPlayers && race.status === 'waiting') {
      console.log(`🚀 Starting countdown for race ${race.raceId}`);
      await this.startCountdown(race);
    } else {
      console.log(`⏳ Not starting countdown: ${race.players.length} players (need ${minPlayers}+), status: ${race.status} (need waiting)`);
    }
  }

  async handlePlayerProgress(socket, progressData) {
    try {
      const playerInfo = this.playerSockets.get(socket.id);
      if (!playerInfo) return;

      const race = await Race.findOne({ raceId: playerInfo.raceId });
      if (!race || race.status !== 'active') return;

      // Update player progress
      await race.updatePlayerProgress(socket.id, progressData);

      // Broadcast progress to all players in race
      this.io.to(race.raceId).emit('player-progress-update', {
        socketId: socket.id,
        username: playerInfo.username,
        ...progressData
      });

      // Check if race finished
      if (race.status === 'finished') {
        await this.finishRace(race);
      }
    } catch (error) {
      console.error('Error handling player progress:', error);
      // Continue operation - don't crash the service
    }
  }

  async handlePlayerReady(socket) {
    const playerInfo = this.playerSockets.get(socket.id);
    if (!playerInfo) return;

    // For now, we'll auto-start when players join
    // This can be extended for manual ready system
    socket.emit('ready-acknowledged');
  }

  async handleLeaveRace(socket) {
    try {
      const playerInfo = this.playerSockets.get(socket.id);
      if (!playerInfo) {
        console.log(`ℹ️ Player ${socket.id} not found in any race (already cleaned up)`);
        return;
      }

      console.log(`👋 Player ${playerInfo.username} leaving race ${playerInfo.raceId}`);

      // Remove from playerSockets first to prevent duplicate calls
      this.playerSockets.delete(socket.id);
      socket.leave(playerInfo.raceId);

      const race = await Race.findOne({ raceId: playerInfo.raceId });
      if (!race) {
        console.log(`⚠️ Race ${playerInfo.raceId} not found in database (may have been deleted)`);
        return;
      }

      console.log(`🔢 Race ${race.raceId} has ${race.players.length} players before removal`);
      
      try {
        await race.removePlayer(socket.id);
      } catch (error) {
        console.log(`Player ${socket.id} not found in race or race not found`);
        return;
      }
      
      // Re-fetch race to get updated player count
      const updatedRace = await Race.findOne({ raceId: playerInfo.raceId });
      if (!updatedRace) {
        console.log(`⚠️ Race ${playerInfo.raceId} was deleted during player removal`);
        return;
      }
      
      const remainingPlayers = updatedRace.players.length;
      console.log(`📊 After player removal: ${remainingPlayers} players remaining`);
      
      // Notify other players
      socket.to(playerInfo.raceId).emit('player-left', {
        username: playerInfo.username,
        remainingPlayers: remainingPlayers
      });

      // If race becomes empty, schedule cleanup with a delay to allow other players to join
      if (remainingPlayers === 0) {
        await this.scheduleRaceCleanup(playerInfo.raceId);
      }
    } catch (error) {
      console.error('Error handling player leave:', error);
      // Clean up socket mapping even if database operation fails
      const playerInfo = this.playerSockets.get(socket.id);
      if (playerInfo) {
        this.playerSockets.delete(socket.id);
        socket.leave(playerInfo.raceId);
      }
    }
  }

  async scheduleRaceCleanup(raceId) {
    if (this.scheduledCleanups.has(raceId)) {
      console.log(`ℹ️ Race ${raceId} cleanup already scheduled, skipping`);
      return;
    }

    console.log(`⏳ Race ${raceId} is now empty. Scheduling cleanup in 30 seconds...`);
    this.scheduledCleanups.add(raceId);
    
    setTimeout(async () => {
      try {
        // Re-fetch race to check if it's still empty
        const raceCheck = await Race.findOne({ raceId: raceId });
        if (raceCheck && raceCheck.players.length === 0 && raceCheck.status === 'waiting') {
          await Race.deleteOne({ _id: raceCheck._id });
          console.log(`🗑️ Deleted empty race: ${raceId}`);
        } else if (raceCheck) {
          console.log(`✅ Race ${raceId} now has ${raceCheck.players.length} players, keeping it`);
        } else {
          console.log(`ℹ️ Race ${raceId} was already deleted`);
        }
      } catch (error) {
        console.error('Error in delayed race cleanup:', error);
      } finally {
        // Always remove from scheduled cleanups
        this.scheduledCleanups.delete(raceId);
      }
    }, 30000); // 30 second delay
  }

  async findAvailableRace() {
    // First, let's see all races for debugging
    const allRaces = await Race.find({}, 'raceId status isPublic players maxPlayers');
    console.log(`🔍 All races in DB:`, allRaces.map(r => `${r.raceId}: status=${r.status}, isPublic=${r.isPublic}, players=${r.players.length}/${r.maxPlayers}`));
    
    // Look for a race that is:
    // 1. In 'waiting' or 'countdown' status (allow joining during countdown too)
    // 2. Public (joinable by anyone)
    // 3. Has space for more players
    const race = await Race.findOne({
      status: { $in: ['waiting', 'countdown'] }, // Allow joining races in countdown too
      isPublic: true,
      $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] }
    }).sort({ createdAt: 1 }); // Get the oldest waiting race first
    
    console.log(`🔍 Available race search result: ${race ? `Found ${race.raceId} with ${race.players.length}/${race.maxPlayers} players (status: ${race.status})` : 'none'}`);
    return race;
  }

  async createNewRace() {
    const raceId = uuidv4();
    const text = await textService.getRandomText({
      source: 'mixed',
      mode: 'words', 
      wordCount: 50,
      difficulty: 'medium'
    });

    const race = new Race({
      raceId,
      text,
      textSource: 'mixed',
      isPublic: true, // Explicitly set to ensure it's findable
      maxPlayers: parseInt(process.env.MAX_PLAYERS_PER_RACE) || 6
    });

    await race.save();
    console.log(`🏁 New race created: ${raceId} with status: ${race.status}, isPublic: ${race.isPublic}, players: ${race.players.length}`);
    return race;
  }

  async startCountdown(race) {
    console.log(`🕒 Starting countdown for race ${race.raceId}, current status: ${race.status}`);
    
    try {
      // Check if countdown is already running
      if (race.status === 'countdown') {
        console.log(`⚠️ Countdown already running for race ${race.raceId}`);
        return;
      }
      
      await race.startCountdown();
      
      const countdownSeconds = parseInt(process.env.RACE_COUNTDOWN_SECONDS) || 5;
      
      console.log(`📢 Notifying players countdown started: ${countdownSeconds} seconds`);
      
      // Notify players countdown started
      this.io.to(race.raceId).emit('countdown-started', {
        countdownSeconds
      });

      // Start countdown
      let timeLeft = countdownSeconds;
      const countdownInterval = setInterval(async () => {
        console.log(`⏰ Countdown tick: ${timeLeft}`);
        this.io.to(race.raceId).emit('countdown-tick', { timeLeft });
        timeLeft--;

        if (timeLeft < 0) {
          clearInterval(countdownInterval);
          console.log(`🏁 Starting race ${race.raceId}`);
          
          // Fetch fresh race instance to ensure it exists and is in countdown status
          try {
            const freshRace = await Race.findOne({ raceId: race.raceId });
            if (!freshRace) {
              console.log(`📭 Race ${race.raceId} was deleted during countdown (likely due to all players leaving)`);
              return;
            }
            
            console.log(`Race status before starting: ${freshRace.status}`);
            if (freshRace.status === 'countdown') {
              await this.startRace(freshRace);
            } else {
              console.warn(`⚠️ Cannot start race ${race.raceId} - status is ${freshRace.status}, expected 'countdown'`);
            }
          } catch (error) {
            console.error('Error starting race:', error);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Error in startCountdown:', error);
    }
  }

  async startRace(race) {
    try {
      console.log(`🏁 Attempting to start race ${race.raceId} with status: ${race.status}`);
      await race.startRace();
      
      this.io.to(race.raceId).emit('race-started', {
        startTime: race.startTime
      });

      console.log(`✅ Race started successfully: ${race.raceId}`);
    } catch (error) {
      console.error(`❌ Error starting race ${race.raceId}:`, error.message);
      // Notify players about the error
      this.io.to(race.raceId).emit('race-error', {
        message: 'Failed to start race. Please try again.'
      });
      throw error;
    }
  }

  async finishRace(race) {
    // Calculate final rankings
    const rankedPlayers = race.players
      .filter(p => p.isFinished)
      .sort((a, b) => a.rank - b.rank);

    this.io.to(race.raceId).emit('race-finished', {
      winner: race.winner,
      rankings: rankedPlayers,
      raceStats: {
        duration: race.endTime - race.startTime,
        totalPlayers: race.players.length,
        finishedPlayers: rankedPlayers.length
      }
    });

    console.log(`🏁 Race finished: ${race.raceId}, Winner: ${race.winner}`);

    // Clean up after 30 seconds
    setTimeout(async () => {
      await Race.deleteOne({ _id: race._id });
    }, 30000);
  }

  async cleanupOldRaces() {
    try {
      // Remove finished races that are older than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const result = await Race.deleteMany({
        status: 'finished',
        updatedAt: { $lt: oneHourAgo }
      });
      
      if (result.deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${result.deletedCount} old finished races`);
      }
      
      // Also clean up any empty waiting races older than 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const emptyRacesResult = await Race.deleteMany({
        status: 'waiting',
        'players.0': { $exists: false }, // No players
        updatedAt: { $lt: fiveMinutesAgo }
      });
      
      if (emptyRacesResult.deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${emptyRacesResult.deletedCount} old empty waiting races`);
      }
    } catch (error) {
      console.error('Error cleaning up old races:', error);
    }
  }

  // Get active race statistics
  getRaceStats() {
    return {
      activeRaces: this.activeRaces.size,
      connectedPlayers: this.playerSockets.size
    };
  }
}

module.exports = new MultiplayerRaceService();
