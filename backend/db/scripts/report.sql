-- Procedure to get most active users based on post count
CREATE OR REPLACE PROCEDURE Get_Top_Posting_Users IS
    CURSOR top_users IS
        SELECT Username, COUNT(*) AS PostCount
        FROM Users U JOIN Post P ON U.UserID = P.UserID
        GROUP BY Username
        ORDER BY PostCount DESC FETCH FIRST 5 ROWS ONLY;
    
    v_username Users.Username%TYPE;
    v_count NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('Top 5 Most Active Users (by Posts):');
    DBMS_OUTPUT.PUT_LINE('------------------------------------');
    
    OPEN top_users;
    LOOP
        FETCH top_users INTO v_username, v_count;
        EXIT WHEN top_users%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(v_username || ' - ' || v_count || ' posts');
    END LOOP;
    CLOSE top_users;
END;
/

-- Procedure to show average likes per post
CREATE OR REPLACE PROCEDURE Avg_Likes_Per_Post IS
    v_avg_likes NUMBER;
BEGIN
    SELECT AVG(LikesCount) INTO v_avg_likes FROM Post;
    DBMS_OUTPUT.PUT_LINE('Average Likes per Post: ' || ROUND(v_avg_likes, 2));
END;
/

-- Procedure to generate daily post count
CREATE OR REPLACE PROCEDURE Daily_Post_Count_Report IS
    CURSOR daily_stats IS
        SELECT TRUNC(PostDate) AS Day, COUNT(*) AS TotalPosts
        FROM Post
        GROUP BY TRUNC(PostDate)
        ORDER BY Day DESC;

    v_day DATE;
    v_total NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('Date       | Total Posts');
    DBMS_OUTPUT.PUT_LINE('-------------------------');

    OPEN daily_stats;
    LOOP
        FETCH daily_stats INTO v_day, v_total;
        EXIT WHEN daily_stats%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(TO_CHAR(v_day, 'YYYY-MM-DD') || ' | ' || v_total);
    END LOOP;
    CLOSE daily_stats;
END;
/
