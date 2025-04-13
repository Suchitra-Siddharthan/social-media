// backend/app.js
const express = require('express');
const cors = require('cors');  // To handle CORS issues (Cross-Origin Resource Sharing)
const bodyParser = require('body-parser');

const app = express();
const port = 5000;  // You can change this if you need

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample route for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Dummy check (replace with DB logic later)
  if (username === 'test' && password === 'test123') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.json({ success: false, message: 'Invalid username or password' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


app.use(cors());
app.use(express.json());

// Sample route
app.get('/api/posts', (req, res) => {
  res.json([
    { id: 1, title: 'Post 1', content: 'Welcome to the first post!' },
    { id: 2, title: 'Post 2', content: 'Second post content here.' }
  ]);
});



