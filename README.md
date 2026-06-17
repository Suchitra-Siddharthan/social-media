# Social Media Analytics Platform

A full-stack social media application built using React, Node.js, Express.js, Oracle Database, SQL, and PL/SQL. The platform enables users to create posts, interact through likes and comments, receive notifications, manage profiles, and track engagement metrics. Administrative analytics are also supported through a dedicated dashboard.

---

## Repository

https://github.com/Suchitra-Siddharthan/social-media

---

## Author

**Suchitra Siddharthan**

---

## Features

### Authentication & Security

* User registration
* User login
* Password hashing using bcrypt
* JWT-based authentication
* Automatic role detection for users and administrators
* Protected API routes using JWT middleware

### User Profile Management

* View user profiles
* Update profile information
* Update bio, location, website, and profile details
* Track popularity score

### Post Management

* Create posts
* View posts in feed
* Dynamic feed ranking
* Track engagement metrics

### Likes & Comments

* Like posts
* Comment on posts
* View comments for each post
* Duplicate likes prevented through database constraints

### Notifications

* Automatic notification generation for likes
* Automatic notification generation for comments
* View unread notifications
* Mark notifications as read

### Analytics

* User popularity calculation
* Post engagement calculation
* Most popular user identification
* Highest engagement post identification

### Admin Dashboard

* Total users
* Total posts
* Total likes
* Total comments
* Most popular user
* Highest engagement post
* Role-based access control

### Database Automation

* Automatic likes count update
* Automatic comments count update
* Automatic engagement rate calculation
* Automatic popularity score calculation
* Automatic notification creation

---

## Technology Stack

### Frontend

* React
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js

### Database

* Oracle Database
* SQL
* PL/SQL

### Security

* bcrypt
* JSON Web Token (JWT)

---

## Database Components

### Tables

* Users
* UserProfile
* Post
* PostLike
* PostComment
* Notification

### Procedures

* insert_user
* insert_userprofile
* CREATE_POST
* update_user_profile
* get_user_profile
* add_comment
* get_feed_posts

### Functions

* Get_User_With_Max_Popularity
* calculateUserPopularity
* Get_Post_With_Max_Engagement
* calculatePostEngagement

### Triggers

* trg_increment_likes
* trg_increment_comments
* trg_like_update
* trg_comment_update
* tr_notification_on_like
* tr_notification_on_comment

### Cursors

#### Explicit Cursor

Used in:

* Get_User_With_Max_Popularity

Purpose:

* Fetch user with maximum popularity score

#### SYS_REFCURSOR

Used in:

* get_user_profile
* get_feed_posts

Purpose:

* Return dynamic result sets from PL/SQL procedures

---

## API Endpoints

### Authentication

```http
POST /api/register
POST /api/login
```

### Feed

```http
GET /api/feed
```

### Posts

```http
POST /api/posts
POST /api/posts/like/:userId/:postId
```

### Comments

```http
GET /api/posts/:postid/comments
POST /api/posts/:postid/comments
```

### Profile

```http
GET /api/profile/:userId
PUT /api/profile/:userId
```

### Notifications

```http
GET /api/notifications/:userId
POST /api/notifications/:notificationId/read
```

### Reports

```http
GET /api/report
```

### Backup

```http
POST /api/backup
```

---

## Project Structure

```text
social-media/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login
│   │   │   ├── Register
│   │   │   ├── Feed
│   │   │   ├── Profile
│   │   │   ├── Admin
│   │   │   └── Notifications
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── backend/
│   ├── app.js
│   ├── db.js
│   ├── package.json
│   └── database scripts
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Suchitra-Siddharthan/social-media.git
cd social-media
```

---

## Backend Setup

Navigate to backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Install required packages:

```bash
npm install express cors oracledb bcrypt jsonwebtoken
```

Configure Oracle database credentials inside:

```text
backend/db.js
```

Example:

```js
module.exports = {
  user: "your_username",
  password: "your_password",
  connectString: "localhost/XEPDB1"
};
```

---

## Frontend Setup

Navigate to frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

---

## Running the Application

### Start Backend

```bash
node app.js
```

### Start Frontend

```bash
npm run dev
```

---

## Default Ports

### Frontend

```text
http://localhost:5173
```

### Backend

```text
http://localhost:3000
```

---

## Database Setup

Execute the Oracle SQL scripts in the following order:

1. Table Creation Scripts
2. Constraint Definitions
3. Stored Procedures
4. Functions
5. Triggers
6. Backup Procedures

---

## Security Features

* bcrypt password hashing
* JWT authentication
* Role-based access control
* Protected admin endpoints
* Database constraints
* Foreign key enforcement
* Duplicate like prevention

---

## Key Concepts Demonstrated

* Relational Database Design
* Database Normalization
* Stored Procedures
* Functions
* Triggers
* Explicit Cursors
* SYS_REFCURSOR
* Transactions
* Constraints
* REST APIs
* Authentication & Authorization
* Full-Stack Development
* Oracle PL/SQL Programming

---

## Future Enhancements

* Media upload support
* Follow/Unfollow functionality
* Real-time notifications using WebSockets
* JWT refresh tokens
* Cloud deployment
* Recommendation engine
* Advanced analytics dashboard

---

## License

This project was developed for educational and learning purposes.
