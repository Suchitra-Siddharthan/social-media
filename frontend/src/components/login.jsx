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
        localStorage.setItem('token', response.data.token);
        
        if(response.data.role==='admin'){
          navigate('/admin');
        }else{
          navigate('/feed');
        }
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


    </div>
  );
};

export default Login;
