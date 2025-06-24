import React from 'react'

const TestConfiguration = ({
  testMode,
  timeLimit,
  wordCount,
  textSource,
  onTestModeChange,
  onTimeLimitChange,
  onWordCountChange,
  onTextSourceChange
}) => {
  return (
    <div className="test-config">
      <div className="config-group">
        <button 
          className={`config-btn ${testMode === 'time' ? 'active' : ''}`}
          onClick={() => onTestModeChange('time')}
        >
          time
        </button>
        <button 
          className={`config-btn ${testMode === 'words' ? 'active' : ''}`}
          onClick={() => onTestModeChange('words')}
        >
          words
        </button>
        <button 
          className={`config-btn ${testMode === 'quote' ? 'active' : ''}`}
          onClick={() => onTestModeChange('quote')}
        >
          quote
        </button>
      </div>

      {/* Text Source Selector */}
      <div className="config-group">
        <span className="config-label">source:</span>
        <button 
          className={`config-btn ${textSource === 'mixed' ? 'active' : ''}`}
          onClick={() => onTextSourceChange('mixed')}
        >
          mixed
        </button>
        <button 
          className={`config-btn ${textSource === 'quotes' ? 'active' : ''}`}
          onClick={() => onTextSourceChange('quotes')}
        >
          quotes
        </button>
        <button 
          className={`config-btn ${textSource === 'lorem' ? 'active' : ''}`}
          onClick={() => onTextSourceChange('lorem')}
        >
          lorem
        </button>
        <button 
          className={`config-btn ${textSource === 'news' ? 'active' : ''}`}
          onClick={() => onTextSourceChange('news')}
        >
          news
        </button>
      </div>

      {testMode === 'time' && (
        <div className="config-group">
          {[15, 30, 60, 120].map(time => (
            <button
              key={time}
              className={`config-btn ${timeLimit === time ? 'active' : ''}`}
              onClick={() => onTimeLimitChange(time)}
            >
              {time}
            </button>
          ))}
        </div>
      )}

      {testMode === 'words' && (
        <div className="config-group">
          {[10, 25, 50, 100].map(count => (
            <button
              key={count}
              className={`config-btn ${wordCount === count ? 'active' : ''}`}
              onClick={() => onWordCountChange(count)}
            >
              {count}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TestConfiguration
