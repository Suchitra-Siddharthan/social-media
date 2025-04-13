-- --------------------------------------
-- 1. Create Backup Tables
-- --------------------------------------

CREATE TABLE Users_Backup AS SELECT * FROM Users WHERE 1=0;
CREATE TABLE UserProfile_Backup AS SELECT * FROM UserProfile WHERE 1=0;
CREATE TABLE Post_Backup AS SELECT * FROM Post WHERE 1=0;
CREATE TABLE Comment_Backup AS SELECT * FROM Comment WHERE 1=0;
CREATE TABLE PostLike_Backup AS SELECT * FROM PostLike WHERE 1=0;
CREATE TABLE Hashtag_Backup AS SELECT * FROM Hashtag WHERE 1=0;
CREATE TABLE PostHashtag_Backup AS SELECT * FROM PostHashtag WHERE 1=0;
CREATE TABLE Notification_Backup AS SELECT * FROM Notification WHERE 1=0;

-- --------------------------------------
-- 2. Create Procedure to Backup Data
-- --------------------------------------

CREATE OR REPLACE PROCEDURE Backup_All_Tables IS
BEGIN
    INSERT INTO Users_Backup SELECT * FROM Users;
    INSERT INTO UserProfile_Backup SELECT * FROM UserProfile;
    INSERT INTO Post_Backup SELECT * FROM Post;
    INSERT INTO Comment_Backup SELECT * FROM Comment;
    INSERT INTO PostLike_Backup SELECT * FROM PostLike;
    INSERT INTO Hashtag_Backup SELECT * FROM Hashtag;
    INSERT INTO PostHashtag_Backup SELECT * FROM PostHashtag;
    INSERT INTO Notification_Backup SELECT * FROM Notification;

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('✅ Backup completed for all tables.');
END;
/
