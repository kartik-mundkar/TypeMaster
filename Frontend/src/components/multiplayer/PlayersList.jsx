import React from 'react';

const PlayersList = ({ players, raceData, currentUser }) => {
  // Sort players by ranking criteria (progress, then WPM, then accuracy)
  const sortedPlayers = [...players].sort((a, b) => {
    // First sort by progress (descending)
    if (b.progress !== a.progress) {
      return (b.progress || 0) - (a.progress || 0);
    }
    // If progress is equal, sort by WPM (descending)
    if (b.wpm !== a.wpm) {
      return (b.wpm || 0) - (a.wpm || 0);
    }
    // If WPM is equal, sort by accuracy (descending)
    return (b.accuracy || 100) - (a.accuracy || 100);
  });

  return (
    <div className="players-ranking">
      <h3>
        Live Rankings ({players.length}/{raceData?.maxPlayers || 6})
      </h3>
      <div className="ranking-list">
        {sortedPlayers.map((player, index) => {
          const isCurrentUser = player.username === currentUser;
          const isFinished = player.isFinished;
          const rank = index + 1;
          
          return (
            <div
              key={`${player.username}-${index}`}
              className={`ranking-item ${isCurrentUser ? 'current-user' : ''} ${isFinished ? 'finished' : ''}`}
            >
              <div className="rank-position">
                <span className="rank-number">#{rank}</span>
                {rank === 1 && !isFinished && <span className="crown">👑</span>}
                {isFinished && <span className="finished-icon">🏁</span>}
              </div>
              
              <div className="player-info">
                <div className="player-name-row">
                  <span className="player-name">
                    {player.username}
                    {isCurrentUser && <span className="you-indicator">(You)</span>}
                  </span>
                  {player.isGuest && <span className="guest-badge">Guest</span>}
                </div>
                
                <div className="player-metrics">
                  <div className="metric">
                    <span className="metric-value">{player.progress || 0}%</span>
                    <span className="metric-label">Progress</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">{player.wpm || 0}</span>
                    <span className="metric-label">WPM</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">{player.accuracy || 100}%</span>
                    <span className="metric-label">Acc</span>
                  </div>
                </div>
              </div>
              
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${player.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayersList;
