const express = require('express');
const router = express.Router();
const Race = require('../models/Race');
const multiplayerRaceService = require('../services/multiplayerRaceService');
const { authenticateToken } = require('../middleware/auth');

// Get active races (public races that can be joined)
router.get('/active', async (req, res) => {
  try {
    const races = await Race.find({
      status: 'waiting',
      isPublic: true,
      $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] }
    })
    .select('raceId textSource maxPlayers players.username players.isGuest createdAt')
    .limit(20)
    .sort({ createdAt: -1 });

    const racesWithPlayerCount = races.map(race => ({
      raceId: race.raceId,
      textSource: race.textSource,
      maxPlayers: race.maxPlayers,
      currentPlayers: race.players.length,
      players: race.players.map(p => ({
        username: p.username,
        isGuest: p.isGuest
      })),
      createdAt: race.createdAt
    }));

    res.json({
      success: true,
      races: racesWithPlayerCount
    });
  } catch (error) {
    console.error('Error fetching active races:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active races'
    });
  }
});

// Get race details by ID
router.get('/:raceId', async (req, res) => {
  try {
    const { raceId } = req.params;
    
    const race = await Race.findOne({ raceId })
      .select('-__v -updatedAt');

    if (!race) {
      return res.status(404).json({
        success: false,
        message: 'Race not found'
      });
    }

    res.json({
      success: true,
      race: {
        raceId: race.raceId,
        textSource: race.textSource,
        maxPlayers: race.maxPlayers,
        status: race.status,
        currentPlayers: race.players.length,
        players: race.players.map(p => ({
          username: p.username,
          isGuest: p.isGuest,
          progress: p.progress,
          wpm: p.wpm,
          accuracy: p.accuracy,
          isFinished: p.isFinished,
          rank: p.rank
        })),
        winner: race.winner,
        startTime: race.startTime,
        endTime: race.endTime,
        createdAt: race.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching race details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch race details'
    });
  }
});

// Create a new private race
router.post('/create', async (req, res) => {
  try {
    const { textSource = 'mixed', maxPlayers = 6, isPublic = false } = req.body;
    
    // For private races, we'll need authentication
    if (!isPublic) {
      // This would require authentication middleware
      // For now, we'll allow public race creation
    }    const textService = require('../services/textService');
    const { v4: uuidv4 } = require('uuid');
    
    const raceId = uuidv4();
    const text = await textService.getRandomText({
      source: textSource,
      mode: 'words',
      wordCount: 50,
      difficulty: 'medium'
    });

    const race = new Race({
      raceId,
      text,
      textSource,
      maxPlayers: Math.min(Math.max(maxPlayers, 2), 10), // Between 2-10 players
      isPublic
    });

    await race.save();

    res.status(201).json({
      success: true,
      race: {
        raceId: race.raceId,
        textSource: race.textSource,
        maxPlayers: race.maxPlayers,
        isPublic: race.isPublic
      }
    });
  } catch (error) {
    console.error('Error creating race:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create race'
    });
  }
});

// Get race statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalRaces = await Race.countDocuments();
    const activeRaces = await Race.countDocuments({ status: { $in: ['waiting', 'countdown', 'active'] } });
    const finishedRaces = await Race.countDocuments({ status: 'finished' });
    
    // Get current connected players from service
    const serviceStats = multiplayerRaceService.getRaceStats();

    res.json({
      success: true,
      stats: {
        totalRaces,
        activeRaces,
        finishedRaces,
        connectedPlayers: serviceStats.connectedPlayers,
        racesInProgress: serviceStats.activeRaces
      }
    });
  } catch (error) {
    console.error('Error fetching race stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch race statistics'
    });
  }
});

// Get recent race results (leaderboard)
router.get('/results/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentRaces = await Race.find({
      status: 'finished',
      winner: { $ne: null }
    })
    .select('raceId winner players.username players.wpm players.accuracy players.rank players.finishTime endTime')
    .limit(limit)
    .sort({ endTime: -1 });

    const results = recentRaces.map(race => {
      const winnerData = race.players.find(p => p.username === race.winner);
      return {
        raceId: race.raceId,
        winner: race.winner,
        winnerStats: winnerData ? {
          wpm: winnerData.wpm,
          accuracy: winnerData.accuracy,
          finishTime: winnerData.finishTime
        } : null,
        totalPlayers: race.players.length,
        endTime: race.endTime
      };
    });

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error fetching race results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch race results'
    });
  }
});

module.exports = router;
