import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import './MultiplayerRacePage.css';

const MultiplayerRacePage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  // Race state
  const [raceStatus, setRaceStatus] = useState('disconnected'); // disconnected, waiting, countdown, active, finished
  const [raceData, setRaceData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [raceResults, setRaceResults] = useState(null);
  
  // User state
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  // Statistics
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // Connect to socket server
    socketService.connect();

    // Set up event listeners
    socketService.onRaceJoined(handleRaceJoined);
    socketService.onPlayerJoined(handlePlayerJoined);
    socketService.onPlayerLeft(handlePlayerLeft);
    socketService.onCountdownStarted(handleCountdownStarted);
    socketService.onCountdownTick(handleCountdownTick);
    socketService.onRaceStarted(handleRaceStarted);
    socketService.onPlayerProgressUpdate(handlePlayerProgressUpdate);
    socketService.onRaceFinished(handleRaceFinished);
    socketService.onRaceError(handleRaceError);

    // Prevent page scrolling during typing
    const preventScrolling = (e) => {
      if (raceStatus === 'active' && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', preventScrolling);

    return () => {
      socketService.leaveRace();
      socketService.removeAllListeners();
      socketService.disconnect();
      document.removeEventListener('keydown', preventScrolling);
    };
  }, [raceStatus]);
  const handleRaceJoined = (data) => {
    console.log('Race joined:', data);
    setRaceData(data);
    setCurrentText(data.text);
    setPlayers(data.players);
    setRaceStatus('waiting');
    setError('');
    
    // Focus input for typing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        console.log('Input focused, race status:', raceStatus);
      }
    }, 100);
  };

  const handlePlayerJoined = (data) => {
    console.log('Player joined:', data);
    setPlayers(prev => [...prev, data.player]);
  };

  const handlePlayerLeft = (data) => {
    console.log('Player left:', data);
    setPlayers(prev => prev.filter(p => p.username !== data.username));
  };

  const handleCountdownStarted = (data) => {
    console.log('Countdown started:', data);
    setRaceStatus('countdown');
    setCountdown(data.countdownSeconds);
  };

  const handleCountdownTick = (data) => {
    setCountdown(data.timeLeft);
  };
  const handleRaceStarted = (data) => {
    console.log('Race started:', data);
    setRaceStatus('active');
    setStartTime(Date.now());
    setCountdown(null);
    
    // Ensure input is focused when race starts
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        console.log('Input focused after race start');
      }
    }, 100);
  };

  const handlePlayerProgressUpdate = (data) => {
    setPlayers(prev => 
      prev.map(player => 
        player.socketId === data.socketId 
          ? { ...player, ...data }
          : player
      )
    );
  };

  const handleRaceFinished = (data) => {
    console.log('Race finished:', data);
    setRaceStatus('finished');
    setRaceResults(data);
  };

  const handleRaceError = (data) => {
    console.error('Race error:', data);
    setError(data.message);
    setIsJoining(false);
  };
  const calculateStats = useCallback(() => {
    if (!startTime || !currentText) return;

    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const wordsTyped = typedText.trim().split(' ').length;
    const charactersTyped = typedText.length;
    const correctCharacters = typedText.split('').filter((char, i) => char === currentText[i]).length;
    
    const newWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
    const newAccuracy = charactersTyped > 0 ? Math.round((correctCharacters / charactersTyped) * 100) : 100;
    const newProgress = Math.round((typedText.length / currentText.length) * 100);

    setWpm(newWpm);
    setAccuracy(newAccuracy);
    setProgress(newProgress);

    // Send progress to other players
    socketService.sendPlayerProgress({
      progress: newProgress,
      wpm: newWpm,
      accuracy: newAccuracy,
      typedText: typedText
    });
  }, [startTime, currentText, typedText]);

  useEffect(() => {
    if (raceStatus === 'active' && startTime) {
      calculateStats();
    }  }, [typedText, startTime, raceStatus, currentText, calculateStats]);

  // Effect to manage input focus during active race
  useEffect(() => {
    if (raceStatus === 'active' && inputRef.current) {
      inputRef.current.focus();
      
      // Maintain focus if it gets lost
      const maintainFocus = () => {
        if (raceStatus === 'active' && inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      };

      const focusInterval = setInterval(maintainFocus, 1000);
      
      return () => clearInterval(focusInterval);
    }
  }, [raceStatus]);

  const handleJoinRace = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsJoining(true);
    setError('');
    
    socketService.joinRace({
      username: username.trim(),
      isGuest: true
    });
  };  const handleInputChange = (e) => {
    console.log('Input change attempted, race status:', raceStatus);
    
    if (raceStatus !== 'active') {
      console.log('Input blocked - race not active');
      return;
    }
    
    const value = e.target.value;
    console.log('Typing value:', value);
    
    // Prevent typing beyond text length
    if (value.length > currentText.length) return;
    
    setTypedText(value);

    // Check if race is complete
    if (value.length === currentText.length && value === currentText) {
      // Race completed!
      setProgress(100);
      console.log('Race completed!');
    }
  };

  const handleKeyDown = (e) => {
    // Prevent page scrolling and other default behaviors
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    
    // Handle spacebar specifically
    if (e.code === 'Space') {
      e.preventDefault();
      if (raceStatus === 'active') {
        const currentValue = inputRef.current?.value || '';
        const newValue = currentValue + ' ';
        if (newValue.length <= currentText.length) {
          setTypedText(newValue);
        }
      }
    }
  };

  const handleKeyPress = (e) => {
    // Prevent default for space to avoid scrolling
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const handleLeaveRace = () => {
    socketService.leaveRace();
    navigate('/');
  };

  const renderCharacter = (char, index) => {
    let className = 'char';
    
    if (index < typedText.length) {
      className += typedText[index] === char ? ' correct' : ' incorrect';
    } else if (index === typedText.length) {
      className += ' current';
    }
    
    if (char === ' ') {
      className += ' space';
    }

    return (
      <span key={index} className={className}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  };

  const renderPlayersList = () => (
    <div className="players-list">
      <h3>Players ({players.length}/{raceData?.maxPlayers || 6})</h3>
      <div className="players-grid">
        {players.map((player, index) => (
          <div key={index} className={`player-card ${player.isFinished ? 'finished' : ''}`}>
            <div className="player-info">
              <span className="player-name">{player.username}</span>
              {player.isGuest && <span className="guest-badge">Guest</span>}
            </div>
            <div className="player-stats">
              <div className="stat">
                <span className="stat-label">Progress</span>
                <span className="stat-value">{player.progress || 0}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">WPM</span>
                <span className="stat-value">{player.wpm || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{player.accuracy || 100}%</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${player.progress || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (raceStatus === 'disconnected') {
    return (
      <div className="multiplayer-race-page">
        <div className="join-race-form">
          <h1>Join Multiplayer Race</h1>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRace()}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button 
            onClick={handleJoinRace} 
            disabled={isJoining}
            className="join-btn"
          >
            {isJoining ? 'Joining...' : 'Join Race'}
          </button>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Solo Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="multiplayer-race-page">
      <div className="race-header">
        <h1>Multiplayer Race</h1>
        <button onClick={handleLeaveRace} className="leave-btn">
          Leave Race
        </button>
      </div>      {raceStatus === 'waiting' && (        <div className="waiting-area">
          <h2>Waiting for players...</h2>
          <p>Race will start when 2 or more players join</p>
          {/* Temporary: Force start for testing - DISABLED to prevent state conflicts
          <button 
            onClick={() => {
              console.log('Force starting race for testing...');
              setRaceStatus('active');
              setStartTime(Date.now());
              // Focus the input field
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                  console.log('Input focused after force start');
                }
              }, 100);
            }}
            className="force-start-btn"
            style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🚀 Force Start (Testing)
          </button>
          */}
        </div>
      )}

      {raceStatus === 'countdown' && (
        <div className="countdown-area">
          <h2>Race starting in...</h2>
          <div className="countdown-timer">{countdown}</div>
        </div>
      )}

      {(raceStatus === 'active' || raceStatus === 'finished') && (
        <div className="race-area">
          {raceStatus === 'active' && (
            <div className="typing-instructions" style={{ 
              textAlign: 'center', 
              marginBottom: '1rem', 
              padding: '0.5rem', 
              backgroundColor: '#2c2e31', 
              borderRadius: '4px',
              border: '1px solid #e2b714',
              color: '#e2b714'
            }}>
              💡 Click on the text below or the input field and start typing!
            </div>
          )}
          <div className="typing-section">            <div 
              className={`text-display ${raceStatus === 'active' ? 'active' : ''}`}
              onClick={() => {
                if (inputRef.current && raceStatus === 'active') {
                  inputRef.current.focus();
                  console.log('Text display clicked - focusing input');
                }
              }}
              style={{ cursor: raceStatus === 'active' ? 'text' : 'default' }}
            >
              {currentText.split('').map((char, index) => renderCharacter(char, index))}
            </div><input
              ref={inputRef}
              type="text"
              value={typedText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onKeyPress={handleKeyPress}
              onFocus={() => console.log('Input focused')}
              onBlur={() => console.log('Input blurred')}
              className="typing-input"
              disabled={raceStatus !== 'active'}
              placeholder={raceStatus === 'active' ? 'Start typing...' : `Race status: ${raceStatus}`}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              style={{ 
                backgroundColor: raceStatus === 'active' ? 'white' : '#f0f0f0',
                cursor: raceStatus === 'active' ? 'text' : 'not-allowed',
                outline: 'none',
                border: raceStatus === 'active' ? '2px solid #007bff' : '1px solid #ccc'
              }}
            />
          </div>
          
          <div className="your-stats">
            <h3>Your Progress</h3>
            <div className="stats-row">
              <div className="stat">
                <span className="stat-label">Progress</span>
                <span className="stat-value">{progress}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">WPM</span>
                <span className="stat-value">{wpm}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{accuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {raceStatus === 'finished' && raceResults && (
        <div className="race-results">
          <h2>Race Complete!</h2>
          <div className="winner-announcement">
            🏆 Winner: {raceResults.winner}
          </div>
          <div className="final-rankings">
            <h3>Final Rankings</h3>
            {raceResults.rankings.map((player, index) => (
              <div key={index} className="ranking-item">
                <span className="rank">#{player.rank}</span>
                <span className="name">{player.username}</span>
                <span className="wpm">{player.wpm} WPM</span>
                <span className="accuracy">{player.accuracy}%</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/')} className="back-to-menu-btn">
            Back to Main Menu
          </button>
        </div>
      )}

      {renderPlayersList()}
    </div>
  );
};

export default MultiplayerRacePage;
