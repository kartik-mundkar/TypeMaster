import React from 'react';

const RaceHeader = ({ onLeaveRace }) => {
  return (
    <div className="race-header">
      <h1>Multiplayer Race</h1>
      <button onClick={onLeaveRace} className="leave-btn">
        Leave Race
      </button>
    </div>
  );
};

export default RaceHeader;
