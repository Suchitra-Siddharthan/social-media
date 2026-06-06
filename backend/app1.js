/* //app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createPool, getConnection } = require('./db/db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // allow cross-origin requests from React
app.use(bodyParser.json()); // parse JSON bodies

// Start server only after DB pool is ready
createPool()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err);
  });

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  try {
    const connection = await getConnection();

    // Query the database for the user credentials
    const result = await connection.execute(
      `SELECT * FROM Users WHERE Username = :username AND Password = :password`,
      [username, password]
    );

    // Close the connection once done
    await connection.close();

    // Check if user exists and return appropriate response
    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0];
      // Clean up the user object (remove sensitive information like password)
      const userData = {
        id: user.ID,       // Assuming the user has an ID column
        username: user.Username, // Assuming the user has a Username column
        // Add any other fields you want to send back, exclude sensitive data
      };

      res.json({ success: true, user: userData });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}); 



// Registration route
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const connection = await getConnection();
    
    // Get current date and time for DATEJOINED field
    const dateJoined = new Date().toISOString(); // Get the current timestamp in ISO format

    // Insert new user into the database
    const result = await connection.execute(
      `INSERT INTO Users (Username, Password, Email) 
       VALUES (:username, :password, :email)`,
      [username, password, email],
      { autoCommit: true }
    );
    

    await connection.commit(); // Commit the transaction
    await connection.close();

    res.json({ success: true, message: 'Registration successful!' });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});
//feed route
app.get('/api/posts', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    console.log('Connection established');

    // Execute the SQL query with username join
    const result = await connection.execute(
      `SELECT 
         p.*, 
         u.Username,
         calculatePostPopularity(p.postid) AS popularity_score,
         calculateUserEngagement(p.userid) AS engagement_score
       FROM post p
       JOIN Users u ON p.UserID = u.UserID
       ORDER BY 
         popularity_score DESC,
         engagement_score DESC`
    );

    // Extract column names
    const columns = result.metaData.map(col => col.name.toLowerCase());

    // Map the rows to JSON-friendly format
    const posts = await Promise.all(result.rows.map(async (row) => {
      const post = {};
      for (let index = 0; index < row.length; index++) {
        const value = row[index];
        const columnName = columns[index];
        
        // Handle CLOB data
        if (value && typeof value === 'object' && value.getData) {
          post[columnName] = await new Promise((resolve, reject) => {
            value.getData((err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
        } else {
          post[columnName] = value;
        }
      }
      return post;
    }));

    console.log("Mapped posts:", posts);
    res.json({ posts });

  } catch (error) {
    console.error('❌ Fetch posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) await connection.close();
  }
});


//report route
// Utility to safely extract raw data
const getSimpleData = (result) => {
  return result.rows.map(row => {
    const plainRow = {};
    result.metaData.forEach((col, i) => {
      plainRow[col.name] = row[i]; 
    });
    return plainRow;
  });
};

// Enhanced report endpoint
app.get('/api/report', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    
    // Test with simplest possible query
    const result = await conn.execute(
      `SELECT COUNT(*) AS user_count FROM Users`
    );
    
    // Manually extract data (avoid any Oracle objects)
    const userCount = result.rows[0][0];
    
    res.json({
      success: true,
      count: userCount
    });

  } catch (error) {
    console.error('Full error:', error); // Log complete error
    res.status(500).json({
      success: false,
      error: 'Simplified error message'
    });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error('Connection close error:', err);
      }
    }
  }
});
//backup route
app.post('/api/backup', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    // First check if backup tables exist
    const backupTablesCheck = await connection.execute(
      `SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME = 'USERS_BACKUP'`
    );
    
    if (backupTablesCheck.rows[0][0] === 0) {
      // Create backup tables if they don't exist
      await connection.execute(
        `CREATE TABLE Users_Backup AS SELECT * FROM Users WHERE 1=0`
      );
      await connection.execute(
        `CREATE TABLE UserProfile_Backup AS SELECT * FROM UserProfile WHERE 1=0`
      );
      await connection.execute(
        `CREATE TABLE Post_Backup AS SELECT * FROM Post WHERE 1=0`
      );
      await connection.execute(
        `CREATE TABLE Comment_Backup AS SELECT * FROM PostComment WHERE 1=0`
      );
      await connection.execute(
        `CREATE TABLE PostLike_Backup AS SELECT * FROM PostLike WHERE 1=0`
      );
      await connection.execute(
        `CREATE TABLE Hashtag_Backup AS SELECT * FROM Hashtag WHERE 1=0`
      );
      await connection.execute(
        `CREATE TABLE PostHashtag_Backup AS SELECT * FROM PostHashtag WHERE 1=0`
      );
      await connection.execute(
        `CREATE TABLE Notification_Backup AS SELECT * FROM Notification WHERE 1=0`
      );
    }

    // Execute the backup
    await connection.execute(
      `BEGIN
         Backup_All_Tables();
       END;`,
      [],
      { autoCommit: true }
    );

    const successResponse = {
      success: true, 
      message: '✅ Backup completed successfully'
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(successResponse));
  } catch (error) {
    console.error('❌ Backup error:', error);
    const errorResponse = {
      success: false,
      message: 'Backup failed',
      error: error.message
    };
    res.status(500).end(JSON.stringify(errorResponse));
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

//report part
const oracledb = require('oracledb');

// 1. Configure Oracle Client
try {
  oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
} catch (err) {
  console.error('Oracle Client initialization error:', err);
}

// 2. Safe Data Extraction Function
const getCleanData = (result) => {
  if (!result || !result.rows) return null;
  
  return result.rows.map(row => {
    const cleanRow = {};
    result.metaData.forEach((column, index) => {
      // Handle CLOB/BLOB data
      if (row[index] && typeof row[index] === 'object' && row[index].type === oracledb.CLOB) {
        cleanRow[column.name] = row[index].toString();
      } else {
        cleanRow[column.name] = row[index];
      }
    });
    return cleanRow;
  });
};

// 3. Report Endpoint with Complete Error Handling
app.get('/api/report', async (req, res) => {
  let connection;
  try {
    // A. Establish Connection
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONN_STR
    });

    // B. Execute All Queries
    const queries = [
      // Basic Counts
      `SELECT 
        (SELECT COUNT(*) FROM Users) AS total_users,
        (SELECT COUNT(*) FROM UserProfile WHERE IsPremium = 1) AS premium_users,
        (SELECT COUNT(*) FROM Post) AS total_posts,
        (SELECT COUNT(*) FROM PostLike) AS total_likes
      FROM dual`,
      
      // Most Active User
      `SELECT u.UserID, u.Username, COUNT(p.PostID) AS post_count
       FROM Users u
       JOIN Post p ON u.UserID = p.UserID
       GROUP BY u.UserID, u.Username
       ORDER BY post_count DESC
       FETCH FIRST 1 ROWS ONLY`,
       
      // Most Popular Post
      `SELECT p.PostID, p.Content, COUNT(l.LikeID) AS like_count
       FROM Post p
       LEFT JOIN PostLike l ON p.PostID = l.PostID
       GROUP BY p.PostID, p.Content
       ORDER BY like_count DESC
       FETCH FIRST 1 ROWS ONLY`
    ];

    const [counts, activeUser, popularPost] = await Promise.all(
      queries.map(q => connection.execute(q).then(getCleanData))
    );

    // C. Build Response
    const response = {
      success: true,
      data: {
        counts: counts[0],
        top_user: activeUser[0] || null,
        top_post: popularPost[0] || null,
        last_updated: new Date().toISOString()
      }
    };

    // D. Send Response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(response));

  } catch (error) {
    // E. Error Handling
    console.error('REPORT GENERATION FAILED:', {
      message: error.message,
      stack: error.stack.split('\n')[0],
      time: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      error: 'Report generation failed',
      request_id: req.id || Date.now()
    });

  } finally {
    // F. Cleanup Connection
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('CONNECTION CLOSE ERROR:', closeError.message);
      }
    }
  }
}); */


