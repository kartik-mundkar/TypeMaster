import React from 'react'
import RestartIcon from '../../assets/restart-icon.svg'


const TestControls = ({ onReset, resetButtonRef, onResetButtonKeyDown }) => {
  return (
    <div className="test-controls">
      <button 
        ref={resetButtonRef}
        className="reset-btn-inline" 
        onClick={onReset} 
        onKeyDown={onResetButtonKeyDown}
        title="Press Enter to reset test"
      >
        <img src={RestartIcon} alt="Restart" width="16" height="16"  className="restart-icon" />
        restart
      </button>

      <div className="instructions">
        <p>Press Tab to focus restart button, then Enter to reset</p>
      </div>
    </div>
  )
}

export default TestControls
