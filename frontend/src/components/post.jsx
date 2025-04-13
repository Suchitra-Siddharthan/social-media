import React, { useState } from 'react';
import axios from 'axios';

const Post = ({ post }) => {
  const [likeCount, setLikeCount] = useState(post.LikesCount);

  const handleLike = async () => {
    try {
      await axios.post('/api/like', { postId: post.PostID });
      setLikeCount(likeCount + 1);
    } catch (error) {
      console.error('Error liking the post:', error);
    }
  };

  return (
    <div className="post-container">
      <p>{post.Content}</p>
      <button onClick={handleLike}>Like ({likeCount})</button>
    </div>
  );
};

export default Post;
