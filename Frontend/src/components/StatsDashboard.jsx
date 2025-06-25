import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG } from '../config/api';
import './StatsDashboard.css';

const StatsDashboard = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('authToken');
        const sessionId = localStorage.getItem('guestSessionId');
        
        console.log('=== STATS FETCH DEBUG ===');
        console.log('Token exists:', !!token);
        console.log('Session ID:', sessionId);
        console.log('User from context:', user);
        
        let url = `${API_CONFIG.RESULTS_API}/stats/summary`;
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log('Using token authentication');
        } else if (sessionId) {
          url += `?sessionId=${sessionId}`;
          console.log('Using guest session authentication');
        } else {
          console.log('⚠️ NO AUTHENTICATION FOUND - Creating guest session...');
          // Create guest session if none exists
          try {
            const guestResponse = await fetch(`${API_CONFIG.AUTH_API}/guest-session`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            const guestData = await guestResponse.json();
            if (guestData.success) {
              const newSessionId = guestData.data.sessionId;
              localStorage.setItem('guestSessionId', newSessionId);
              url += `?sessionId=${newSessionId}`;
              console.log('✅ Created new guest session:', newSessionId);
            } else {
              throw new Error('Failed to create guest session');
            }
          } catch (guestError) {
            console.error('Failed to create guest session:', guestError);
            setError('Unable to access statistics. Please try again.');
            setLoading(false);
            return;
          }
        }

        console.log('Final URL:', url);
        console.log('Final headers:', headers);

        const response = await fetch(url, { headers });
        const data = await response.json();

        console.log('Response status:', response.status);
        console.log('Full response data:', data);

        if (data.success) {
          console.log('✅ Stats received successfully');
          console.log('Summary:', data.data.summary);
          console.log('Recent tests:', data.data.recentTests?.length || 0);
          setStats(data.data);
        } else {
          console.error('❌ API error:', data.message);
          setError(data.message || 'Failed to fetch statistics');
        }
      } catch (error) {
        console.error('❌ Network error:', error);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, user]);

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
              {/* Debug info - remove this in production */}
              <details style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#999' }}>
                <summary>Debug Info (Click to expand)</summary>
                <pre>{JSON.stringify(stats, null, 2)}</pre>
              </details>

              <div className="stats-summary">
                <div className="stat-card">
                  <h3>Tests Completed</h3>
                  <div className="stat-value">{stats.summary.totalTests}</div>
                </div>
                <div className="stat-card">
                  <h3>Average WPM</h3>
                  <div className="stat-value">{Math.round(stats.summary.averageWPM || 0)}</div>
                </div>
                <div className="stat-card">
                  <h3>Best WPM</h3>
                  <div className="stat-value">{Math.round(stats.summary.bestWPM || 0)}</div>
                </div>
                <div className="stat-card">
                  <h3>Average Accuracy</h3>
                  <div className="stat-value">{Math.round(stats.summary.averageAccuracy || 0)}%</div>
                </div>
                <div className="stat-card">
                  <h3>Best Accuracy</h3>
                  <div className="stat-value">{Math.round(stats.summary.bestAccuracy || 0)}%</div>
                </div>
                <div className="stat-card">
                  <h3>Completed Tests</h3>
                  <div className="stat-value">{stats.summary.completedTests}</div>
                </div>
                <div className="stat-card">
                  <h3>Time Typing</h3>
                  <div className="stat-value">{Math.round((stats.summary.totalTimeTyping || 0) / 60)}m</div>
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
