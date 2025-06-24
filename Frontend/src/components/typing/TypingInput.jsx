import React from 'react'

const TypingInput = ({ 
  typedText, 
  onInputChange, 
  onKeyDown, 
  inputRef, 
  showResults 
}) => {
  return (
    <input
      ref={inputRef}
      type="text"
      value={typedText}
      onChange={onInputChange}
      onKeyDown={onKeyDown}
      className="typing-input"
      placeholder="Start typing anywhere to begin the test..."
      disabled={showResults}
      autoFocus
    />
  )
}

export default TypingInput
