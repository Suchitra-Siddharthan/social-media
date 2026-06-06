import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate
import './feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [newPostContent, setNewPostContent] = useState(''); // State for new post content
  const [isCreatingPost, setIsCreatingPost] = useState(false); // State to toggle new post form visibility
  const [likedPosts, setLikedPosts] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user.id; // ✅ Works correctly now
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/feed');
        setPosts(response.data.posts);
      } catch (error) {
        console.error('❌ Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      // Initialize likedPosts state
      const initialLikes = {};
      posts.forEach(post => {
        initialLikes[post.postid] = post.userHasLiked || false;
      });
      setLikedPosts(initialLikes);
    }
  }, [posts]);



  const handleNewPostSubmit = async () => {
    if (!newPostContent.trim()) return;
  
    try {
      const response = await axios.post('http://localhost:3000/api/posts', {
        content: newPostContent,
        userId: userId
      });
  
      if (response.status === 200) {
        // Optional: you can refetch posts or prepend the new one if your backend returns it
        const newPost = response.data.newPost || {
          content: newPostContent,
          userid: userId,
          postdate: new Date().toISOString(),
          postid: Math.random(), // temp id
          likescount: 0,
          commentscount: 0,
          popularity_score: 0,
          engagement_score: 0
        };
        setPosts([newPost, ...posts]);
        setNewPostContent('');
        setIsCreatingPost(false);
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
    }
  };
  

  const toggleComments = async (postId) => {
    if (!expandedComments[postId]) {
      try {
        const response = await axios.get(`http://localhost:3000/api/posts/${postId}/comments`);
        setPosts(posts.map(post => 
          post.postid === postId 
            ? { 
                ...post, 
                comments: response.data.comments.map(c => ({
                  commentid: c.commentId,
                  userid: c.userId,
                  commenttext: c.commentText,
                  commentdate: c.commentDate,
                  username: c.username
                }))
              } 
            : post
        ));
      } catch (error) {
        console.error('❌ Error fetching comments:', error);
      }
    }
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/posts/like/${userId}/${postId}`);
      
        if (response.data.error === 'Post already liked') {
            alert('You have already liked this post!');
            return;
        }
  
        setPosts(posts.map(post =>
          post.postid === postId 
                ? { ...post, likescount: response.data.likesCount } 
            : post
        ));
    } catch (error) {
        console.error('Error handling like:', error);
        if (error.response?.data?.error === 'Post already liked') {
            alert('You have already liked this post!');
        }
    }
  };
  
  
  

  const handleAddComment = async (postId) => {
    if (!newComments[postId]?.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    if (!userId) {
      console.error("❌ No user ID found in localStorage.");
      return;
    }
  
    const commentText = newComments[postId];
  
    try {
      const response = await axios.post(
        `http://localhost:3000/api/posts/${postId}/comments`,
        { userid: userId, commenttext: commentText }
      );
  
      if (response.status === 201) {
        // Update the post with the new comment
        setPosts(prevPosts => 
          prevPosts.map(post => 
              post.postid === postId 
                ? { 
                    ...post, 
                    commentscount: post.commentscount + 1,
                    comments: [
                      ...(post.comments || []), 
                      {
                        commentid: response.data.commentId,
                        userid: userId,
                        commenttext: commentText,
                        commentdate: new Date().toISOString(),
                      username: user.username
                      }
                    ]
                  } 
                : post
          )
        );
  
        // Clear the comment input field
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    }
  };
  

  const handleGoToProfile = () => {
    navigate('/profile'); // Navigating to profile page
  };

  

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="feed-container">
      <h2 className="feed-title">Vibel</h2>

      <div className="feed-actions">
        <button className="add-post-btn" onClick={handleGoToProfile}>Your Profile</button>
            <button className="add-post-btn" onClick={() => setIsCreatingPost(!isCreatingPost)}>
              + Post
            </button>
      </div>
     
      {isCreatingPost && (
        <div className="new-post-form">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Write your new post..."
          />
          <div className="form-actions">
          <button onClick={handleNewPostSubmit} className="submit-post-btn">
            Submit Post
          </button>
          <button onClick={() => setIsCreatingPost(false)} className="cancel-post-btn">
            Cancel
          </button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="no-posts">No posts available yet. Be the first to post!</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.postid} className="post-card">
              <div className="post-header">
                {/* <img src={post.avatar || '/default-avatar.png'} alt="avatar" className="post-avatar" /> */}
                <div className="post-user-info">
                <span className="post-username">{post.username || `User ${post.userid}`}</span>
                <span className="post-date">
                  {new Date(post.postdate).toLocaleString()}
                </span>
                </div>
              </div>
              <div className="post-content">
                <p className="post-text">{post.content}</p>
              </div>
              <div className="post-scores">
                <span className="popularity-score">Popularity: {post.popularity_score}</span>
                <span className="engagement-score">Engagement: {post.engagement_score}</span>
              </div>
              <div className="post-actions">
              <button 
                  onClick={() => handleLike(post.postid)} 
                  className={`like-button ${likedPosts[post.postid] ? 'liked-button' : ''}`}
                >
                  {likedPosts[post.postid] ? '❤️' : '🤍'} {post.likescount}
                </button>
                <button 
                  onClick={() => toggleComments(post.postid)}
                  className="comment-button"
                >
                  💬 {post.commentscount}
                </button>
              </div>
              
              {expandedComments[post.postid] && (
                <div className="comment-section">
                  <div className="comment-list">
                    {post.comments?.map(comment => (
                      <div key={comment.commentid} className="comment-item">
                        {/* <img src={comment.avatar || '/default-avatar.png'} alt="avatar" className="comment-avatar" /> */}
                        <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-username">
                            {comment.username || (comment.userid === userId ? user.username : `User ${comment.userid}`)}
                          </span>
                          <span className="comment-date">
                            {new Date(comment.commentdate).toLocaleString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.commenttext}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="add-comment">
                    <textarea
                      value={newComments[post.postid] || ''}
                      onChange={(e) => setNewComments(prev => ({
                        ...prev,
                        [post.postid]: e.target.value
                      }))} 
                      placeholder="Write a comment..."
                      className="comment-input"
                    />
                    <button 
                      onClick={() => handleAddComment(post.postid)}
                      className="submit-comment"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
