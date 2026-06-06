CREATE OR REPLACE PROCEDURE insert_user(
    p_userid        IN NUMBER,
    p_username      IN VARCHAR2,
    p_email         IN VARCHAR2,
    p_password      IN VARCHAR2,
    p_datejoined    IN DATE,
    p_bio           IN VARCHAR2,
    p_location      IN VARCHAR2,
    p_popularityscore IN NUMBER
)
IS
BEGIN
    INSERT INTO users (USERID, USERNAME, EMAIL, PASSWORD, DATEJOINED, BIO, LOCATION, POPULARITYSCORE)
    VALUES (p_userid, p_username, p_email, p_password, p_datejoined, p_bio, p_location, p_popularityscore);
    COMMIT;
END insert_user;
/


CREATE OR REPLACE PROCEDURE insert_userprofile(
    p_userid           IN NUMBER,
    p_profilepictureurl IN VARCHAR2,
    p_websiteurl       IN VARCHAR2,
    p_dateofbirth      IN DATE,
    p_ispremium        IN NUMBER
)
IS
BEGIN
    INSERT INTO userprofile (USERID, PROFILEPICTUREURL, WEBSITEURL, DATEOFBIRTH, ISPREMIUM)
    VALUES (p_userid, p_profilepictureurl, p_websiteurl, p_dateofbirth, p_ispremium);
    COMMIT;
END insert_userprofile;
/


CREATE OR REPLACE PROCEDURE CREATE_POST (
    p_content IN VARCHAR2,
    p_user_id IN NUMBER
) IS
    v_post_id NUMBER;
BEGIN
    -- First insert the post with all fields set to 0
    INSERT INTO post(
        content, 
        userid, 
        postdate, 
        likescount, 
        commentscount, 
        engagementrate
    ) VALUES (
        p_content, 
        p_user_id, 
        SYSDATE, 
        0, 
        0, 
        0
    )
    RETURNING postid INTO v_post_id;
    
    -- Double-check and ensure engagement rate is 0
    UPDATE post
    SET engagementrate = 0
    WHERE postid = v_post_id;
    
    COMMIT;
END CREATE_POST;
/


 
 CREATE OR REPLACE PROCEDURE update_user_profile (
    p_userid IN NUMBER,
    p_username IN VARCHAR2,
    p_email IN VARCHAR2,
    p_bio IN VARCHAR2,
    p_location IN VARCHAR2,
    p_profilepictureurl IN VARCHAR2,
    p_websiteurl IN VARCHAR2,
    p_dateofbirth IN DATE,
    p_ispremium IN NUMBER
)
AS
    v_user_exists NUMBER;
    v_profile_exists NUMBER;
BEGIN
    -- Check if the user exists
    SELECT COUNT(*) INTO v_user_exists
    FROM USERS
    WHERE USERID = p_userid;

    IF v_user_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'User not found');
    END IF;

    -- Update USERS table
    UPDATE USERS
    SET 
        USERNAME = NVL(p_username, USERNAME),
        EMAIL = NVL(p_email, EMAIL),
        BIO = NVL(p_bio, BIO),
        LOCATION = NVL(p_location, LOCATION)
    WHERE USERID = p_userid;

    -- Check if profile exists
    SELECT COUNT(*) INTO v_profile_exists
    FROM USERPROFILE
    WHERE USERID = p_userid;

    IF v_profile_exists = 0 THEN
        -- Insert if profile does not exist
        INSERT INTO USERPROFILE (
            USERID, PROFILEPICTUREURL, WEBSITEURL, DATEOFBIRTH, ISPREMIUM
        ) VALUES (
            p_userid, p_profilepictureurl, p_websiteurl, p_dateofbirth, p_ispremium
        );
    ELSE
        -- Update USERPROFILE table
        UPDATE USERPROFILE
        SET 
            PROFILEPICTUREURL = NVL(p_profilepictureurl, PROFILEPICTUREURL),
            WEBSITEURL = NVL(p_websiteurl, WEBSITEURL),
            DATEOFBIRTH = NVL(p_dateofbirth, DATEOFBIRTH),
            ISPREMIUM = NVL(p_ispremium, ISPREMIUM)
        WHERE USERID = p_userid;
    END IF;

    COMMIT;
END update_user_profile;
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


CREATE OR REPLACE PROCEDURE add_comment(
    p_postid IN NUMBER,
    p_userid IN NUMBER,
    p_commenttext IN VARCHAR2
)
AS
BEGIN
    INSERT INTO PostComment (
        PostID,
        UserID,
        CommentText,
        CommentDate
    ) VALUES (
        p_postid,
        p_userid,
        p_commenttext,
        SYSTIMESTAMP
    );

    COMMIT;
END add_comment;
/
CREATE OR REPLACE PROCEDURE get_feed_posts(
    p_result OUT SYS_REFCURSOR
)
IS
BEGIN
    OPEN p_result FOR
    SELECT 
        p.PostID,
        p.UserID,
        p.Content,
        p.PostDate,
        p.LikesCount,
        p.CommentsCount,
        u.Username,
        calculatePostPopularity(p.PostID) AS popularity_score,
        calculateUserEngagement(p.UserID) AS engagement_score
    FROM Post p
    JOIN Users u ON p.UserID = u.UserID
    ORDER BY popularity_score DESC, engagement_score DESC;
END get_feed_posts;
/
-- CREATE SEQUENCE postcomment_seq START WITH 1 INCREMENT BY 1;


 