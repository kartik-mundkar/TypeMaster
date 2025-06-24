import React from 'react'

const StatsBar = ({ wpm, accuracy, testMode, timeLeft, typedText, currentText }) => {
  // Calculate words typed and total words for words mode
  const getWordsTyped = () => {
    if (!typedText.trim()) return 0
    return typedText.trim().split(/\s+/).length
  }
  
  const getTotalWords = () => {
    if (!currentText.trim()) return 0
    return currentText.trim().split(/\s+/).length
  }

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-label">wpm</span>
        <span className="stat-value">{wpm}</span>
      </div>
      <div className="stat">
        <span className="stat-label">acc</span>
        <span className="stat-value">{accuracy}%</span>
      </div>
      {testMode === 'time' && (
        <div className="stat">
          <span className="stat-label">time</span>
          <span className="stat-value">{timeLeft}</span>
        </div>
      )}      {(testMode === 'words' || testMode === 'quote') && (
        <div className="stat">
          <span className="stat-label">progress</span>
          <span className="stat-value">
            {testMode === 'words' ? `${getWordsTyped()}/${getTotalWords()} words` : `${typedText.length}/${currentText.length}`}
          </span>
        </div>
      )}
    </div>
  )
}

export default StatsBar
