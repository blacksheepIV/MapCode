-- SPLIT_STR MySQL Function
-- from http://blog.fedecarg.com/2009/02/22/mysql-split-string-function/

CREATE FUNCTION SPLIT_STR(
  x TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,
  delim VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,
  pos INT
)
RETURNS TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci
RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(x, delim, pos),
    CHAR_LENGTH(SUBSTRING_INDEX(x, delim, pos -1)) + 1),
    delim, '');

/*
Example:
SELECT SPLIT_STR('a|bb|ccc|dd', '|', 3) as third;
+-------+
| third |
+-------+
| ccc   |
+-------+
*/


/*
  Returns TRUE if two users are friends and FALSE otherwise.
    (Returns FALSE if first_user = second_user)
 */
DELIMITER ~
CREATE FUNCTION `areFriends_ForUpdate`
  (
    first_user MEDIUMINT UNSIGNED,
    second_user MEDIUMINT UNSIGNED
  )
  RETURNS INTEGER
  BEGIN
    IF second_user < first_user
    THEN
      SET @tmp = first_user;
      SET first_user = second_user;
      SET second_user = @tmp;
    END IF;

    SELECT EXISTS(
        SELECT *
        FROM `friends`
        WHERE `friends`.`first_user` = first_user
              and `friends`.`second_user` = second_user
        FOR UPDATE
    ) INTO @ret_val;

    RETURN @ret_val;

  END ~
DELIMITER ;

/*
  Returns TRUE if two users are friends and FALSE otherwise.
    (Returns FALSE if first_user = second_user)
 */
DELIMITER ~
CREATE FUNCTION `areFriends_LockInShareMode`
  (
    first_user MEDIUMINT UNSIGNED,
    second_user MEDIUMINT UNSIGNED
  )
  RETURNS INTEGER
  BEGIN
    IF second_user < first_user
    THEN
      SET @tmp = first_user;
      SET first_user = second_user;
      SET second_user = @tmp;
    END IF;

    SELECT EXISTS(
        SELECT *
        FROM `friends`
        WHERE `friends`.`first_user` = first_user
              and `friends`.`second_user` = second_user
        LOCK IN SHARE MODE
    ) INTO @ret_val;

    RETURN @ret_val;

  END ~
DELIMITER ;


/*
  Returns TRUE if two users have a pending friend request.
    (Returns FALSE if first_user = second_user)
 */
DELIMITER ~
CREATE FUNCTION `pendingFriendRequest_ForUpdate`
  (
    first_user MEDIUMINT UNSIGNED,
    second_user MEDIUMINT UNSIGNED
  )
  RETURNS BOOLEAN
  BEGIN
    IF second_user < first_user
    THEN
      SET @tmp = first_user;
      SET first_user = second_user;
      SET second_user = @tmp;
    END IF;

    SELECT EXISTS(
        SELECT *
        FROM `friend_requests`
        WHERE `friend_requests`.`first_user` = first_user
              and `friend_requests`.`second_user` = second_user
        FOR UPDATE
    ) INTO @ret_val;

    RETURN @ret_val;

  END ~
DELIMITER ;

/*
  Returns the requester's id from a pending friend request.

  Returns NULL if there is no such a pending request.
 */
DELIMITER ~
CREATE FUNCTION `getFriendRequester_ForUpdate`
  (
    first_user MEDIUMINT UNSIGNED,
    second_user MEDIUMINT UNSIGNED
  )
  RETURNS MEDIUMINT UNSIGNED
  BEGIN
    IF second_user < first_user
    THEN
      SET @tmp = first_user;
      SET first_user = second_user;
      SET second_user = @tmp;
    END IF;

    SELECT `friend_requests`.`requester`
    INTO @ret_val
    FROM `friend_requests`
    WHERE `friend_requests`.`first_user` = first_user
          and `friend_requests`.`second_user` = second_user
    FOR UPDATE;

    RETURN @ret_val;

  END ~
DELIMITER ;


/*
  Returns user's friends count.

  Returns 0 if user does not exists.
 */
DELIMITER ~
CREATE FUNCTION `friendsCount_ForUpdate`
  (
    user_id MEDIUMINT UNSIGNED
  )
  RETURNS SMALLINT UNSIGNED
  BEGIN

    RETURN (
      SELECT COUNT(*)
      FROM `friends`
      WHERE first_user = user_id OR
            second_user = user_id
      FOR UPDATE
    );

  END ~
DELIMITER ;

/*
  Returns user's friend requests count.

  Returns 0 if user does not exists.
 */
DELIMITER ~
CREATE FUNCTION `friendRequestsCount_ForUpdate`
  (
    user_id MEDIUMINT UNSIGNED
  )
  RETURNS SMALLINT UNSIGNED
  BEGIN

    RETURN (
      SELECT COUNT(*)
      FROM `friend_requests`
      WHERE first_user = user_id OR
            second_user = user_id
      FOR UPDATE
    );

  END ~
DELIMITER ;
