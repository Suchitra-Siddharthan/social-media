-- /-- Create Backup Tables with BackupTimestamp
CREATE TABLE Users_Backup (
    UserID NUMBER,
    Username VARCHAR2(50),
    Email VARCHAR2(100),
    Password VARCHAR2(100),
    DateJoined DATE,
    Bio VARCHAR2(100),
    Location VARCHAR2(100),
    PopularityScore NUMBER DEFAULT 0,
    BackupTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, BackupTimestamp)
);

CREATE TABLE UserProfile_Backup (
    UserID NUMBER,
    ProfilePictureURL VARCHAR2(255),
    WebsiteURL VARCHAR2(255),
    DateOfBirth DATE,
    IsPremium NUMBER(1) DEFAULT 0,
    BackupTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, BackupTimestamp)
); 

CREATE TABLE Post_Backup (
    PostID NUMBER,
    UserID NUMBER,
    Content VARCHAR2(100),
    PostDate TIMESTAMP,
    LikesCount NUMBER DEFAULT 0,
    CommentsCount NUMBER DEFAULT 0,
    EngagementRate NUMBER DEFAULT 0,
    BackupTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (PostID, BackupTimestamp)
);

 CREATE TABLE PostLike_Backup (
    LikeID NUMBER,
    PostID NUMBER,
    UserID NUMBER,
    LikeDate TIMESTAMP,
    BackupTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (LikeID, BackupTimestamp)
);

CREATE TABLE PostComment_Backup (
    CommentID NUMBER,
    PostID NUMBER,
    UserID NUMBER,
    CommentText VARCHAR2(100),
    CommentDate TIMESTAMP,
    BackupTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (CommentID, BackupTimestamp)
);

CREATE TABLE Notification_Backup (
    NotificationID NUMBER,
    UserID NUMBER NOT NULL,
    PostID NUMBER,
    NotificationText VARCHAR2(100),
    NotificationDate TIMESTAMP,
    IsRead NUMBER(1) DEFAULT 0,
    BackupTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (NotificationID, BackupTimestamp)
);
 
-- Backup Procedure
CREATE OR REPLACE PROCEDURE Backup_All_Tables IS
BEGIN
    -- Backup Users
    INSERT INTO Users_Backup (UserID, Username, Email, Password, DateJoined, Bio, Location, PopularityScore)
    SELECT UserID, Username, Email, Password, DateJoined, Bio, Location, PopularityScore FROM Users;

    -- Backup UserProfile
    INSERT INTO UserProfile_Backup (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium)
    SELECT UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium FROM UserProfile;

    -- Backup Post
    INSERT INTO Post_Backup (PostID, UserID, Content, PostDate, LikesCount, CommentsCount, EngagementRate)
    SELECT PostID, UserID, Content, PostDate, LikesCount, CommentsCount, EngagementRate FROM Post;

    -- Backup PostLike
    INSERT INTO PostLike_Backup (LikeID, PostID, UserID, LikeDate)
    SELECT LikeID, PostID, UserID, LikeDate FROM PostLike;

    -- Backup PostComment
    INSERT INTO PostComment_Backup (CommentID, PostID, UserID, CommentText, CommentDate)
    SELECT CommentID, PostID, UserID, CommentText, CommentDate FROM PostComment;

    -- Backup Notification
    INSERT INTO Notification_Backup (NotificationID, UserID, PostID, NotificationText, NotificationDate, IsRead)
    SELECT NotificationID, UserID, PostID, NotificationText, NotificationDate, IsRead FROM Notification;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('✅ Backup completed for all tables.');
END;
/

show errors;

