import React from 'react';

const CountdownTimer = ({ countdown }) => {
  return (
    <div className="countdown-area">
      <h2>Race starting in...</h2>
      <div className="countdown-timer">{countdown}</div>
    </div>
  );
};

export default CountdownTimer;
