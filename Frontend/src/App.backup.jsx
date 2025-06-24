import React, { useState } from 'react'
import TypePage from './pages/TypePage'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import AuthModal from './components/AuthModal'
import StatsDashboard from './components/StatsDashboard'
import './App.css'

const AppContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const { user, logout, loading } = useAuth()

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const handleSignup = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  const handleStats = () => {
    setShowStatsModal(true)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">TypeMaster</h1>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={handleStats}>
            📊 Stats
          </button>
          {user ? (
            <div className="user-menu">
              <span className="username">👋 {user.username}</span>
              <button className="header-btn logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="header-btn" onClick={handleLogin}>
                Login
              </button>
              <button className="header-btn signup-btn" onClick={handleSignup}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <TypePage />

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
      <StatsDashboard 
        isOpen={showStatsModal} 
        onClose={() => setShowStatsModal(false)}
      />
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App