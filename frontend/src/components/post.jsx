import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Post = () => {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3000/api/posts', {
        username: 'test', // You can replace this with session value later
        content,
        timestamp: new Date().toLocaleString()
      });
      alert("Post created!");
      navigate('/feed');
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    }
  };

  return (
    <div>
      <h2>Create a New Post</h2>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="4"
        cols="50"
      /><br/>
      <button onClick={handleSubmit}>Post</button>
    </div>
  );
};

export default Post;
