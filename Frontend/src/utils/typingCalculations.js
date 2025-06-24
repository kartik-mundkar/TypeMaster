// Utility functions for typing calculations
export const calculateStats = (typedText, currentText, startTime) => {
  let correctChars = 0
  for (let i = 0; i < typedText.length; i++) {
    if (i < currentText.length && typedText[i] === currentText[i]) {
      correctChars++
    }
  }

  const totalChars = typedText.length
  const timeElapsed = startTime ? (Date.now() - startTime) / 1000 / 60 : 0 // minutes
  const wordsTyped = correctChars / 5 // standard word length
  const wpm = Math.round(wordsTyped / timeElapsed) || 0
  const accuracy = Math.round((correctChars / Math.max(totalChars, 1)) * 100) || 100

  return {
    correctChars,
    totalChars,
    wpm,
    accuracy
  }
}

export const calculateFinalResults = (correctChars, totalChars, startTime, typedText, currentText) => {
  const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0
  const finalWpm = Math.round((correctChars / 5) / (timeElapsed / 60)) || 0
  const finalAccuracy = Math.round((correctChars / Math.max(totalChars, 1)) * 100)
  const completed = typedText.length === currentText.length && typedText === currentText

  return {
    wpm: finalWpm,
    accuracy: finalAccuracy,
    totalCharacters: totalChars,
    correctCharacters: correctChars,
    incorrectCharacters: totalChars - correctChars,
    timeElapsed,
    completed
  }
}

export const getCharClass = (charIndex, typedText, currentText) => {
  if (charIndex < typedText.length) {
    return typedText[charIndex] === currentText[charIndex] ? 'correct' : 'incorrect'
  }
  return charIndex === typedText.length ? 'current' : ''
}
