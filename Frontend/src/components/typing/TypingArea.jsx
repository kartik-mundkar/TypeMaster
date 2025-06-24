import React from 'react'
import TextDisplay from './TextDisplay'
import TypingInput from './TypingInput'
import TestControls from './TestControls'
import TestResults from './TestResults'

const TypingArea = ({
  // Text and display props
  currentText,
  typedText,
  isLoadingText,
  textDisplayRef,
  
  // Input props
  inputRef,
  showResults,
  onInputChange,
  onKeyDown,
  
  // Control props
  resetButtonRef,
  onReset,
  onResetButtonKeyDown,
  
  // Results props
  startTime,
  wpm,
  accuracy,
  correctChars,
  totalChars
}) => {
  return (
    <div className="typing-area">
      {!showResults ? (
        <>
          <TextDisplay
            currentText={currentText}
            typedText={typedText}
            isLoadingText={isLoadingText}
            textDisplayRef={textDisplayRef}
          />
          
          <TypingInput
            typedText={typedText}
            onInputChange={onInputChange}
            onKeyDown={onKeyDown}
            inputRef={inputRef}
            showResults={showResults}
          />

          <TestControls
            onReset={onReset}
            resetButtonRef={resetButtonRef}
            onResetButtonKeyDown={onResetButtonKeyDown}
          />
        </>
      ) : (
        <TestResults
          typedText={typedText}
          currentText={currentText}
          startTime={startTime}
          wpm={wpm}
          accuracy={accuracy}
          correctChars={correctChars}
          totalChars={totalChars}
          onRestart={onReset}
        />
      )}
    </div>
  )
}

export default TypingArea
