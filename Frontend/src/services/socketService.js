import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(serverUrl = API_CONFIG.SOCKET_URL) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  // Race events
  joinRace(userData) {
    console.log('Joining race with data:', userData);
    if (!this.socket) {
      console.error('Socket not connected when trying to join race');
      return;
    }
    this.socket.emit('join-race', userData);
  }

  joinRaceById(raceId, userData) {
    if (!this.socket) return;
    this.socket.emit('join-race-by-id', { raceId, ...userData });
  }

  leaveRace() {
    if (!this.socket) return;
    this.socket.emit('leave-race');
  }

  sendPlayerProgress(progressData) {
    if (!this.socket) return;
    this.socket.emit('player-progress', progressData);
  }

  playerReady() {
    if (!this.socket) return;
    this.socket.emit('player-ready');
  }

  // Event listeners
  onRaceJoined(callback) {
    if (!this.socket) return;
    this.socket.on('race-joined', callback);
  }

  onPlayerJoined(callback) {
    if (!this.socket) return;
    this.socket.on('player-joined', callback);
  }

  onPlayerLeft(callback) {
    if (!this.socket) return;
    this.socket.on('player-left', callback);
  }

  onCountdownStarted(callback) {
    if (!this.socket) return;
    this.socket.on('countdown-started', callback);
  }

  onCountdownTick(callback) {
    if (!this.socket) return;
    this.socket.on('countdown-tick', callback);
  }

  onRaceStarted(callback) {
    if (!this.socket) return;
    this.socket.on('race-started', callback);
  }

  onPlayerProgressUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('player-progress-update', callback);
  }

  onRaceFinished(callback) {
    if (!this.socket) return;
    this.socket.on('race-finished', callback);
  }

  onRaceError(callback) {
    if (!this.socket) return;
    this.socket.on('race-error', callback);
  }

  // Connection event listeners
  onConnect(callback) {
    if (!this.socket) return;
    this.socket.on('connect', callback);
  }

  onDisconnect(callback) {
    if (!this.socket) return;
    this.socket.on('disconnect', callback);
  }

  onConnectError(callback) {
    if (!this.socket) return;
    this.socket.on('connect_error', callback);
  }

  // Clean up event listeners
  removeAllListeners() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }

  removeListener(event) {
    if (!this.socket) return;
    this.socket.off(event);
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }
}

export default new SocketService();
