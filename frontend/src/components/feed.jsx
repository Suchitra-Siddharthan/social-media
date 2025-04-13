import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post';

const Feed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="feed-container">
      <h2>Feed</h2>
      {posts.map(post => (
        <Post key={post.PostID} post={post} />
      ))}
    </div>
  );
};

export default Feed;
