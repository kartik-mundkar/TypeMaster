import React from 'react'
import { getCharClass } from '../../utils/typingCalculations'

const TextDisplay = ({ currentText, typedText, isLoadingText, textDisplayRef }) => {
  const renderText = () => {
    const words = currentText.split(' ')
    let charIndex = 0
    
    return words.map((word, wordIndex) => {
      const wordStartIndex = charIndex
      charIndex += word.length
      
      const wordElement = (
        <span key={wordIndex} className="word" data-word={word}>
          {word.split('').map((char, index) => {
            const currentCharIndex = wordStartIndex + index
            return (
              <span
                key={currentCharIndex}
                className={`char ${getCharClass(currentCharIndex, typedText, currentText)}`}
              >
                {char}
              </span>
            )
          })}
        </span>
      )
      
      // Add space after word (except for the last word)
      if (wordIndex < words.length - 1) {
        const spaceIndex = charIndex
        charIndex += 1 // +1 for the space
        
        return (
          <React.Fragment key={`word-${wordIndex}`}>
            {wordElement}
            <span 
              className={`char space ${getCharClass(spaceIndex, typedText, currentText)}`}
            >
              {' '}
            </span>
          </React.Fragment>
        )
      }
      
      return wordElement
    })
  }

  return (
    <div className="text-display" ref={textDisplayRef}>
      {isLoadingText ? (
        <div className="loading-text">
          <div className="loading-spinner"></div>
          <span>Loading new text...</span>
        </div>
      ) : (
        renderText()
      )}
    </div>
  )
}

export default TextDisplay
