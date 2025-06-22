-- SELECT COUNT(*) FROM Users;
ALTER TABLE PostLike
ADD CONSTRAINT uniq_user_post UNIQUE (PostID, UserID);
