import React from 'react';

const PlayerStats = ({ progress, wpm, accuracy }) => {
  return (
    <div className="live-stats">
      <h3>Your Live Stats</h3>
      <div className="stats-container">
        <div className="stat-card progress-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{progress}%</span>
            <span className="stat-label">Progress</span>
          </div>
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        
        <div className="stat-card wpm-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <span className="stat-value">{wpm}</span>
            <span className="stat-label">Words/Min</span>
          </div>
        </div>
        
        <div className="stat-card accuracy-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>
      </div>
      
      <div className="performance-indicator">
        <div className="performance-label">Performance</div>
        <div className="performance-bar">
          <div 
            className="performance-fill"
            style={{ 
              width: `${Math.min(100, (wpm / 60) * 100)}%`,
              backgroundColor: wpm >= 40 ? '#28a745' : wpm >= 25 ? '#ffc107' : '#dc3545'
            }}
          ></div>
        </div>
        <div className="performance-text">
          {wpm >= 40 ? 'Excellent' : wpm >= 25 ? 'Good' : 'Keep Going!'}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
