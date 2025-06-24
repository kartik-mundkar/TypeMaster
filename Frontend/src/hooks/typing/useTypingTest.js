import { useState, useCallback, useEffect } from 'react'
import { fetchRandomText, saveTypingResult } from '../../utils/typingApi'
import { calculateStats, calculateFinalResults } from '../../utils/typingCalculations'

// Local storage keys
const STORAGE_KEYS = {
  TEST_MODE: 'typingApp_testMode',
  TIME_LIMIT: 'typingApp_timeLimit',
  WORD_COUNT: 'typingApp_wordCount',
  TEXT_SOURCE: 'typingApp_textSource'
}

// Helper functions for localStorage
const getStoredValue = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key)
    return stored !== null ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.warn(`Error reading from localStorage for key ${key}:`, error)
    return defaultValue
  }
}

const setStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Error writing to localStorage for key ${key}:`, error)
  }
}

export const useTypingTest = () => {
  // Test configuration - load from localStorage with defaults
  const [testMode, setTestMode] = useState(() => getStoredValue(STORAGE_KEYS.TEST_MODE, 'time'))
  const [timeLimit, setTimeLimit] = useState(() => getStoredValue(STORAGE_KEYS.TIME_LIMIT, 30))
  const [wordCount, setWordCount] = useState(() => getStoredValue(STORAGE_KEYS.WORD_COUNT, 50))
  const [textSource, setTextSource] = useState(() => getStoredValue(STORAGE_KEYS.TEXT_SOURCE, 'mixed'))
  const [isLoadingText, setIsLoadingText] = useState(false)
  
  // Test state
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(() => getStoredValue(STORAGE_KEYS.TIME_LIMIT, 30))
  const [typedText, setTypedText] = useState('')
  const [startTime, setStartTime] = useState(null)
  
  // Stats
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [totalChars, setTotalChars] = useState(0)
  const [correctChars, setCorrectChars] = useState(0)
  
  // Results
  const [showResults, setShowResults] = useState(false)
  
  // Text state
  const [currentText, setCurrentText] = useState('')
  const resetTest = useCallback(() => {
    setIsActive(false)
    setTimeLeft(timeLimit) // Use current timeLimit value
    setTypedText('')
    setStartTime(null)
    setWpm(0)
    setAccuracy(100)
    setTotalChars(0)
    setCorrectChars(0)
    setShowResults(false)
  }, [timeLimit])

  const generateNewText = useCallback(async () => {
    setIsLoadingText(true)
    try {
      const text = await fetchRandomText(textSource, testMode, wordCount)
      setCurrentText(text)
      resetTest()
    } catch (error) {
      console.error('Error generating new text:', error)
    } finally {
      setIsLoadingText(false)
    }
  }, [testMode, wordCount, textSource, resetTest])

  const saveResult = useCallback(async (resultData) => {
    const testConfig = { testMode, timeLimit, wordCount, textSource }
    await saveTypingResult(resultData, testConfig, currentText)
  }, [testMode, timeLimit, wordCount, textSource, currentText])
  const endTest = useCallback(() => {
    setIsActive(false)
    
    const resultData = calculateFinalResults(correctChars, totalChars, startTime, typedText, currentText)
    saveResult(resultData)
    setShowResults(true)
  }, [startTime, correctChars, totalChars, typedText, currentText, saveResult])
  const startTest = useCallback(() => {
    if (!isActive) {
      setIsActive(true)
      setStartTime(Date.now())
    }
  }, [isActive])
  const updateTypedText = useCallback((value) => {
    setTypedText(value)
    
    if (!isActive) {
      startTest()
    }
    
    const stats = calculateStats(value, currentText, startTime)
    setTotalChars(stats.totalChars)
    setCorrectChars(stats.correctChars)
    
    // Check for test completion
    
    // Universal completion condition: user has typed the entire text correctly
    const isTextCompleted = value.length === currentText.length && value === currentText
    
    // Words mode specific completion: user has typed the target number of words
    let isWordsCompleted = false
    if (testMode === 'words') {
      const typedWords = value.trim().split(/\s+/).filter(word => word.length > 0)
      isWordsCompleted = typedWords.length >= wordCount
    }
    
    if (isTextCompleted || isWordsCompleted) {
      console.log('✅ Test completion detected!', { isTextCompleted, isWordsCompleted, testMode })
      setTimeout(() => {
        endTest()
      }, 100) // Small delay to ensure stats are updated
    }
  }, [isActive, startTest, currentText, startTime, endTest, testMode, wordCount])
  // Handler functions for configuration changes
  const handleTextSourceChange = useCallback((newSource) => {
    console.log('handleTextSourceChange called:', newSource)
    setTextSource(newSource)
    setStoredValue(STORAGE_KEYS.TEXT_SOURCE, newSource)
    setTimeout(() => generateNewText(), 0)
  }, [generateNewText])

  const handleTestModeChange = useCallback((newMode) => {
    console.log('handleTestModeChange called:', newMode)
    setTestMode(newMode)
    setStoredValue(STORAGE_KEYS.TEST_MODE, newMode)
    setTimeout(() => generateNewText(), 0)
  }, [generateNewText])
  const handleWordCountChange = useCallback((newCount) => {
    console.log('handleWordCountChange called:', newCount)
    setWordCount(newCount)
    setStoredValue(STORAGE_KEYS.WORD_COUNT, newCount)
    setTimeout(() => generateNewText(), 0)
  }, [generateNewText])
    const handleTimeLimitChange = useCallback((newTime) => {
    console.log('handleTimeLimitChange called:', newTime)
    setTimeLimit(newTime)
    setTimeLeft(newTime)
    setStoredValue(STORAGE_KEYS.TIME_LIMIT, newTime)
    // Don't generate new text for time limit changes - just reset the timer
    if (isActive) {
      // If test is active, reset it with current text
      setIsActive(false)
      setTypedText('')
      setStartTime(null)
      setWpm(0)
      setAccuracy(100)
      setTotalChars(0)
      setCorrectChars(0)
      setShowResults(false)
    }
  }, [isActive])
  // Timer effect - only for time mode
  useEffect(() => {
    let interval = null
    if (isActive && testMode === 'time' && timeLeft > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            endTest()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, testMode, timeLeft, showResults, endTest])

  // Calculate WPM and accuracy in real-time
  useEffect(() => {
    if (isActive && startTime) {
      const stats = calculateStats(typedText, currentText, startTime)
      setWpm(stats.wpm)
      setAccuracy(stats.accuracy)
    }
  }, [correctChars, totalChars, startTime, isActive, typedText, currentText])

  // Initialize test
  useEffect(() => {
    generateNewText()
  }, [generateNewText])

  return {
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
    resetTest,
    generateNewText,
    endTest,
    startTest,
    updateTypedText,
    setTypedText,
    
    // Handlers
    handleTextSourceChange,
    handleTestModeChange,
    handleWordCountChange,
    handleTimeLimitChange
  }
}
