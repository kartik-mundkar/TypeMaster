// API utilities for typing test
import { API_CONFIG } from '../config/api.js'

const BACKEND_API_BASE = API_CONFIG.TEXT_API
const EMERGENCY_FALLBACK = "The quick brown fox jumps over the lazy dog and runs through the forest with great speed and agility while avoiding all obstacles."

export const fetchRandomText = async (textSource, testMode, wordCount) => {
  try {
    const params = new URLSearchParams({
      source: textSource,
      mode: testMode,
      wordCount: wordCount.toString(),
      _t: Date.now().toString()
    })
    
    const response = await fetch(`${BACKEND_API_BASE}/random?${params}`)
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data && data.data.text) {
      return data.data.text
    } else {
      throw new Error('Invalid response format from backend')
    }
  } catch (error) {
    console.error('Error fetching text from backend:', error)
    return EMERGENCY_FALLBACK
  }
}

export const saveTypingResult = async (resultData, testConfig, currentText) => {
  try {
    // Get session ID for guest users
    let sessionId = localStorage.getItem('guestSessionId')
    if (!sessionId) {
      const response = await fetch(`${API_CONFIG.AUTH_API}/guest-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (data.success) {
        sessionId = data.data.sessionId
        localStorage.setItem('guestSessionId', sessionId)
      }
    }

    const saveData = {
      testConfig: {
        mode: testConfig.testMode,
        timeLimit: testConfig.testMode === 'time' ? testConfig.timeLimit : null,
        wordCount: testConfig.testMode === 'words' ? testConfig.wordCount : null,
        textSource: testConfig.textSource,
        textContent: currentText
      },
      results: resultData,
      metadata: {
        language: navigator.language,
        keyboard: navigator.language,
        testDuration: resultData.timeElapsed
      },
      sessionId
    }

    const token = localStorage.getItem('authToken')
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_CONFIG.RESULTS_API}/save`, {
      method: 'POST',
      headers,
      body: JSON.stringify(saveData)
    })

    const result = await response.json()
    if (result.success) {
      console.log('✅ Test result saved successfully')
    } else {
      console.warn('⚠️ Failed to save test result:', result.message)
    }
  } catch (error) {
    console.error('❌ Error saving test result:', error)
  }
}
