import React, { useState } from 'react';
import axios from 'axios';  // Import axios to make HTTP requests
import { useNavigate } from 'react-router-dom';  // To navigate between pages

const LoginPage = () => {
  const [username, setUsername] = useState('');  // State to store username
  const [password, setPassword] = useState('');  // State to store password
  const [error, setError] = useState('');  // State to store error message
  const navigate = useNavigate();  // Hook for navigation

  // Handle login logic
  const handleLogin = async () => {
    try {
      // Sending POST request to the backend login route
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });

      if (response.data.success) {
        // If login is successful, navigate to the feed page
        navigate('/feed');
      } else {
        // If login fails, display error message
        setError(response.data.message);
      }
    } catch (err) {
      // Handle errors when server is unreachable or any other issue
      setError('Error connecting to the server');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}  // Update username state
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}  // Update password state
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {/* Show error if any */}
      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginPage;
