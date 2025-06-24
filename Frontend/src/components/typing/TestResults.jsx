import React from 'react'

const TestResults = ({ 
  typedText, 
  currentText, 
  startTime, 
  wpm, 
  accuracy, 
  correctChars, 
  totalChars, 
  onRestart 
}) => {
  return (
    <div className="results">
      <div className="completion-message">
        <h2>Test Complete!</h2>
        <p>
          {typedText.length === currentText.length && typedText === currentText 
            ? '🎉 Perfect! You completed the entire text!'
            : `Test ended after ${Math.floor((Date.now() - startTime) / 1000)} seconds`
          }
        </p>
      </div>
      
      <div className="result-stats">
        <div className="result-item">
          <span className="result-label">wpm</span>
          <span className="result-value">{wpm}</span>
        </div>
        <div className="result-item">
          <span className="result-label">acc</span>
          <span className="result-value">{accuracy}%</span>
        </div>
        <div className="result-item">
          <span className="result-label">characters</span>
          <span className="result-value">{correctChars}/{totalChars}</span>
        </div>
        <div className="result-item">
          <span className="result-label">time</span>
          <span className="result-value">{startTime ? Math.floor((Date.now() - startTime) / 1000) : 0}s</span>
        </div>
      </div>
      
      <button className="restart-btn" onClick={onRestart}>
        restart test
      </button>
    </div>
  )
}

export default TestResults
