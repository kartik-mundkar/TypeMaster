import React, { useRef } from 'react'
import './TypePage.css'

// Components
import Footer from '../components/typing/Footer'
import TestConfiguration from '../components/typing/TestConfiguration'
import StatsBar from '../components/typing/StatsBar'
import TypingArea from '../components/typing/TypingArea'

// Hooks
import { useTypingTest } from '../hooks/typing/useTypingTest'
import { useFocusManagement } from '../hooks/typing/useFocusManagement'
import { useScrollManagement } from '../hooks/typing/useScrollManagement'

const TypePage = () => {
  // Refs
  const inputRef = useRef(null)
  const resetButtonRef = useRef(null)
  const textDisplayRef = useRef(null)
  // Custom hooks
  const {
    // State
    testMode,
    timeLimit,
    wordCount,
    textSource,
    isLoadingText,
    isActive,
    timeLeft,
    typedText,
    startTime,
    wpm,
    accuracy,
    totalChars,
    correctChars,
    showResults,
    currentText,
    
    // Actions
    generateNewText,
    endTest,
    startTest,
    updateTypedText,
    
    // Handlers
    handleTextSourceChange,
    handleTestModeChange,
    handleWordCountChange,
    handleTimeLimitChange
  } = useTypingTest()

  const { autoScrollToCurrentPosition, scrollToTop } = useScrollManagement(textDisplayRef)
  
  const { handleGlobalKeyDown } = useFocusManagement(inputRef, showResults)
  // Enhanced reset function with scroll management - now fetches new text
  const handleReset = () => {
    generateNewText() // This will reset the test AND fetch new text
    setTimeout(() => {
      scrollToTop()
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)
  }
  // Input change handler
  const handleInputChange = (e) => {
    const value = e.target.value
    
    // Prevent typing beyond the text length
    if (value.length > currentText.length) {
      return
    }
    
    updateTypedText(value)
    
    // Auto-scroll to keep current position visible
    setTimeout(() => autoScrollToCurrentPosition(), 0)
  }

  // Key down handlers
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (resetButtonRef.current) {
        resetButtonRef.current.focus()
      }
    }
  }

  const handleResetButtonKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleReset()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (inputRef.current) {
        inputRef.current.focus()
      }    }
  }
  
  // Global keydown handler
  React.useEffect(() => {    
    const enhancedGlobalKeyDown = (e) => {
      handleGlobalKeyDown(
        e, 
        currentText, 
        typedText, 
        isActive, 
        startTest, 
        updateTypedText, 
        autoScrollToCurrentPosition
      )
    }

    document.addEventListener('keydown', enhancedGlobalKeyDown)
    return () => {
      document.removeEventListener('keydown', enhancedGlobalKeyDown)
    }
  }, [handleGlobalKeyDown, currentText, typedText, isActive, startTest, updateTypedText, autoScrollToCurrentPosition, endTest])
    return (
    <div className="type-page">
      <TestConfiguration
        testMode={testMode}
        timeLimit={timeLimit}
        wordCount={wordCount}
        textSource={textSource}
        onTestModeChange={handleTestModeChange}
        onTimeLimitChange={handleTimeLimitChange}
        onWordCountChange={handleWordCountChange}
        onTextSourceChange={handleTextSourceChange}
      />

      <StatsBar
        wpm={wpm}
        accuracy={accuracy}
        testMode={testMode}
        timeLeft={timeLeft}
        typedText={typedText}
        currentText={currentText}
      />

      <TypingArea
        // Text and display props
        currentText={currentText}
        typedText={typedText}
        isLoadingText={isLoadingText}
        textDisplayRef={textDisplayRef}
        
        // Input props
        inputRef={inputRef}
        showResults={showResults}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        
        // Control props
        resetButtonRef={resetButtonRef}
        onReset={handleReset}
        onResetButtonKeyDown={handleResetButtonKeyDown}
        
        // Results props
        startTime={startTime}
        wpm={wpm}
        accuracy={accuracy}
        correctChars={correctChars}
        totalChars={totalChars}
      />

      <Footer />
    </div>
  )
}

export default TypePage