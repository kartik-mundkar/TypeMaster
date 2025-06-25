import React from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRaceForm = ({ 
  username, 
  setUsername, 
  onJoinRace, 
  isJoining, 
  error 
}) => {
  const navigate = useNavigate();

  const handleQuickJoin = () => {
    const randomUsername = `Player${Math.floor(Math.random() * 1000)}`;
    setUsername(randomUsername);
    setTimeout(() => onJoinRace(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onJoinRace();
    }
  };

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
            onKeyPress={handleKeyPress}
          />
        </div>
        
        <div className="quick-join">
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
            Or quickly join with a random username:
          </p>
          <button
            onClick={handleQuickJoin}
            className="quick-join-btn"
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >
            🎮 Quick Join
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button
          onClick={onJoinRace}
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
};

export default JoinRaceForm;
