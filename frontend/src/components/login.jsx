import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null); // State to store the report data
  const [showReport, setShowReport] = useState(false);

  const handleBackup = async () => {
    setLoading(true); // You can reuse the loading state for backup
    setErrorMessage('');
  
    console.log('Attempting to start backup...');
  
    try {
      const response = await axios.post('http://localhost:3000/api/backup', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Backup response:', response.data);
  
      if (response.data.success) {
        alert('Backup completed successfully');
      } else {
        setErrorMessage(response.data.message || 'Backup failed');
      }
    } catch (error) {
      console.error('Backup error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setErrorMessage(
        error.response?.data?.message || 'Backup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
  
    console.log('Attempting login with:', { username, password });
  
    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Login response:', response.data);
  
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/feed');
      } else {
        setErrorMessage(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setErrorMessage(
        error.response?.data?.message || 
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleReport = async () => {
    if (!showReport) {
      try {
        const response = await axios.get('http://localhost:3000/api/report');
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setErrorMessage('Failed to load report');
      }
    }
    setShowReport(!showReport);
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/report');
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setErrorMessage('Failed to fetch report data.');
      }
    };
    fetchReport();
  }, []);
  

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>
        
        {errorMessage && <p className="login-error">{errorMessage}</p>}

        <button
          type="submit"
          className={`login-button ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="login-links">
        <p>
        Don't have an account?{' '}
          <a href="/register" className="login-link">Register here</a>
      </p>
      </div>

      <div>
      <button
            type="button"
            onClick={handleBackup}
          className={`login-button ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Backing up...' : 'Backup'}
      </button>
      </div>

      <div>
        <button onClick={toggleReport} className="report-button">
          {showReport ? 'Close' : 'What\'s new'}
        </button>
      </div>

      {showReport && report && (
        <div className="report-container">
          <h3 className="report-title">Report</h3>
                    
          <div className="report-item">
                      <strong>Total Users:</strong> {report.totalUsers}
                    </div>
                    
          <div className="report-item">
                      <strong>User with Maximum Popularity:</strong>
                      <div><strong>Username:</strong> {report.maxPopularityUser.Username}</div>
                      <div><strong>Email:</strong> {report.maxPopularityUser.Email}</div>
                      <div><strong>Popularity Score:</strong> {report.maxPopularityUser.PopularityScore}</div>
            <div><strong>Bio:</strong> {report.maxPopularityUser.Bio}</div>
            <div><strong>Location:</strong> {report.maxPopularityUser.Location}</div>
            <div><strong>Date Joined:</strong> {new Date(report.maxPopularityUser.DateJoined).toLocaleDateString()}</div>
                    </div>
                    
          <div className="report-item">
                      <strong>Post with Maximum Engagement Rate:</strong>
                      <div><strong>Post Content:</strong> {report.maxEngagementPost.Content}</div>
                      <div><strong>Engagement Rate:</strong> {report.maxEngagementPost.EngagementRate}</div>
                      <div><strong>Likes Count:</strong> {report.maxEngagementPost.LikesCount}</div>
                      <div><strong>Comments Count:</strong> {report.maxEngagementPost.CommentsCount}</div>
                      <div><strong>Post Date:</strong> {new Date(report.maxEngagementPost.PostDate).toLocaleString()}</div>
                    </div>
                  </div>
                )}
    </div>
  );
};

export default Login;
