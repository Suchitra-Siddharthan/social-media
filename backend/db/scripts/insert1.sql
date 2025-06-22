/* INSERT INTO Post (UserID, Content, PostDate)
VALUES (1, 'Learning SQL is fun! Excited to build my first database project.', SYSTIMESTAMP);

INSERT INTO Post (UserID, Content, PostDate)
VALUES (2, 'Just started a new AI course. Looking forward to learning more!', SYSTIMESTAMP);

INSERT INTO Post (UserID, Content, PostDate)
VALUES (3, 'Exploring new ways to improve user experience on websites.', SYSTIMESTAMP);
INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium)
VALUES (1, 'https://pics.com/john_doe.jpg', 'https://johnsportfolio.com', TO_DATE('1990-10-12', 'YYYY-MM-DD'), 0);

INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium)
VALUES (2, 'https://pics.com/emma_98.jpg', 'https://emma.marketing', TO_DATE('1998-05-22', 'YYYY-MM-DD'), 1);

INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium)
VALUES (3, 'https://pics.com/emma_profile.jpg', 'https://emma.portfolio', TO_DATE('1992-09-14', 'YYYY-MM-DD'), 0);
SELECT * FROM Users;
SELECT * FROM Post;
SELECT * FROM UserProfile;
 */
 -- Insert for john_doe (USERID = 32)
/* INSERT INTO Post (UserID, Content, PostDate) 
VALUES (32, 'Excited to start working on AI projects!', SYSTIMESTAMP);

-- Insert for emma_98 (USERID = 34)
INSERT INTO Post (UserID, Content, PostDate) 
VALUES (34, 'Digital marketing strategies are evolving rapidly. Excited to learn more!', SYSTIMESTAMP);
-- Insert for john_doe (USERID = 32)
INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium)
VALUES (32, 'https://pics.com/john_doe_profile.jpg', 'https://johnsportfolio.com', TO_DATE('1990-10-12', 'YYYY-MM-DD'), 0);

-- Insert for emma_98 (USERID = 34)
INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium)
VALUES (34, 'https://pics.com/emma_98_profile.jpg', 'https://emma.marketing', TO_DATE('1998-05-22', 'YYYY-MM-DD'), 1); */

 /* SELECT * FROM Users;
 SELECT * FROM Post;
 SELECT * FROM UserProfile; */


 /* INSERT INTO Users (Username, Email, Password, Bio, Location) 
VALUES ('john_doe', 'john@example.com', 'hashed_password_123', 'Digital artist from NYC', 'New York');

INSERT INTO Users (Username, Email, Password, Bio, Location) 
VALUES ('jane_smith', 'jane@example.com', 'hashed_password_456', 'Travel blogger', 'London');

INSERT INTO Users (Username, Email, Password, Bio, Location) 
VALUES ('mike_jones', 'mike@example.com', 'hashed_password_789', 'Fitness enthusiast', 'Los Angeles');

INSERT INTO Users (Username, Email, Password, Bio, Location) 
VALUES ('sarah_wilson', 'sarah@example.com', 'hashed_password_101', 'Food critic', 'Paris');

INSERT INTO Users (Username, Email, Password, Bio, Location) 
VALUES ('alex_chen', 'alex@example.com', 'hashed_password_202', 'Tech entrepreneur', 'Tokyo'); */

 /* INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium) 
VALUES (1, 'https://example.com/profiles/john.jpg', 'john-doe-art.com', TO_DATE('1990-05-15', 'YYYY-MM-DD'), 1);

INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium) 
VALUES (2, 'https://example.com/profiles/jane.jpg', 'janes-travels.com', TO_DATE('1985-08-22', 'YYYY-MM-DD'), 0);

INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium) 
VALUES (3, 'https://example.com/profiles/mike.jpg', 'fit-with-mike.com', TO_DATE('1992-03-10', 'YYYY-MM-DD'), 1);

INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium) 
VALUES (4, 'https://example.com/profiles/sarah.jpg', 'sarahs-food-journey.com', TO_DATE('1988-11-05', 'YYYY-MM-DD'), 0);

INSERT INTO UserProfile (UserID, ProfilePictureURL, WebsiteURL, DateOfBirth, IsPremium) 
VALUES (5, 'https://example.com/profiles/alex.jpg', 'alex-tech-ventures.com', TO_DATE('1982-07-30', 'YYYY-MM-DD'), 1);
 */
 

 /* INSERT INTO Post (UserID, Content) 
VALUES (1, 'Just finished my latest digital painting! #art');

INSERT INTO Post (UserID, Content) 
VALUES (2, 'Beautiful sunset in Santorini today! #travel');

INSERT INTO Post (UserID, Content) 
VALUES (3, 'New personal record at the gym today! #fitness');

INSERT INTO Post (UserID, Content) 
VALUES (4, 'Amazing pasta at this little Italian place! #foodie');

INSERT INTO Post (UserID, Content) 
VALUES (5, 'Launching our new app next week! #tech');  */

INSERT INTO PostLike (PostID, UserID) 
VALUES (1, 2);

INSERT INTO PostLike (PostID, UserID) 
VALUES (3, 4);

INSERT INTO PostLike (PostID, UserID) 
VALUES (5, 1);

INSERT INTO PostLike (PostID, UserID) 
VALUES (3, 3);

INSERT INTO PostLike (PostID, UserID) 
VALUES (2, 4); 


INSERT INTO PostComment (PostID, UserID, CommentText) 
VALUES (4, 2, 'This is amazing work!');

INSERT INTO PostComment (PostID, UserID, CommentText) 
VALUES (5, 4, 'What software did you use?');

INSERT INTO PostComment (PostID, UserID, CommentText) 
VALUES (2, 3, 'Wish I was there!');

INSERT INTO PostComment (PostID, UserID, CommentText) 
VALUES (3, 2, 'Keep up the good work!'); 

INSERT INTO PostComment (PostID, UserID, CommentText) 
VALUES (4, 3, 'Looking forward to trying it!'); 



 INSERT INTO Users (Username, Email, Password, DateJoined)
    VALUES ('john', 'john1@example.com', 'password', SYSDATE);


