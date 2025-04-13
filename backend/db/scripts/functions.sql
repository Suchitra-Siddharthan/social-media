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

-- Function to Get the Total Number of Likes on a Post
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

-- Function to Get the Total Number of Comments on a Post
CREATE OR REPLACE FUNCTION getPostCommentCount(
    p_postID IN NUMBER
) RETURN NUMBER IS
    v_commentCount NUMBER;
BEGIN
    -- Aggregate Function to count total comments for a post
    SELECT COUNT(*) INTO v_commentCount
    FROM Comment
    WHERE PostID = p_postID;

    RETURN v_commentCount;
END getPostCommentCount;
/

-- Function to Get the Engagement Score of a User (Based on Posts, Likes, and Comments)
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

-- Function to Get a List of Followers for a User (Using Cursor)
CREATE OR REPLACE FUNCTION getUserFollowersList(
    p_userID IN NUMBER
) RETURN SYS_REFCURSOR IS
    v_followersCursor SYS_REFCURSOR;
BEGIN
    -- Cursor to retrieve all followers of a user
    OPEN v_followersCursor FOR
        SELECT FollowerUserID
        FROM Follows
        WHERE FollowedUserID = p_userID;

    RETURN v_followersCursor;
END getUserFollowersList;
/

-- Function to Check if a User Exists by Email
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

-- Function to Get the Total Number of Followers for a User
CREATE OR REPLACE FUNCTION getUserFollowerCount(
    p_userID IN NUMBER
) RETURN NUMBER IS
    v_followerCount NUMBER;
BEGIN
    -- Aggregate Function to count total followers for a user
    SELECT COUNT(*) INTO v_followerCount
    FROM Follows
    WHERE FollowedUserID = p_userID;

    RETURN v_followerCount;
END getUserFollowerCount;
/

-- Function to Get the Total Number of Posts with a Specific Hashtag (Using Aggregate)
CREATE OR REPLACE FUNCTION getHashtagPostCount(
    p_hashtagText IN VARCHAR2
) RETURN NUMBER IS
    v_hashtagCount NUMBER;
BEGIN
    -- Aggregate Function to count total posts with a specific hashtag
    SELECT COUNT(*) INTO v_hashtagCount
    FROM PostHashtag
    WHERE HashtagID = (SELECT HashtagID FROM Hashtag WHERE HashtagText = p_hashtagText);

    RETURN v_hashtagCount;
END getHashtagPostCount;
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
