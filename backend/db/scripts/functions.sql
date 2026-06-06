CREATE OR REPLACE FUNCTION calculateUserPopularity(
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
    v_engagementScore := (v_likeCount * 0.3) + (v_commentCount * 0.2);

    RETURN v_engagementScore;
END calculateUserEngagement;
/

 CREATE OR REPLACE FUNCTION calculatePostEngagement(p_postID IN NUMBER) RETURN NUMBER IS
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

CREATE OR REPLACE FUNCTION Get_User_With_Max_Popularity
RETURN NUMBER IS
    CURSOR user_cursor IS
        SELECT UserID
        FROM Users
        WHERE PopularityScore = (SELECT MAX(PopularityScore) FROM Users)
        ORDER BY UserID;
    
    max_user_id NUMBER;
BEGIN
    OPEN user_cursor;
    FETCH user_cursor INTO max_user_id;
    CLOSE user_cursor;
    
    RETURN max_user_id;
END Get_User_With_Max_Popularity;
/

CREATE OR REPLACE FUNCTION Get_Post_With_Max_Engagement
RETURN NUMBER IS
    max_post_id NUMBER;
BEGIN
    -- Query to find the PostID with the maximum calculated engagement rate
    SELECT PostID INTO max_post_id
    FROM (
        SELECT PostID, (LikesCount * 0.6) + (CommentsCount * 0.4) as calculated_engagement
        FROM Post
        ORDER BY calculated_engagement DESC
    )
    WHERE ROWNUM = 1;

    RETURN max_post_id;
END Get_Post_With_Max_Engagement;
/
