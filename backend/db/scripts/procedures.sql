-- Procedure to Create a User Profile
CREATE OR REPLACE PROCEDURE createUserProfile(
    p_username IN VARCHAR2,
    p_email IN VARCHAR2,
    p_password IN VARCHAR2,
    p_bio IN CLOB,
    p_location IN VARCHAR2
) IS
BEGIN
    INSERT INTO Users (Username, Email, Password, DateJoined, Bio, Location)
    VALUES (p_username, p_email, p_password, SYSDATE, p_bio, p_location);
    COMMIT;
END createUserProfile;
/

-- Procedure to Add a Post
CREATE OR REPLACE PROCEDURE addPost(
    p_userID IN NUMBER,
    p_content IN CLOB
) IS
BEGIN
    INSERT INTO Post (UserID, Content, PostDate, LikesCount, CommentsCount)
    VALUES (p_userID, p_content, SYSDATE, 0, 0);
    COMMIT;
END addPost;
/

-- Procedure to Like a Post (Including Aggregate Function for Like Count)
CREATE OR REPLACE PROCEDURE likePost(
    p_userID IN NUMBER,
    p_postID IN NUMBER
) IS
BEGIN
    -- Insert a Like
    INSERT INTO PostLike (UserID, PostID, LikeDate)
    VALUES (p_userID, p_postID, SYSDATE);

    -- Update the LikesCount for the post (Derived Attribute)
    UPDATE Post
    SET LikesCount = (SELECT COUNT(*) FROM PostLike WHERE PostID = p_postID)
    WHERE PostID = p_postID;
    
    COMMIT;
END likePost;
/

-- Procedure to Add a Comment
CREATE OR REPLACE PROCEDURE addComment(
    p_userID IN NUMBER,
    p_postID IN NUMBER,
    p_commentText IN CLOB
) IS
BEGIN
    -- Insert Comment
    INSERT INTO Comment (UserID, PostID, CommentText, CommentDate)
    VALUES (p_userID, p_postID, p_commentText, SYSDATE);

    -- Update the CommentsCount for the post (Derived Attribute)
    UPDATE Post
    SET CommentsCount = (SELECT COUNT(*) FROM Comment WHERE PostID = p_postID)
    WHERE PostID = p_postID;

    COMMIT;
END addComment;
/

-- Procedure to Get Total Likes and Comments for a User (Using Aggregate Functions)
CREATE OR REPLACE PROCEDURE getUserActivity(
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
END getUserActivity;
/

-- Procedure to Get a User's Follower Count (Cursor to Retrieve Followed Users)
CREATE OR REPLACE PROCEDURE getUserFollowers(
    p_userID IN NUMBER
) IS
    CURSOR c_followers IS
        SELECT FollowerUserID
        FROM Follows
        WHERE FollowedUserID = p_userID;
    
    v_followerCount NUMBER := 0;
BEGIN
    OPEN c_followers;

    LOOP
        FETCH c_followers INTO v_followerCount;
        EXIT WHEN c_followers%NOTFOUND;
        v_followerCount := v_followerCount + 1;
    END LOOP;

    CLOSE c_followers;
    
    -- Output the follower count
    DBMS_OUTPUT.PUT_LINE('User ' || p_userID || ' has ' || v_followerCount || ' followers.');
END getUserFollowers;
/

-- Procedure to Generate a Report for User Activity (Using Aggregate Functions)
CREATE OR REPLACE PROCEDURE generateUserReport(
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
END generateUserReport;
/

-- Procedure to Backup Data (Example using Simple Insert for Backup)
CREATE OR REPLACE PROCEDURE backupData IS
BEGIN
    -- Example: Create a backup table and copy data into it (Simplified)
    EXECUTE IMMEDIATE 'CREATE TABLE User_Backup AS SELECT * FROM Users';
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Backup of Users table completed.');
END backupData;
/
