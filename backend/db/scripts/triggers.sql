-- Trigger to Update Post Statistics After Inserting a New Post
CREATE OR REPLACE TRIGGER trg_post_insert
AFTER INSERT ON Post
FOR EACH ROW
BEGIN
    -- Update Post Count for the User (Derived Attribute)
    UPDATE Users
    SET TotalPosts = TotalPosts + 1
    WHERE UserID = :NEW.UserID;

    -- Initialize Likes, Comments, and Shares Count
    UPDATE Post
    SET LikesCount = 0, CommentsCount = 0, SharesCount = 0
    WHERE PostID = :NEW.PostID;
END;
/

-- Trigger to Update Post Statistics After Updating Likes Count
CREATE OR REPLACE TRIGGER trg_post_like_update
AFTER UPDATE OF LikesCount ON Post
FOR EACH ROW
BEGIN
    -- Recalculate the Engagement Score (Derived Attribute)
    DECLARE
        v_engagementScore NUMBER;
    BEGIN
        -- Recalculate Engagement Score for the User
        SELECT (COUNT(*) * 0.5) + (:NEW.LikesCount * 0.3) + (:NEW.CommentsCount * 0.2) 
        INTO v_engagementScore
        FROM Post
        WHERE UserID = :NEW.UserID;

        -- Update the User's Engagement Score
        UPDATE Users
        SET EngagementScore = v_engagementScore
        WHERE UserID = :NEW.UserID;
    END;
END;
/

-- Trigger to Update Post Statistics After Inserting a New Like
CREATE OR REPLACE TRIGGER trg_post_like_insert
AFTER INSERT ON PostLike
FOR EACH ROW
BEGIN
    -- Update Likes Count for the Post
    UPDATE Post
    SET LikesCount = LikesCount + 1
    WHERE PostID = :NEW.PostID;

    -- Update User Engagement Score (Derived Attribute)
    DECLARE
        v_engagementScore NUMBER;
    BEGIN
        SELECT (COUNT(*) * 0.5) + (LikesCount * 0.3) + (CommentsCount * 0.2)
        INTO v_engagementScore
        FROM Post
        WHERE UserID = :NEW.UserID;

        UPDATE Users
        SET EngagementScore = v_engagementScore
        WHERE UserID = :NEW.UserID;
    END;
END;
/

-- Trigger to Update Post Statistics After Inserting a New Comment
CREATE OR REPLACE TRIGGER trg_post_comment_insert
AFTER INSERT ON Comment
FOR EACH ROW
BEGIN
    -- Update Comments Count for the Post
    UPDATE Post
    SET CommentsCount = CommentsCount + 1
    WHERE PostID = :NEW.PostID;

    -- Update User Engagement Score (Derived Attribute)
    DECLARE
        v_engagementScore NUMBER;
    BEGIN
        SELECT (COUNT(*) * 0.5) + (LikesCount * 0.3) + (CommentsCount * 0.2)
        INTO v_engagementScore
        FROM Post
        WHERE UserID = :NEW.UserID;

        UPDATE Users
        SET EngagementScore = v_engagementScore
        WHERE UserID = :NEW.UserID;
    END;
END;
/

-- Trigger to Automatically Create a Follow Relationship Between Users
CREATE OR REPLACE TRIGGER trg_follow_insert
AFTER INSERT ON Follows
FOR EACH ROW
BEGIN
    -- Insert a New Notification for the Follow Action
    INSERT INTO Notification (UserID, NotificationText, NotificationDate)
    VALUES (
        :NEW.FollowedUserID,
        'You have a new follower!',
        CURRENT_TIMESTAMP
    );
END;
/

-- Trigger to Delete Follows When a User is Deleted
CREATE OR REPLACE TRIGGER trg_follow_delete
AFTER DELETE ON Users
FOR EACH ROW
BEGIN
    -- Delete all Follow Relationships Related to the Deleted User
    DELETE FROM Follows WHERE FollowerUserID = :OLD.UserID OR FollowedUserID = :OLD.UserID;
END;
/

-- Trigger to Update Post Shares Count After a Share
CREATE OR REPLACE TRIGGER trg_post_share_insert
AFTER INSERT ON PostShare
FOR EACH ROW
BEGIN
    -- Update the Shares Count for the Post
    UPDATE Post
    SET SharesCount = SharesCount + 1
    WHERE PostID = :NEW.PostID;
END;
/

-- Trigger to Check if User has Reached Maximum Follow Limit
CREATE OR REPLACE TRIGGER trg_check_follow_limit
BEFORE INSERT ON Follows
FOR EACH ROW
DECLARE
    v_followCount NUMBER;
BEGIN
    -- Check the number of followers for the user before inserting a new follow
    SELECT COUNT(*) INTO v_followCount
    FROM Follows
    WHERE FollowerUserID = :NEW.FollowerUserID;

    -- Limit the number of follows to 100 for each user
    IF v_followCount >= 100 THEN
        RAISE_APPLICATION_ERROR(-20001, 'A user can follow only up to 100 other users');
    END IF;
END;
/

-- Trigger to Update Post Hashtags After Inserting a New PostHashtag
CREATE OR REPLACE TRIGGER trg_posthashtag_insert
AFTER INSERT ON PostHashtag
FOR EACH ROW
BEGIN
    -- Update Hashtag Usage Count (Aggregate Function)
    DECLARE
        v_hashtagCount NUMBER;
    BEGIN
        -- Get the count of posts using this hashtag
        SELECT COUNT(*) INTO v_hashtagCount
        FROM PostHashtag
        WHERE HashtagID = :NEW.HashtagID;

        -- Update the hashtag table with the count of posts
        UPDATE Hashtag
        SET PostCount = v_hashtagCount
        WHERE HashtagID = :NEW.HashtagID;
    END;
END;
/
