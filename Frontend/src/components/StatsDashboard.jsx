import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './StatsDashboard.css';

const StatsDashboard = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const sessionId = localStorage.getItem('guestSessionId');
      
      let url = 'http://localhost:5002/api/results/stats/summary';
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (sessionId) {
        url += `?sessionId=${sessionId}`;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch statistics');
      }    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <h2>Your Typing Statistics</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="stats-content">
          {loading ? (
            <div className="loading">Loading statistics...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : stats ? (
            <>
              <div className="stats-summary">
                <div className="stat-card">
                  <h3>Tests Completed</h3>
                  <div className="stat-value">{stats.summary.totalTests}</div>
                </div>
                <div className="stat-card">
                  <h3>Average WPM</h3>
                  <div className="stat-value">{Math.round(stats.summary.averageWPM)}</div>
                </div>
                <div className="stat-card">
                  <h3>Best WPM</h3>
                  <div className="stat-value">{Math.round(stats.summary.bestWPM)}</div>
                </div>
                <div className="stat-card">
                  <h3>Average Accuracy</h3>
                  <div className="stat-value">{Math.round(stats.summary.averageAccuracy)}%</div>
                </div>
                <div className="stat-card">
                  <h3>Best Accuracy</h3>
                  <div className="stat-value">{Math.round(stats.summary.bestAccuracy)}%</div>
                </div>
                <div className="stat-card">
                  <h3>Completed Tests</h3>
                  <div className="stat-value">{stats.summary.completedTests}</div>
                </div>
                <div className="stat-card">
                  <h3>Time Typing</h3>
                  <div className="stat-value">{Math.round(stats.summary.totalTimeTyping / 60)}m</div>
                </div>
              </div>

              {stats.recentTests && stats.recentTests.length > 0 && (
                <div className="recent-tests">
                  <h3>Recent Tests</h3>
                  <div className="tests-list">
                    {stats.recentTests.map((test, index) => (
                      <div key={index} className="test-item">
                        <div className="test-mode">{test.testConfig.mode}</div>
                        <div className="test-stats">
                          <span>{Math.round(test.results.wpm)} WPM</span>
                          <span>{Math.round(test.results.accuracy)}%</span>
                          {test.results.completed && <span className="completed">✓</span>}
                        </div>
                        <div className="test-date">
                          {new Date(test.metadata.testDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!user && (
                <div className="guest-notice">
                  <p>💡 Create an account to keep your statistics permanently and access them from any device!</p>
                </div>
              )}
            </>
          ) : (
            <div className="no-data">No statistics available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
