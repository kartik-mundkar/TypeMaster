import React from 'react';
import { useNavigate } from 'react-router-dom';

const RaceResults = ({ raceResults }) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default RaceResults;
