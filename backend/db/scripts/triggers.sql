CREATE OR REPLACE TRIGGER trg_increment_likes
AFTER INSERT ON PostLike
FOR EACH ROW
BEGIN
    UPDATE Post
    SET LikesCount = LikesCount + 1
    WHERE PostID = :NEW.PostID;
END;
/



CREATE OR REPLACE TRIGGER trg_increment_comments
AFTER INSERT ON PostComment
FOR EACH ROW
BEGIN
    UPDATE Post
    SET CommentsCount = CommentsCount + 1
    WHERE PostID = :NEW.PostID;
END;
/

CREATE OR REPLACE TRIGGER trg_like_update
FOR INSERT OR DELETE ON PostLike
COMPOUND TRIGGER
    v_userID Users.UserID%TYPE;
    v_likesDelta NUMBER := 0;
    v_postID Post.PostID%TYPE;
    v_postDate TIMESTAMP;
    v_likesCount NUMBER;
    v_commentsCount NUMBER;
    v_postCount NUMBER;
    v_totalLikes NUMBER;
    v_totalComments NUMBER;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            v_likesDelta := 1;
            v_postID := :NEW.PostID;
            SELECT UserID, PostDate, LikesCount, CommentsCount 
            INTO v_userID, v_postDate, v_likesCount, v_commentsCount 
            FROM Post 
            WHERE PostID = v_postID;
        ELSIF DELETING THEN
            v_likesDelta := -1;
            v_postID := :OLD.PostID;
            SELECT UserID, PostDate, LikesCount, CommentsCount 
            INTO v_userID, v_postDate, v_likesCount, v_commentsCount 
            FROM Post 
            WHERE PostID = v_postID;
        END IF;

        -- Update LikesCount in Post table
        UPDATE Post 
        SET LikesCount = v_likesCount + v_likesDelta 
        WHERE PostID = v_postID;

        -- Update EngagementRate in Post table
        UPDATE Post
        SET EngagementRate = ((v_likesCount + v_likesDelta) * 0.6) + (v_commentsCount * 0.4)
        WHERE PostID = v_postID;

        -- Get total posts, likes and comments for the user
        SELECT COUNT(*), NVL(SUM(LikesCount), 0), NVL(SUM(CommentsCount), 0)
        INTO v_postCount, v_totalLikes, v_totalComments
        FROM Post 
        WHERE UserID = v_userID;

        -- Update user's PopularityScore
        UPDATE Users
        SET PopularityScore = (v_postCount * 0.5) + (v_totalLikes * 0.3) + (v_totalComments * 0.2)
        WHERE UserID = v_userID;
    END AFTER EACH ROW;
END trg_like_update;
/

-- Create compound trigger for comments
CREATE OR REPLACE TRIGGER trg_comment_update
FOR INSERT OR DELETE ON PostComment
COMPOUND TRIGGER
    v_userID Users.UserID%TYPE;
    v_commentsDelta NUMBER := 0;
    v_postID Post.PostID%TYPE;
    v_postDate TIMESTAMP;
    v_likesCount NUMBER;
    v_commentsCount NUMBER;
    v_postCount NUMBER;
    v_totalLikes NUMBER;
    v_totalComments NUMBER;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            v_commentsDelta := 1;
            v_postID := :NEW.PostID;
            SELECT UserID, PostDate, LikesCount, CommentsCount 
            INTO v_userID, v_postDate, v_likesCount, v_commentsCount 
            FROM Post 
            WHERE PostID = v_postID;
        ELSIF DELETING THEN
            v_commentsDelta := -1;
            v_postID := :OLD.PostID;
            SELECT UserID, PostDate, LikesCount, CommentsCount 
            INTO v_userID, v_postDate, v_likesCount, v_commentsCount 
            FROM Post 
            WHERE PostID = v_postID;
        END IF;

        -- Update CommentsCount in Post table
        UPDATE Post 
        SET CommentsCount = v_commentsCount + v_commentsDelta 
        WHERE PostID = v_postID;

        -- Update EngagementRate in Post table
        UPDATE Post
        SET EngagementRate = (v_likesCount * 0.6) + ((v_commentsCount + v_commentsDelta) * 0.4)
        WHERE PostID = v_postID;

        -- Get total posts, likes and comments for the user
        SELECT COUNT(*), NVL(SUM(LikesCount), 0), NVL(SUM(CommentsCount), 0)
        INTO v_postCount, v_totalLikes, v_totalComments
        FROM Post 
        WHERE UserID = v_userID;

        -- Update user's PopularityScore
        UPDATE Users
        SET PopularityScore = (v_postCount * 0.5) + (v_totalLikes * 0.3) + (v_totalComments * 0.2)
        WHERE UserID = v_userID;
    END AFTER EACH ROW;
END trg_comment_update;
/

CREATE OR REPLACE TRIGGER tr_notification_on_like
AFTER INSERT ON PostLike
FOR EACH ROW
DECLARE
    v_notification_text VARCHAR2(100);
    v_post_owner_id NUMBER;
    v_username VARCHAR2(50);
BEGIN
    -- Get post owner and username of the liking user
    SELECT p.userid, u.username
    INTO v_post_owner_id, v_username
    FROM post p
    JOIN users u ON :new.userid = u.userid
    WHERE p.postid = :new.postid;
    
    -- Skip if user is liking their own post
    IF v_post_owner_id = :new.userid THEN
        RETURN;
    END IF;
    
    -- Create notification message
    v_notification_text := v_username || ' liked your post';
    
    -- Insert notification
    INSERT INTO Notification (
        userid,
        postid,
        notificationtext,
        notificationdate,
        isread
    ) VALUES (
        v_post_owner_id,
        :new.postid,
        v_notification_text,
        SYSTIMESTAMP,
        0
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error creating like notification: ' || SQLERRM);
END;
/
 

 CREATE OR REPLACE TRIGGER tr_notification_on_comment
AFTER INSERT ON PostComment
FOR EACH ROW
DECLARE
    v_notification_text VARCHAR2(100);
    v_post_owner_id NUMBER;
    v_username VARCHAR2(50);
BEGIN
    -- Get post owner and username of the commenting user
    SELECT p.userid, u.username
    INTO v_post_owner_id, v_username
    FROM post p
    JOIN users u ON :new.userid = u.userid
    WHERE p.postid = :new.postid;
    
    -- Skip if user is commenting on their own post
    IF v_post_owner_id = :new.userid THEN
        RETURN;
    END IF;
    
    -- Create notification message
    v_notification_text := v_username || ' commented: ' || 
                         SUBSTR(:new.commenttext, 1, 50);
    
    -- Insert notification
    INSERT INTO Notification (
        userid,
        postid,
        notificationtext,
        notificationdate,
        isread
    ) VALUES (
        v_post_owner_id,
        :new.postid,
        v_notification_text,
        SYSTIMESTAMP,
        0
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error creating comment notification: ' || SQLERRM);
END;
/

 


