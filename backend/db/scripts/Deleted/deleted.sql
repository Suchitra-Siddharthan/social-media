CREATE OR REPLACE PROCEDURE REGISTER_USER (
    p_username IN VARCHAR2,
    p_password IN VARCHAR2,
    p_email IN VARCHAR2
) IS
BEGIN
    INSERT INTO users (username, password, email)
    VALUES (p_username, p_password, p_email);
    COMMIT;
END REGISTER_USER;
/

-- Procedure to Like a Post
CREATE OR REPLACE PROCEDURE LIKE_POST (
    p_userID IN NUMBER,
    p_postID IN NUMBER
) IS
BEGIN
    -- Insert a Like
    INSERT INTO PostLike (UserID, PostID, LikeDate)
    VALUES (p_userID, p_postID, SYSDATE);

    -- Update the LikesCount for the post
    UPDATE Post
    SET LikesCount = (SELECT COUNT(*) FROM PostLike WHERE PostID = p_postID)
    WHERE PostID = p_postID;
    
    COMMIT;
END LIKE_POST;
/
-- Procedure to Add a Comment
CREATE OR REPLACE PROCEDURE ADD_COMMENT (
    p_userID IN NUMBER,
    p_postID IN NUMBER,
    p_commentText IN CLOB
) IS
BEGIN
    -- Insert Comment
    INSERT INTO PostComment (UserID, PostID, CommentText, CommentDate)
    VALUES (p_userID, p_postID, p_commentText, SYSDATE);

    -- Update the CommentsCount for the post
    UPDATE Post
    SET CommentsCount = (SELECT COUNT(*) FROM PostComment WHERE PostID = p_postID)
    WHERE PostID = p_postID;

    COMMIT;
END ADD_COMMENT;
/

-- Procedure to Get Total Likes and Comments for a User
CREATE OR REPLACE PROCEDURE GET_USER_ACTIVITY (
    p_userID IN NUMBER
) IS
    v_totalLikes NUMBER;
    v_totalComments NUMBER;
BEGIN
    -- Aggregate Function for Likes
    SELECT SUM(LikesCount) INTO v_totalLikes
    FROM Post
    WHERE UserID = p_userID;

    -- Aggregate Function for Comments
    SELECT SUM(CommentsCount) INTO v_totalComments
    FROM Post
    WHERE UserID = p_userID;

    -- Output the total activity (likes and comments)
    DBMS_OUTPUT.PUT_LINE('User ' || p_userID || ' has ' || v_totalLikes || ' likes and ' || v_totalComments || ' comments.');
END GET_USER_ACTIVITY;
/

-- Procedure to Generate a Report for User Activity
CREATE OR REPLACE PROCEDURE GENERATE_USER_REPORT (
    p_userID IN NUMBER
) IS
    v_totalPosts NUMBER;
    v_totalLikes NUMBER;
    v_totalComments NUMBER;
BEGIN
    -- Aggregate Function for Total Posts
    SELECT COUNT(*) INTO v_totalPosts
    FROM Post
    WHERE UserID = p_userID;

    -- Aggregate Function for Total Likes
    SELECT SUM(LikesCount) INTO v_totalLikes
    FROM Post
    WHERE UserID = p_userID;

    -- Aggregate Function for Total Comments
    SELECT SUM(CommentsCount) INTO v_totalComments
    FROM Post
    WHERE UserID = p_userID;

    -- Output the report
    DBMS_OUTPUT.PUT_LINE('User ' || p_userID || ' has ' || v_totalPosts || ' posts, ' || v_totalLikes || ' likes, and ' || v_totalComments || ' comments.');
END GENERATE_USER_REPORT;
/

-- Procedure to Backup Data
CREATE OR REPLACE PROCEDURE BACKUP_DATA IS
BEGIN
    -- Example: Create a backup table and copy data into it
    EXECUTE IMMEDIATE 'CREATE TABLE User_Backup AS SELECT * FROM Users';
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Backup of Users table completed.');
END BACKUP_DATA;
/

-- Procedure to get most active users based on post count
CREATE OR REPLACE PROCEDURE GET_TOP_POSTING_USERS IS
    CURSOR top_users IS
        SELECT Username, COUNT(*) AS PostCount
        FROM Users U JOIN Post P ON U.UserID = P.UserID
        GROUP BY Username
        ORDER BY PostCount DESC FETCH FIRST 5 ROWS ONLY;
    
    v_username Users.Username%TYPE;
    v_count NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('Top 5 Most Active Users (by Posts):');
    DBMS_OUTPUT.PUT_LINE('------------------------------------');
    
    OPEN top_users;
    LOOP
        FETCH top_users INTO v_username, v_count;
        EXIT WHEN top_users%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(v_username || ' - ' || v_count || ' posts');
    END LOOP;
    CLOSE top_users;
END GET_TOP_POSTING_USERS;
/

-- Procedure to show average likes per post
CREATE OR REPLACE PROCEDURE AVG_LIKES_PER_POST IS
    v_avg_likes NUMBER;
BEGIN
    SELECT AVG(LikesCount) INTO v_avg_likes FROM Post;
    DBMS_OUTPUT.PUT_LINE('Average Likes per Post: ' || ROUND(v_avg_likes, 2));
END AVG_LIKES_PER_POST;
/

-- Procedure to generate daily post count
CREATE OR REPLACE PROCEDURE DAILY_POST_COUNT_REPORT IS
    CURSOR daily_stats IS
        SELECT TRUNC(PostDate) AS Day, COUNT(*) AS TotalPosts
        FROM Post
        GROUP BY TRUNC(PostDate)
        ORDER BY Day DESC;

    v_day DATE;
    v_total NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('Date       | Total Posts');
    DBMS_OUTPUT.PUT_LINE('-------------------------');

    OPEN daily_stats;
    LOOP
        FETCH daily_stats INTO v_day, v_total;
        EXIT WHEN daily_stats%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(TO_CHAR(v_day, 'YYYY-MM-DD') || ' | ' || v_total);
    END LOOP;
    CLOSE daily_stats;
END DAILY_POST_COUNT_REPORT;
/

-- Procedure to check user credentials
CREATE OR REPLACE PROCEDURE CHECK_USER (
    p_username IN VARCHAR2,
    p_password IN VARCHAR2,
    p_is_valid OUT VARCHAR2
) IS
BEGIN
    SELECT CASE
             WHEN COUNT(*) > 0 THEN 'Y'
             ELSE 'N'
           END
    INTO p_is_valid
    FROM users
    WHERE username = p_username AND password = p_password;
END CHECK_USER;
/
 CREATE OR REPLACE PROCEDURE insertLike(
  p_postid IN NUMBER,
  p_userid IN NUMBER
) IS
BEGIN
  INSERT INTO postlike (LIKEID, POSTID, USERID, LIKEDATE)
  VALUES (postlike_seq.NEXTVAL, p_postid, p_userid, SYSTIMESTAMP);
  
  COMMIT;
END;
/
-- CREATE SEQUENCE postlike_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE PROCEDURE insertComment(
  p_postid IN NUMBER,
  p_userid IN NUMBER,
  p_commenttext IN VARCHAR2
) IS
BEGIN
  INSERT INTO postcomment (COMMENTID, POSTID, USERID, COMMENTTEXT, COMMENTDATE)
  VALUES (postcomment_seq.NEXTVAL, p_postid, p_userid, p_commenttext, SYSTIMESTAMP);
  
  COMMIT;
END;
/
CREATE OR REPLACE PROCEDURE get_user_profile (
  p_userid IN NUMBER,
  p_result OUT SYS_REFCURSOR
)
IS
BEGIN
  OPEN p_result FOR
    SELECT 
      u.Username,
      u.Email,
      u.DateJoined,
      u.Bio,
      u.Location,
      u.PopularityScore,
      NVL(up.ProfilePictureURL, '') as ProfilePictureURL,
      NVL(up.WebsiteURL, '') as WebsiteURL,
      NVL(up.DateOfBirth, TO_DATE('1900-01-01', 'YYYY-MM-DD')) as DateOfBirth,
      NVL(up.IsPremium, 0) as IsPremium
    FROM Users u
    LEFT JOIN UserProfile up ON u.UserID = up.UserID
    WHERE u.UserID = p_userid;
END get_user_profile;
/
show errors;

 CREATE OR REPLACE PROCEDURE mark_notification_as_read(
    p_notification_id IN NUMBER
)
IS
BEGIN
    UPDATE Notification
    SET IsRead = 1
    WHERE NotificationID = p_notification_id;

    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE CREATE_POST (
    p_content IN VARCHAR2,
    p_user_id IN NUMBER
) IS
BEGIN
    INSERT INTO post(content, userid, postdate)
    VALUES (p_content, p_user_id, SYSDATE);
    COMMIT;
END CREATE_POST;
/ 

-- Function to Get the Total Number of Posts by a User
CREATE OR REPLACE FUNCTION getUserPostCount(
    p_userID IN NUMBER
) RETURN NUMBER IS
    v_postCount NUMBER;
BEGIN
    -- Aggregate Function to count total posts for a user
    SELECT COUNT(*) INTO v_postCount
    FROM Post
    WHERE UserID = p_userID;

    RETURN v_postCount;
END getUserPostCount;
/

CREATE OR REPLACE FUNCTION checkUserExistsByEmail(
    p_email IN VARCHAR2
) RETURN NUMBER IS
    v_count NUMBER;
BEGIN
    -- Function to check if a user exists by email (using COUNT as aggregate)
    SELECT COUNT(*) INTO v_count
    FROM Users
    WHERE Email = p_email;

    -- Return 1 if the user exists, otherwise 0
    IF v_count > 0 THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END checkUserExistsByEmail;
/




-- Function to Get a User's Last Post Date
CREATE OR REPLACE FUNCTION getUserLastPostDate(
    p_userID IN NUMBER
) RETURN TIMESTAMP IS
    v_lastPostDate TIMESTAMP;
BEGIN
    -- Query to fetch the latest post date for a user
    SELECT MAX(PostDate) INTO v_lastPostDate
    FROM Post
    WHERE UserID = p_userID;

    RETURN v_lastPostDate;
END getUserLastPostDate;
/

CREATE OR REPLACE FUNCTION calculatePostPopularity(p_postID IN NUMBER) RETURN NUMBER IS
    v_likes NUMBER := 0;
    v_comments NUMBER := 0;
    v_score NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_likes FROM PostLike WHERE PostID = p_postID;
    SELECT COUNT(*) INTO v_comments FROM PostComment WHERE PostID = p_postID;

    v_score := (v_likes * 0.6) + (v_comments * 0.4);
    RETURN v_score;
END;
/
CREATE OR REPLACE FUNCTION calculateUserEngagement(
    p_userID IN NUMBER
) RETURN NUMBER IS
    v_postCount NUMBER;
    v_likeCount NUMBER;
    v_commentCount NUMBER;
    v_engagementScore NUMBER;
BEGIN
    -- Using Aggregate Functions to get total posts, likes, and comments
    SELECT COUNT(*) INTO v_postCount FROM Post WHERE UserID = p_userID;
    SELECT SUM(LikesCount) INTO v_likeCount FROM Post WHERE UserID = p_userID;
    SELECT SUM(CommentsCount) INTO v_commentCount FROM Post WHERE UserID = p_userID;

    -- Calculate an engagement score based on total posts, likes, and comments
    v_engagementScore := (v_postCount * 0.5) + (v_likeCount * 0.3) + (v_commentCount * 0.2);

    RETURN v_engagementScore;
END calculateUserEngagement;
/
 
 



CREATE OR REPLACE FUNCTION getPostLikeCount(
    p_postID IN NUMBER
) RETURN NUMBER IS
    v_likeCount NUMBER;
BEGIN
    -- Aggregate Function to count total likes for a post
    SELECT COUNT(*) INTO v_likeCount
    FROM PostLike
    WHERE PostID = p_postID;

    RETURN v_likeCount;
END getPostLikeCount;
/

show errors;

CREATE OR REPLACE FUNCTION Get_Post_With_Max_Engagement
RETURN NUMBER IS
    max_post_id NUMBER;
BEGIN
    -- Query to find the first PostID with the maximum EngagementRate
    SELECT PostID INTO max_post_id
    FROM (
        SELECT PostID 
        FROM Post
        WHERE EngagementRate = (
            SELECT MAX((LikesCount * 0.6) + (CommentsCount * 0.4))
            FROM Post
        )
        ORDER BY PostID
    )
    WHERE ROWNUM = 1;

    RETURN max_post_id;
END Get_Post_With_Max_Engagement;
/ 
CREATE OR REPLACE FUNCTION Get_User_With_Max_Popularity
RETURN NUMBER IS
    max_user_id NUMBER;
BEGIN
    -- Query to find the first UserID with the maximum PopularityScore
    SELECT UserID INTO max_user_id
    FROM (
        SELECT UserID 
        FROM Users
        WHERE PopularityScore = (SELECT MAX(PopularityScore) FROM Users)
        ORDER BY UserID
    )
    WHERE ROWNUM = 1;

    RETURN max_user_id;
END Get_User_With_Max_Popularity;
/

