import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import TypePage from './pages/TypePage'
import MultiplayerRacePage from './pages/MultiplayerRacePage'
import AuthModal from './components/AuthModal'
import StatsDashboard from './components/StatsDashboard'
import './App.css'

const AppContent = () => {
  const { user, isGuest, handleAuthSuccess, logout, continueAsGuest } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const handleStatsClick = () => {
    setShowStats(true)
  }

  const handleLoginClick = () => {
    setShowAuthModal(true)
  }

  const handleSettingsClick = () => {
    // TODO: Implement settings modal/page
    console.log('Settings clicked')
  }

  const handleAboutClick = () => {
    // TODO: Implement about modal/page
    console.log('About clicked')
  }

  const onAuthSuccess = (userData) => {
    handleAuthSuccess(userData)
    setShowAuthModal(false)
  }

  const handleGuestMode = () => {
    continueAsGuest()
    setShowAuthModal(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="app-title">TypeMaster</Link>
          <nav className="header-nav">
            <Link to="/" className="nav-btn">solo</Link>
            <Link to="/multiplayer" className="nav-btn">multiplayer</Link>
            <button className="nav-btn" onClick={handleSettingsClick}>settings</button>
            <button className="nav-btn" onClick={handleAboutClick}>about</button>
          </nav>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={handleStatsClick}>
            Statistics
          </button>
          {user ? (
            <>
              <span className="user-welcome">Welcome, {user.username}!</span>
              <button className="header-btn logout-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : isGuest ? (
            <>
              <span className="guest-indicator">Guest Mode</span>
              <button className="header-btn" onClick={handleLoginClick}>
                Login
              </button>
            </>
          ) : (
            <button className="header-btn" onClick={handleLoginClick}>
              Login / Register
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<TypePage />} />
          <Route path="/multiplayer" element={<MultiplayerRacePage />} />
        </Routes>
      </main>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={onAuthSuccess}
          onGuestMode={handleGuestMode}
        />
      )}

      {showStats && (
        <StatsDashboard
          isOpen={showStats}
          onClose={() => setShowStats(false)}
          userId={user?.id}
          isGuest={isGuest}
        />
      )}
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App