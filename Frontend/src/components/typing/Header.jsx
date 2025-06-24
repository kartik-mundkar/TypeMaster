import React from 'react'

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-text">TypeMaster</span>
      </div>
      <nav className="nav">
        <button className="nav-item">settings</button>
        <button className="nav-item">about</button>
        <button className="nav-item">account</button>
      </nav>
    </header>
  )
}

export default Header
