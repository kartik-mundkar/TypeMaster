import React from 'react'

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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        restart
      </button>

      <div className="instructions">
        <p>Press Tab to focus restart button, then Enter to reset</p>
        <p className="typing-hint">💡 You can type from anywhere on the page - focus will automatically return to the typing area</p>
      </div>
    </div>
  )
}

export default TestControls
