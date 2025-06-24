import React from 'react'
import './App.css'

const App = () => {
  return (
    <div style={{ padding: '2rem', color: 'white', backgroundColor: '#323437', minHeight: '100vh' }}>
      <h1>TypeMaster Debug</h1>
      <p>If you can see this text, React is working!</p>
      <p>Testing basic functionality...</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  )
}

export default App
