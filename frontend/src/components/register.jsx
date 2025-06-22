import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './login.jsx';
import './register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { username, password, email } = formData;
    if (!username || !password || !email) {
      setErrorMessage('All fields are required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/register', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            name="username"
            onChange={handleChange}
            value={formData.username}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            name="email"
            type="email"
            onChange={handleChange}
            value={formData.email}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            name="password"
            onChange={handleChange}
            value={formData.password}
            type="password"
            className="form-input"
            required
            minLength="6"
          />
        </div>

        {errorMessage && <p className="register-error">{errorMessage}</p>}

        <button
          type="submit"
          className={`register-button ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="register-links">
        <p>
        Already have an account?{' '}
          <a href="/" className="register-link">Login here</a>
      </p>
      </div>
    </div>
  );
}

export default Register;