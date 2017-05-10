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
CREATE FUNCTION `areFriends`
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
    ) INTO @ret_val;

    RETURN @ret_val;

  END ~
DELIMITER ;


/*
  Returns TRUE if two users have a pending friend request.
    (Returns FALSE if first_user = second_user)
 */
DELIMITER ~
CREATE FUNCTION `pendingFriendRequest`
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
        FROM `friend_requests`
        WHERE `friend_requests`.`first_user` = first_user
              and `friend_requests`.`second_user` = second_user
    ) INTO @ret_val;

    RETURN @ret_val;

  END ~
DELIMITER ;
