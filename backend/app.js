const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const dbConfig = require('./db');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const JWT_SECRET='socialmedia_secret_key';
const ADMIN_USERNAME='admin';

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Create a connection pool
let pool;
async function initializePool() {
  try {
    pool = await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1
    });
    console.log('Connection pool created');
  } catch (err) {
    console.error('Error creating connection pool:', err);
    process.exit(1);
  }
}

// Get a connection from the pool
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (err) {
    console.error('Error getting connection from pool:', err);
    throw err;
  }
}

// Initialize the pool when the server starts
initializePool();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (pool) {
    try {
      await pool.close(10);
      console.log('Pool closed');
    } catch (err) {
      console.error('Error closing pool:', err);
    }
  }
  process.exit(0);
});

//jwt middleware
function verifyToken(req,res,next){
  const authHeader=req.headers.authorization;
  if(!authHeader)return res.status(401).json({success:false,message:'Access denied'});
  const token=authHeader.split(' ')[1];
  try{
    req.user=jwt.verify(token,JWT_SECRET);
    next();
  }catch(err){
    return res.status(403).json({success:false,message:'Invalid or expired token'});
  }
}

//admin middleware
function verifyAdmin(req,res,next){
  if(req.user.role!=='admin'){
    return res.status(403).json({success:false,message:'Admin access only'});
  }
  next();
}

// Login Route
// Login Route - Updated with more debugging
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password }); // Log incoming credentials

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Both username and password are required' 
    });
  }

  let connection;
  try {
    connection = await getConnection();

    // Log the actual query being executed
    console.log(`Executing: SELECT UserID, Username, Email FROM Users WHERE Username = '${username}' AND Password = '${password}'`);

    const result=await connection.execute(
      `SELECT UserID,Username,Email,Password FROM Users WHERE Username=:username`,
      [username]
    );

    console.log('Query results:', result.rows); // Log the results

    if(result.rows.length===0){
      return res.status(401).json({
        success:false,
        message:'Invalid credentials'
      });
    }
    
    const isMatch=await bcrypt.compare(password,result.rows[0][3]);
    
    if(!isMatch){
      return res.status(401).json({
        success:false,
        message:'Invalid credentials'
      });
    }
    
    const role=username===ADMIN_USERNAME?'admin':'user';
    
    const token=jwt.sign(
      {
        userId:result.rows[0][0],
        username:result.rows[0][1],
        role
      },
      JWT_SECRET,
      {expiresIn:'1d'}
    );
    
    const user={
      id:result.rows[0][0],
      username:result.rows[0][1],
      email:result.rows[0][2],
      role
    };
    
    res.json({
      success:true,
      token,
      role,
      user
    });
    
    else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
});

// Register Route
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  let connection;
  try {
    connection = await getConnection();

    // Check if username or email already exists
    const checkResult = await connection.execute(
      `SELECT 1 FROM Users WHERE Username = :username OR Email = :email`,
      [username, email]
    );

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }

    // Insert new user
    const hashedPassword=await bcrypt.hash(password,10);
    
    await connection.execute(
      `BEGIN insert_user(:userid,:username,:email,:password,SYSDATE,NULL,NULL,0); END;`,
      {userid:null,username,email,password:hashedPassword}
    );
    res.json({ 
      success: true, 
      message: 'Registration successful' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

//feed route
// Feed Route - Get all posts with popularity and engagement scores
app.get('/api/feed', async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result=await connection.execute(`BEGIN get_feed_posts(:p_result); END;`,{p_result:{dir:oracledb.BIND_OUT,type:oracledb.CURSOR}},{outFormat:oracledb.OUT_FORMAT_OBJECT});

    const resultSet=result.outBinds.p_result;

    const rows=await resultSet.getRows();

    await resultSet.close();

    const posts=rows.map(row=>({postid:row.POSTID,userid:row.USERID,content:row.CONTENT,postdate:row.POSTDATE,likescount:row.LIKESCOUNT,commentscount:row.COMMENTSCOUNT,username:row.USERNAME,popularity_score:row.POPULARITY_SCORE,engagement_score:row.ENGAGEMENT_SCORE}));

    res.json({ posts });

  } catch (error) {
    console.error('Fetch posts error:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });

  } finally {

    if (connection) {

      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }

    }

  }

});


//posting route
app.post('/api/posts', async (req, res) => {
  const { content, userId } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `BEGIN CREATE_POST(:p_content, :p_user_id); END;`,
      {
        p_content: content,
        p_user_id: userId
      }
    );

    await connection.commit();

    res.status(200).json({ message: 'Post created successfully' });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

//like and comment route
app.post('/api/posts/like/:userId/:postId', async (req, res) => {
  const { userId, postId } = req.params;
  const connection = await oracledb.getConnection(dbConfig);

  try {
    // Check if the post exists
    const postResult = await connection.execute(
      `SELECT PostID FROM Post WHERE PostID = :postId`,
      { postId: parseInt(postId) }
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user has already liked the post
    const likeCheck = await connection.execute(
      `SELECT * FROM PostLike WHERE UserID = :userId AND PostID = :postId`,
      { userId: parseInt(userId), postId: parseInt(postId) }
    );

    if (likeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    // Insert the like
    await connection.execute(
      `INSERT INTO PostLike (UserID, PostID, LikeDate) 
       VALUES (:userId, :postId, SYSTIMESTAMP)`,
      { userId: parseInt(userId), postId: parseInt(postId) }
    );

    // Get the updated like count
    const likeCountResult = await connection.execute(
      `SELECT LikesCount FROM Post WHERE PostID = :postId`,
      { postId: parseInt(postId) }
    );

    await connection.commit();
    res.json({ 
      success: true, 
      likesCount: likeCountResult.rows[0][0] 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Error liking post' });
  } finally {
        await connection.close();
  }
});



//comment router
// Get all comments for a post
app.get('/api/posts/:postid/comments', async (req, res) => {
  const { postid } = req.params;

  if (!postid) {
    return res.status(400).json({ message: 'Post ID is required' });
  }

  let connection;
  try {
    connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT c.COMMENTID, c.POSTID, c.USERID, c.COMMENTTEXT, c.COMMENTDATE, 
              u.USERNAME, u.POPULARITYSCORE
       FROM POSTCOMMENT c
       JOIN USERS u ON c.USERID = u.USERID
       WHERE c.POSTID = :postid
       ORDER BY c.COMMENTDATE DESC`,
      [postid]
    );

    const comments = result.rows.map(row => ({
      commentId: row[0],
      postId: row[1],
      userId: row[2],
      commentText: row[3],
      commentDate: row[4],
      username: row[5],
      popularityScore: row[6]
    }));

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
});

// Add a new comment to a post
app.post('/api/posts/:postid/comments', async (req, res) => {
  const { postid } = req.params;
  const { userid, commenttext } = req.body;

  if (!postid || !userid || !commenttext) {
    return res.status(400).json({ 
      success: false,
      message: 'Post ID, User ID, and Comment Text are required' 
    });
  }

  let connection;
  try {
    connection = await getConnection();
    
    // Using direct INSERT instead of stored procedure for simplicity
    const result = await connection.execute(
      `BEGIN add_comment(:postid,:userid,:commenttext); END;`,
      {
        postid,
        userid,
        commenttext,
        commentid: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const newCommentId = result.outBinds.commentid[0];
    
    res.status(201).json({ 
      success: true,
      message: 'Comment added successfully',
      commentId: newCommentId
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add comment' 
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
});




//profile router
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN get_user_profile(:p_userid, :p_result); END;`,
      {
        p_userid: parseInt(userId),
        p_result: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    const resultSet = result.outBinds.p_result;
    const rows = await resultSet.getRows();
    await resultSet.close();

    if (!rows || rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found' 
      });
    }

    const profile = rows[0];

    res.json({
      success: true,
      profile: {
        username: profile.USERNAME || '',
        email: profile.EMAIL || '',
        bio: profile.BIO || '',
        location: profile.LOCATION || '',
        profilePictureUrl: profile.PROFILEPICTUREURL || '',
        websiteUrl: profile.WEBSITEURL || '',
        dateOfBirth: profile.DATEOFBIRTH ? new Date(profile.DATEOFBIRTH).toISOString().split('T')[0] : null,
        isPremium: profile.ISPAYING === 1,
        popularityScore: profile.POPULARITYSCORE || 0,
        dateJoined: profile.DATEJOINED ? new Date(profile.DATEJOINED).toISOString() : null
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
});



// Profile update route
// Express Route (Node.js) - app.put('/api/profile/:userId')
app.put('/api/profile/:userId', async (req, res) => {
  const userId = req.params.userId;
  const {
    username,
    email,
    bio,
    location,
    profilePictureUrl,
    websiteUrl,
    dateOfBirth,
    isPremium
  } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `
      BEGIN
        update_user_profile(
          p_userid => :userId,
          p_username => :username,
          p_email => :email,
          p_bio => :bio,
          p_location => :location,
          p_profilepictureurl => :profilePictureUrl,
          p_websiteurl => :websiteUrl,
          p_dateofbirth => TO_DATE(:dateOfBirth, 'YYYY-MM-DD'),
          p_ispremium => :isPremium
        );
      END;
      `,
      {
        userId: Number(userId),
        username,
        email,
        bio,
        location,
        profilePictureUrl,
        websiteUrl,
        dateOfBirth: dateOfBirth || null,
        isPremium: isPremium ? 1 : 0,
      }
    );

    await connection.commit();
    await connection.close();

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error in update_user_profile:', err);
    res.status(500).json({
      error: 'Failed to update profile',
      details: err.message
    });
  }
});

//notification route
// GET /api/notifications/:userId
app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const connection = await getConnection();

    // Get all unread notifications
    const unreadResult = await connection.execute(
      `SELECT * FROM Notification WHERE UserID = :userId AND IsRead = 0 ORDER BY notificationdate DESC`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Get all read notifications
    const readResult = await connection.execute(
      `SELECT * FROM Notification WHERE UserID = :userId AND IsRead = 1 ORDER BY notificationdate DESC`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    res.json({
      success: true,
      unread: unreadResult.rows,
      read: readResult.rows
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notifications' 
    });
  }
});

// Mark notification as read
app.post('/api/notifications/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;

  try {
    const connection = await getConnection();

    // Execute the stored procedure
    await connection.execute(
      `BEGIN mark_notification_as_read(:id); END;`,
      { id: notificationId }
    );

    await connection.commit();

    // Get the updated notification to confirm it was marked as read
    const result = await connection.execute(
      `SELECT * FROM Notification WHERE NotificationID = :id`,
      [notificationId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mark notification as read' 
    });
  }
});

//backup routes
app.post('/api/backup', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    // Call the stored procedure to perform the backup
    const result = await connection.execute(
      `BEGIN
         Backup_All_Tables;
       END;`
    );

    // Respond with success if the procedure was executed successfully
    res.status(200).json({ success: true, message: 'Backup completed successfully' });

  } catch (error) {
    console.error('Error occurred during backup:', error);
    res.status(500).json({ success: false, message: 'Backup failed. Please try again.' });
  } finally {
    if (connection) {
      try {
        // Ensure to release the connection after the operation
        await connection.close();
      } catch (error) {
        console.error('Error closing the connection:', error);
      }
    }
  }
});

//report route
app.get('/api/report', verifyToken, verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    // Get total number of users
    const totalUsersResult = await connection.execute(
      `SELECT COUNT(*) AS total_users FROM Users`
    );
    const totalUsers = totalUsersResult.rows[0][0];
    const totalPosts=(await connection.execute(`SELECT COUNT(*) FROM Post`)).rows[0][0];
    const totalLikes=(await connection.execute(`SELECT COUNT(*) FROM PostLike`)).rows[0][0];
    const totalComments=(await connection.execute(`SELECT COUNT(*) FROM PostComment`)).rows[0][0];

    // Get user with max popularity
    let maxPopularityUser = null;
    try {
      const maxPopularityUserIdResult = await connection.execute(
        `SELECT Get_User_With_Max_Popularity() FROM dual`
      );
      const maxPopularityUserId = maxPopularityUserIdResult.rows[0][0];

      if (maxPopularityUserId) {
        const maxPopularityUserResult = await connection.execute(
          `SELECT USERID, USERNAME, EMAIL, POPULARITYSCORE, DATEJOINED, BIO, LOCATION 
           FROM Users 
           WHERE USERID = :userId`,
          [maxPopularityUserId]
        );
        
        if (maxPopularityUserResult.rows.length > 0) {
          maxPopularityUser = {
            UserID: maxPopularityUserResult.rows[0][0],
            Username: maxPopularityUserResult.rows[0][1],
            Email: maxPopularityUserResult.rows[0][2],
            PopularityScore: maxPopularityUserResult.rows[0][3],
            DateJoined: maxPopularityUserResult.rows[0][4],
            Bio: maxPopularityUserResult.rows[0][5],
            Location: maxPopularityUserResult.rows[0][6]
            // Removed IsPremium, ProfilePictureURL, and DateOfBirth as they don't exist
          };
        }
      }
    } catch (userError) {
      console.error('Error fetching max popularity user:', userError);
    }

    // Get post with max engagement
    let maxEngagementPost = null;
    try {
      const maxEngagementPostIdResult = await connection.execute(
        `SELECT Get_Post_With_Max_Engagement() FROM dual`
      );
      const maxEngagementPostId = maxEngagementPostIdResult.rows[0][0];

      if (maxEngagementPostId) {
        const maxEngagementPostResult = await connection.execute(
          `SELECT POSTID, USERID, CONTENT, POSTDATE, LIKESCOUNT, COMMENTSCOUNT, ENGAGEMENTRATE 
           FROM Post 
           WHERE POSTID = :postId`,
          [maxEngagementPostId]
        );
        
        if (maxEngagementPostResult.rows.length > 0) {
          maxEngagementPost = {
            PostID: maxEngagementPostResult.rows[0][0],
            UserID: maxEngagementPostResult.rows[0][1],
            Content: maxEngagementPostResult.rows[0][2],
            PostDate: maxEngagementPostResult.rows[0][3],
            LikesCount: maxEngagementPostResult.rows[0][4],
            CommentsCount: maxEngagementPostResult.rows[0][5],
            EngagementRate: maxEngagementPostResult.rows[0][6]
          };
        }
      }
    } catch (postError) {
      console.error('Error fetching max engagement post:', postError);
    }

    res.json({
      success:true,
      totalUsers,
      totalPosts,
      totalLikes,
      totalComments,
      maxPopularityUser,
      maxEngagementPost
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
});


