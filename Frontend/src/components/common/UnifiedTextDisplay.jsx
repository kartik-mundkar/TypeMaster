import React from 'react';
import { getCharClass } from '../../utils/typingCalculations';
import './UnifiedTextDisplay.css';

const UnifiedTextDisplay = ({ 
  currentText, 
  typedText, 
  isLoadingText = false,
  textDisplayRef = null,
  onTextClick = null,
  raceStatus = null,
  calculateScrollOffset = null,
  renderMode = 'words' // 'words' for solo, 'characters' for multiplayer
}) => {
  // Auto-scroll calculation for 3-line display
  const getScrollOffset = () => {
    if (calculateScrollOffset) {
      // Use provided scroll calculation (multiplayer)
      return calculateScrollOffset();
    }
    
    if (!currentText || !typedText) return 0;

    // Enhanced scroll calculation for solo mode
    const containerWidth = 45; // Slightly reduced for better word wrapping
    const lineHeightRem = 1.92; // 1.2rem * 1.6 line-height
    
    // More accurate line calculation based on actual text wrapping
    let lines = [];
    let currentLine = '';
    let totalCharsProcessed = 0;
    
    // Process text word by word to find natural line breaks
    const words = currentText.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      
      if (testLine.length <= containerWidth) {
        currentLine = testLine;
      } else {
        // Current line is full, start a new line
        if (currentLine) {
          lines.push({
            text: currentLine,
            startChar: totalCharsProcessed,
            endChar: totalCharsProcessed + currentLine.length
          });
          totalCharsProcessed += currentLine.length + 1; // +1 for space
        }
        currentLine = word;
      }
      
      // If we've processed all typed characters, we can stop
      if (totalCharsProcessed >= typedText.length) {
        break;
      }
    }
    
    // Add the last line if it exists
    if (currentLine) {
      lines.push({
        text: currentLine,
        startChar: totalCharsProcessed,
        endChar: totalCharsProcessed + currentLine.length
      });
    }
    
    // Find which line contains the current typing position
    let currentLineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (typedText.length >= lines[i].startChar && typedText.length <= lines[i].endChar + 1) {
        currentLineIndex = i;
        break;
      }
    }
    
    // Smart scrolling: only scroll when approaching the end of a line
    if (currentLineIndex >= 2) {
      const currentLineData = lines[currentLineIndex];
      const typedInCurrentLine = typedText.length - currentLineData.startChar;
      const lineProgress = typedInCurrentLine / currentLineData.text.length;
      
      // Start scrolling when 75% of the current line is typed
      if (lineProgress >= 0.75) {
        return (currentLineIndex - 1) * lineHeightRem;
      } else {
        return Math.max(0, (currentLineIndex - 2) * lineHeightRem);
      }
    }
    
    return 0;
  };
  // Character rendering for multiplayer mode
  const renderByCharacters = () => {
    return currentText.split("").map((char, index) => {
      let className = "char";

      if (index < typedText.length) {
        className += typedText[index] === char ? " correct" : " incorrect";
      } else if (index === typedText.length) {
        className += " current";
      }

      if (char === " ") {
        className += " space";
      }

      return (
        <span key={index} className={className}>
          {char === " " ? "\u00A0" : char}
        </span>
      );
    });
  };

  // Word rendering for solo mode (better performance and formatting)
  const renderByWords = () => {
    const words = currentText.split(' ');
    let charIndex = 0;
    
    return words.map((word, wordIndex) => {
      const wordStartIndex = charIndex;
      charIndex += word.length;
      
      const wordElement = (
        <span key={wordIndex} className="word" data-word={word}>
          {word.split('').map((char, index) => {
            const currentCharIndex = wordStartIndex + index;
            return (
              <span
                key={currentCharIndex}
                className={`char ${getCharClass(currentCharIndex, typedText, currentText)}`}
              >
                {char}
              </span>
            );
          })}
        </span>
      );
      
      // Add space after word (except for the last word)
      if (wordIndex < words.length - 1) {
        const spaceIndex = charIndex;
        charIndex += 1; // +1 for the space
        
        return (
          <React.Fragment key={`word-${wordIndex}`}>
            {wordElement}
            <span 
              className={`char space ${getCharClass(spaceIndex, typedText, currentText)}`}
            >
              {' '}
            </span>
          </React.Fragment>
        );
      }
      
      return wordElement;
    });
  };

  const renderContent = () => {
    if (isLoadingText) {
      return (
        <div className="loading-text">
          <div className="loading-spinner"></div>
          <span>Loading new text...</span>
        </div>
      );
    }

    const textContent = renderMode === 'words' ? renderByWords() : renderByCharacters();
    
    // Always wrap content in a container for consistent 3-line display with auto-scroll
    return (
      <div
        className="text-content"
        style={{
          transform: `translateY(-${getScrollOffset()}rem)`,
        }}
      >
        {textContent}
      </div>
    );
  };

  // Determine CSS classes based on props
  const getDisplayClasses = () => {
    let classes = "text-display unified-text-display";
    
    if (onTextClick && raceStatus === "active") {
      classes += " clickable";
    }
    
    return classes;
  };

  const displayProps = {
    className: getDisplayClasses(),
    ...(textDisplayRef && { ref: textDisplayRef }),
    ...(onTextClick && { onClick: onTextClick })
  };

  return (
    <div {...displayProps}>
      {renderContent()}
    </div>
  );
};

export default UnifiedTextDisplay;
