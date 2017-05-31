DELIMITER ~
CREATE PROCEDURE `addPointTags`
  (
    IN `point_id` INT UNSIGNED,
    IN `tags`     TEXT CHARACTER SET utf8mb4
                  COLLATE utf8mb4_persian_ci
  )
    PROC: BEGIN

    DECLARE tag VARCHAR(40)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_persian_ci;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

    SET tags = REPLACE(tags, '\n', '');
    SET tags = REPLACE(tags, '\t', '');
    SET tags = TRIM(tags);

    IF tags IS NULL OR tags = ''
    THEN
      LEAVE PROC;
    END IF;

    SET tags = LOWER(tags);

    SET @i = 1;
    SET @tags_count = LENGTH(tags) - LENGTH(REPLACE(tags, ' ', '')) + 1;
    TAG_LOOP: WHILE @i <= @tags_count
    DO
      SET tag = TRIM(SPLIT_STR(tags, ' ', @i));

      IF tag = ''
      THEN
        SET @i = @i + 1;
        ITERATE TAG_LOOP;
      END IF;

      INSERT IGNORE INTO `tags` (`tag`) VALUE (tag);
      SELECT `id`
      INTO @tag_id
      FROM `tags`
      WHERE `tags`.`tag` = tag;
      INSERT IGNORE INTO `point_tags` (`point_id`, `tag_id`) VALUE (point_id, @tag_id);

      SET @i = @i + 1;
    END WHILE;

  END~
DELIMITER ;


/*
 err:
     0 : Success
     2 : Owner not found
     3 : Not enough credit and bonus
     4 : Category not found
 */
DELIMITER ~
CREATE PROCEDURE `addPoint`
  (
    IN  `owner`           MEDIUMINT UNSIGNED,
    IN  `lat`             DECIMAL(10, 8),
    IN  `lng`             DECIMAL(11, 8),
    IN  `submission_date` TIMESTAMP,
    IN  `expiration_date` TIMESTAMP,
    IN  `name`            VARCHAR(30)
                          CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,
    IN  `phone`           VARCHAR(15),
    IN  `province`        VARCHAR(25)
                          CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,
    IN  `city`            VARCHAR(25)
                          CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,
    IN  `address`         TEXT CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,
    IN  `public`          BOOLEAN,
    IN  `category`        VARCHAR(30)
                          CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,
    IN  `description`     TEXT CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,
    IN  `tags`            TEXT CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,

    OUT `point_code`      VARCHAR(17),
    OUT `err`             TINYINT UNSIGNED
  )
    PROC: BEGIN
    DECLARE credit, bonus SMALLINT UNSIGNED;
    DECLARE category_id SMALLINT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      SET point_code = NULL;
      RESIGNAL;
    END;

    START TRANSACTION;
    SELECT SQL_CALC_FOUND_ROWS
      users.credit,
      users.bonus
    INTO credit, bonus
    FROM users
    WHERE id = owner
    FOR UPDATE;

    IF FOUND_ROWS() != 1
    THEN
      -- Owner not found
      SET err = 2;
      ROLLBACK;
      LEAVE PROC;
    END IF;

    IF credit + bonus = 0
    THEN
      -- Not enough credit and bonus
      SET err = 3;
      ROLLBACK;
      LEAVE PROC;
    END IF;

    SELECT SQL_CALC_FOUND_ROWS
      U.`id`,
      T.`code`,
      U.`code`
    INTO category_id, @first_code, @second_code
    FROM point_categories AS U
      JOIN point_categories AS T ON U.parent = T.id
    WHERE U.name = category
          AND U.`parent` IS NOT NULL
    LOCK IN SHARE MODE;

    IF FOUND_ROWS() != 1
    THEN
      -- category not found
      SET err = 4;
      ROLLBACK;
      LEAVE PROC;
    END IF;

    SELECT COUNT(*)
    INTO @cat_count
    FROM points
    WHERE points.category = category_id
    FOR UPDATE;

    SET @cat_count = @cat_count + 1;
    SET @cat_count = CAST(@cat_count AS CHAR(10));
    SET @cat_count = CONCAT(REPEAT('0', 9 - CHAR_LENGTH(@cat_count)), @cat_count);

    SET @first_code = CAST(@first_code AS CHAR(10));
    SET @first_code = CONCAT(REPEAT('0', 3 - CHAR_LENGTH(@first_code)), @first_code);

    SET @second_code = CAST(@second_code AS CHAR(10));
    SET @second_code = CONCAT(REPEAT('0', 3 - CHAR_LENGTH(@second_code)), @second_code);

    SET @code = CONCAT('mp', @first_code, @second_code, @cat_count);

    INSERT INTO points (
      points.lat,
      points.lng,
      points.submission_date,
      points.expiration_date,
      points.name,
      points.phone,
      points.province,
      points.city,
      points.address,
      points.public,
      points.category,
      points.owner,
      points.code,
      points.description
    ) VALUES (
      lat,
      lng,
      submission_date,
      expiration_date,
      name,
      phone,
      province,
      city,
      address,
      public,
      category_id,
      owner,
      @code,
      description
    );
    SET point_code = @code;
    SET @point_id = LAST_INSERT_ID();

    SET @column_name = 'credit';
    SET @column_value = credit;
    IF credit = 0
    THEN
      SET @column_name = 'bonus';
      SET @column_value = bonus;
    END IF;
    SET @column_value = @column_value - 1;
    SET @owner = owner;

    SET @query = CONCAT('UPDATE `users` SET `', @column_name, '` = ? WHERE `id` = ?');
    PREPARE decrease_credit_bonus_statement FROM @query;
    EXECUTE decrease_credit_bonus_statement
    USING @column_value, @owner;
    COMMIT;

    CALL addPointTags(@point_id, tags);

    DEALLOCATE PREPARE decrease_credit_bonus_statement;

    -- Success
    SET err = 0;
  END~
DELIMITER ;


/*
  Errors (sqlstate = 45000):
    - ARE_ALREADY_FRIENDS
    - ALREADY_REQUEST_PENDING
    - SELF_REQUEST
    - USERNAME_NOT_FOUND
 */
DELIMITER ~
CREATE PROCEDURE `friendRequest`
  (
    IN first_user  MEDIUMINT UNSIGNED,
    IN second_user_username VARCHAR(15)
  )
    PROC: BEGIN

    DECLARE second_user MEDIUMINT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

    START TRANSACTION;

    -- Fetch user's id from it's username
    SELECT SQL_CALC_FOUND_ROWS
      `users`.`id`
    INTO second_user
    FROM `users`
    WHERE `users`.`username` = second_user_username
    LOCK IN SHARE MODE;
    -- Check if there is any user with given username
    IF found_rows() != 1
    THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'USERNAME_NOT_FOUND';
    END IF;

    -- Check if these users are already friends
    IF areFriends_ForUpdate(first_user, second_user)
    THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ARE_ALREADY_FRIENDS';
    END IF;
    -- Check if there is already a pending friend request for these users
    IF pendingFriendRequest_ForUpdate(first_user, second_user)
    THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ALREADY_REQUEST_PENDING';
    END IF;

    INSERT INTO `friend_requests` (`first_user`, `second_user`, `requester`) VALUE (first_user, second_user, first_user);

    COMMIT;
  END ~
DELIMITER ;


/*
  Errors (sqlstate = 45000):
    - YOUR_NOT_REQUESTEE
    - NO_PENDING_REQUEST
    - USERNAME_NOT_FOUND
    - REQUESTEE_MAX_FRIENDS
    - REQUESTER_MAX_FRIENDS
 */
DELIMITER ~
CREATE PROCEDURE `acceptFriendRequest`
  (
    IN first_user           MEDIUMINT UNSIGNED,
    IN second_user_username VARCHAR(15),
    IN MAX_FRIENDS          SMALLINT UNSIGNED
  )
    PROC: BEGIN

    DECLARE second_user MEDIUMINT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

    START TRANSACTION;

    -- Fetch user's id from it's username
    SELECT SQL_CALC_FOUND_ROWS `users`.`id`
    INTO second_user
    FROM `users`
    WHERE `users`.`username` = second_user_username
    LOCK IN SHARE MODE;
    -- Check if there is any user with given username
    IF found_rows() != 1
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'USERNAME_NOT_FOUND';
    END IF;

    -- Check if there is a pending friend request for these users
    IF NOT pendingFriendRequest_ForUpdate(first_user, second_user)
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_PENDING_REQUEST';
    END IF;

    SET @requester = getFriendRequester_ForUpdate(first_user, second_user);
    -- Check if the first_user is the requestee
    IF first_user = @requester
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'YOUR_NOT_REQUESTEE';
    END IF;

    -- Check if requestee has not reached max friends limit
    IF friendsCount_ForUpdate(first_user) >= MAX_FRIENDS
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'REQUESTEE_MAX_FRIENDS';
    END IF;
    -- Check if requester has not reached max friends limit
    IF friendsCount_ForUpdate(second_user) >= MAX_FRIENDS
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'REQUESTER_MAX_FRIENDS';
    END IF;

    IF second_user < first_user
    THEN
      SET @tmp = first_user;
      SET first_user = second_user;
      SET second_user = @tmp;
    END IF;

    DELETE FROM `friend_requests`
    WHERE `friend_requests`.`first_user` = first_user AND
          `friend_requests`.`second_user` = second_user;

    INSERT INTO `friends` (`first_user`, `second_user`) VALUES (first_user, second_user);

    COMMIT;
  END ~
DELIMITER ;

/*
  Errors (sqlstate = 45000):
    - NO_PENDING_REQUEST
    - USERNAME_NOT_FOUND
 */
DELIMITER ~
CREATE PROCEDURE `cancelFriendRequest`
  (
    IN first_user           MEDIUMINT UNSIGNED,
    IN second_user_username VARCHAR(15)
  )
    PROC: BEGIN

    DECLARE second_user MEDIUMINT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

    START TRANSACTION;

    -- Fetch user's id from it's username
    SELECT SQL_CALC_FOUND_ROWS `users`.`id`
    INTO second_user
    FROM `users`
    WHERE `users`.`username` = second_user_username
    LOCK IN SHARE MODE;
    -- Check if there is any user with given username
    IF found_rows() != 1
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'USERNAME_NOT_FOUND';
    END IF;

    -- Check if there is a pending friend request for these users
    IF NOT pendingFriendRequest_ForUpdate(first_user, second_user)
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_PENDING_REQUEST';
    END IF;

    IF second_user < first_user
    THEN
      SET @tmp = first_user;
      SET first_user = second_user;
      SET second_user = @tmp;
    END IF;

    DELETE FROM `friend_requests`
    WHERE `friend_requests`.`first_user` = first_user AND
          `friend_requests`.`second_user` = second_user;

    COMMIT;
  END ~
DELIMITER ;


/*
  Errors (sqlstate = 45000):
    - SENDER_NOT_FOUND
    - RECEIVER_NOT_FOUND
    - POINT_NOT_FOUND
    - PERSONAL_POINT_NOT_FOUND

    (Caused by `enforce_message_point_or_personal_point`)
    - NO_POINT
    - BOTH_POINTS
    - SELF_MESSAGE
 */
DELIMITER ~
CREATE PROCEDURE `sendMessage`
  (
    IN sender           MEDIUMINT UNSIGNED,
    IN receiver_username VARCHAR(15),
    IN point_code  CHAR(17),
    IN personal_point BIGINT UNSIGNED,
    IN sent_time TIMESTAMP,
    IN message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,
    OUT message_id BIGINT UNSIGNED
  )
    PROC: BEGIN

    DECLARE receiver MEDIUMINT UNSIGNED;
    DECLARE point INT UNSIGNED;

    -- If sender does not exists
    DECLARE EXIT HANDLER FOR 1452
    BEGIN
        ROLLBACK;

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SENDER_NOT_FOUND';
    END;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

    START TRANSACTION;

    -- Fetch receiver's id from it's username
    SELECT SQL_CALC_FOUND_ROWS `users`.`id`
    INTO receiver
    FROM `users`
    WHERE `users`.`username` = receiver_username
    LOCK IN SHARE MODE;
    -- Check if there is any user with given username
    IF found_rows() != 1
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RECEIVER_NOT_FOUND';
    END IF;

    -- If user wants to send a main point
    IF point_code IS NOT NULL
    THEN
        -- Fetch points's id from it's code
        -- The point is either public or is owned by sender
        SELECT SQL_CALC_FOUND_ROWS `points`.`id`
        INTO point
        FROM `points`
        WHERE `points`.`code` = LOWER(point_code) AND
              (`points`.`owner` = sender OR `points`.public = TRUE)
        LOCK IN SHARE MODE;
        -- Check if there is any point with given code
        IF found_rows() != 1
        THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'POINT_NOT_FOUND';
        END IF;
    END IF;

    -- If user wants to send a personal point
    IF personal_point IS NOT NULL
    THEN
        -- Fetch personal points's owner from it's id
        SELECT SQL_CALC_FOUND_ROWS `personal_points`.`owner`
        INTO @personal_point_owner
        FROM `personal_points`
        WHERE `personal_points`.`id` = personal_point
        LOCK IN SHARE MODE;
        -- Check if there is any personal point with given id
        --     and if the the owner is the sender
        IF found_rows() != 1 OR @personal_point_owner != sender
        THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'PERSONAL_POINT_NOT_FOUND';
        END IF;
    END IF;

    INSERT INTO `messages` (messages.sender,
                            messages.receiver,
                            messages.point,
                            messages.personal_point,
                            messages.sent_time,
                            messages.message) VALUES (
      sender, receiver, point, personal_point, sent_time, message
    );

    SET message_id = LAST_INSERT_ID();

    COMMIT;
  END ~
DELIMITER ;


/*
    Errors (sqlstate = 45000):
      - USERNAME_%S_NOT_FRIEND
          (%S will replace with the username)
          (If username is the owner's username)
          (If username does not exists)
          (If username is not owner's friend)
 */
DELIMITER ~
CREATE PROCEDURE `addGroupMembers`
  (
    IN `owner`    INT UNSIGNED,
    IN `group_id` INT UNSIGNED,
    IN `members`  TEXT
  )
  PROC: BEGIN
    DECLARE member VARCHAR(15);
    DECLARE member_id MEDIUMINT UNSIGNED;

    SET members = TRIM(members);

    SET @i = 1;
    SET @members_count = LENGTH(members) - LENGTH(REPLACE(members, ' ', '')) + 1;

    /*
        Add members to the group
     */

    MEMBER_LOOP: WHILE @i <= @members_count
    DO
      SET member = TRIM(SPLIT_STR(members, ' ', @i));

      IF member = ''
      THEN
        SET @i = @i + 1;
        ITERATE MEMBER_LOOP;
      END IF;

      SELECT `users`.`id`
      INTO member_id
      FROM `users`
      WHERE `users`.`username` = member
      LOCK IN SHARE MODE;

      -- If no user with this username found
      IF FOUND_ROWS() = 0
      THEN
        SET @errmsg = CONCAT('USERNAME_', member, '_NOT_FRIEND');

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = @errmsg;
      END IF;

      -- If member and owner are not friends
      IF areFriends_LockInShareMode(owner, member_id) = FALSE
      THEN
        SET @errmsg = CONCAT('USERNAME_', member, '_NOT_FRIEND');

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = @errmsg;
      END IF;

      REPLACE INTO `group_members` (`group_members`.`group_id`, `group_members`.`member_id`)
      VALUES (group_id, member_id);

      SET @i = @i + 1;
    END WHILE;
  END ~
DELIMITER ;


/*
    Errors (sqlstate = 45000):
      - GROUP_ALREADY_EXISTS

      (Caused by `addGroupMembers`)
      - USERNAME_%S_NOT_FRIEND
          (%S will replace with the username)
          (If username is the owner's username)
          (If username does not exists)
          (If username is not owner's friend)
 */
DELIMITER ~
CREATE PROCEDURE `addGroup`
  (
    IN `owner`   INT UNSIGNED,
    IN `name`    VARCHAR(25)
                 CHARACTER SET utf8mb4
                 COLLATE utf8mb4_persian_ci,
    IN `members` TEXT
  )
    PROC: BEGIN

    DECLARE member VARCHAR(15);
    DECLARE member_id MEDIUMINT UNSIGNED;
    DECLARE group_id INT UNSIGNED;

    -- If the group is duplicate
    DECLARE EXIT HANDLER FOR 1062
    BEGIN
      ROLLBACK;

      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'GROUP_ALREADY_EXISTS';
    END;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

    START TRANSACTION;

    -- Create the group
    INSERT INTO `groups` (`groups`.`owner`, `groups`.`name`) VALUES (owner, name);

    SET group_id = LAST_INSERT_ID();

    CALL addGroupMembers(owner, group_id, members);

    COMMIT;

  END~
DELIMITER ;


/*
    Errors (sqlstate = 45000):
      - GROUP_NOT_EXISTS
      - GROUP_ALREADY_EXISTS

      (Caused by `addGroupMembers`)
      - USERNAME_%S_NOT_FRIEND
          (%S will replace with the username)
          (If username is the owner's username)
          (If username does not exists)
          (If username is not owner's friend)
 */
DELIMITER ~
CREATE PROCEDURE `updateGroup`
  (
    IN `owner`    INT UNSIGNED,
    IN `old_name` VARCHAR(25)
                  CHARACTER SET utf8mb4
                  COLLATE utf8mb4_persian_ci,
    IN `name`     VARCHAR(25)
                  CHARACTER SET utf8mb4
                  COLLATE utf8mb4_persian_ci,
    IN `members`  TEXT
  )
    PROC: BEGIN

    DECLARE group_id INT UNSIGNED;

    -- If the group is duplicate
    DECLARE EXIT HANDLER FOR 1062
    BEGIN
      ROLLBACK;

      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'GROUP_ALREADY_EXISTS';
    END;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

    -- If neither name nor members are gonna get updated
    IF name IS NULL AND members IS NULL
    THEN
      LEAVE PROC;
    END IF;

    START TRANSACTION;

    SELECT `groups`.`id`
    INTO group_id
    FROM `groups`
    WHERE `groups`.`name` = old_name
          AND `groups`.`owner` = owner
    FOR UPDATE;
    -- If group does not exists
    IF FOUND_ROWS() = 0
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'GROUP_NOT_EXISTS';
    END IF;

    -- If name must get updated
    IF name IS NOT NULL
    THEN
      UPDATE `groups`
        SET `groups`.`name` = name
      WHERE `groups`.`id` = group_id;
    END IF;

    IF members IS NULL
    THEN
      COMMIT;
      LEAVE PROC;
    END IF;

    -- Delete existing user's from group
    DELETE FROM `group_members` WHERE `group_members`.`group_id` = group_id;

    CALL addGroupMembers(owner, group_id, members);

    COMMIT;

  END~
DELIMITER ;


/*
  Errors (sqlstate = 45000):
    - SENDER_NOT_FOUND
    - POINT_NOT_FOUND
    - PERSONAL_POINT_NOT_FOUND
    - GROUP_NOT_FOUND

    (Caused by `enforce_message_point_or_personal_point`)
    - NO_POINT
    - BOTH_POINTS
 */
DELIMITER ~
CREATE PROCEDURE `sendGroupMessage`
  (
    IN sender         MEDIUMINT UNSIGNED,
    IN group_name     VARCHAR(25)
                      CHARACTER SET utf8mb4
                      COLLATE utf8mb4_persian_ci,
    IN point_code     CHAR(17),
    IN personal_point BIGINT UNSIGNED,
    IN sent_time      TIMESTAMP,
    IN message        TEXT CHARACTER SET utf8mb4
                      COLLATE utf8mb4_persian_ci
  )
    PROC: BEGIN

    DECLARE point INT UNSIGNED;
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE group_id INT UNSIGNED;
    DECLARE member_id MEDIUMINT UNSIGNED;

    DECLARE cur CURSOR FOR
      SELECT `group_members`.`member_id`
      FROM `group_members`
      WHERE `group_members`.`group_id` = group_id
    LOCK IN SHARE MODE;

    -- If sender does not exists
    DECLARE EXIT HANDLER FOR 1452
    BEGIN
      ROLLBACK;

      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'SENDER_NOT_FOUND';
    END;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      RESIGNAL;
    END;

    START TRANSACTION;

    SELECT `groups`.`id`
    INTO group_id
    FROM `groups`
    WHERE `groups`.`owner` = sender AND
          `groups`.`name` = group_name
    LOCK IN SHARE MODE;
    -- If group not found
    IF FOUND_ROWS() != 1
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'GROUP_NOT_FOUND';
    END IF;

    -- If user wants to send a main point
    IF point_code IS NOT NULL
    THEN
      -- Fetch points's id from it's code
      -- The point is either public or is owned by sender
      SELECT `points`.`id`
      INTO point
      FROM `points`
      WHERE `points`.`code` = LOWER(point_code) AND
            (`points`.`owner` = sender OR `points`.public = TRUE)
      LOCK IN SHARE MODE;
      -- Check if there is any point with given code
      IF found_rows() != 1
      THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'POINT_NOT_FOUND';
      END IF;
    END IF;

    -- If user wants to send a personal point
    IF personal_point IS NOT NULL
    THEN
      -- Fetch personal points's owner from it's id
      SELECT `personal_points`.`owner`
      INTO @personal_point_owner
      FROM `personal_points`
      WHERE `personal_points`.`id` = personal_point
      LOCK IN SHARE MODE;
      -- Check if there is any personal point with given id
      --     and if the the owner is the sender
      IF found_rows() != 1 OR @personal_point_owner != sender
      THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'PERSONAL_POINT_NOT_FOUND';
      END IF;
    END IF;

    OPEN cur;
    CUR_LOOP: LOOP
      FETCH cur
      INTO member_id;

      IF done
      THEN
        LEAVE CUR_LOOP;
      END IF;

      INSERT INTO `messages` (messages.sender,
                              messages.receiver,
                              messages.point,
                              messages.personal_point,
                              messages.sent_time,
                              messages.message) VALUES (
        sender, member_id, point, personal_point, sent_time, message
      );
    END LOOP;
    CLOSE cur;

    COMMIT;
  END ~
DELIMITER ;
