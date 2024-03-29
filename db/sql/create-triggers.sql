DELIMITER ~
CREATE TRIGGER enforce_friendship_id_order BEFORE INSERT ON friends
  FOR EACH ROW BEGIN
    IF (NEW.first_user = NEW.second_user)
    THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SELF_FRIENDSHIP';
    END IF;

    SET @lowerId := IF(NEW.first_user < NEW.second_user, NEW.first_user, NEW.second_user);
    SET @higherId := IF(NEW.first_user > NEW.second_user, NEW.first_user, NEW.second_user);
    SET NEW.first_user = @lowerId;
    SET NEW.second_user = @higherId;
  END;
~
DELIMITER ;


DELIMITER ~
CREATE TRIGGER enforce_friendship_request_id_order BEFORE INSERT ON friend_requests
  FOR EACH ROW BEGIN
    IF (NEW.first_user = NEW.second_user)
    THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SELF_REQUEST';
    END IF;

    SET @lowerId := IF(NEW.first_user < NEW.second_user, NEW.first_user, NEW.second_user);
    SET @higherId := IF(NEW.first_user > NEW.second_user, NEW.first_user, NEW.second_user);
    SET NEW.first_user = @lowerId;
    SET NEW.second_user = @higherId;
  END;
~
DELIMITER ;


/*
  Errors (sqlstate = 45000):
    - NO_POINT
    - BOTH_POINTS
    - SELF_MESSAGE
 */
DELIMITER ~
CREATE TRIGGER enforce_message_point_or_personal_point
BEFORE INSERT ON messages
FOR EACH ROW
  BEGIN
    -- At least one point must be defined
    IF NEW.point IS NULL AND NEW.personal_point IS NULL
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_POINT';
    END IF;
    -- Both points can't be defined
    IF NEW.point IS NOT NULL AND NEW.personal_point IS NOT NULL
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'BOTH_POINTS';
    END IF;
    -- Check if sender and receiver are same
    IF NEW.sender = NEW.receiver
    THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'SELF_MESSAGE';
    END IF;
  END;
~
DELIMITER ;


/*
    When a friendship gets deleted, all the messages
    between those friends gets deleted and also
    they get removed from their mutual groups
 */
DELIMITER ~
CREATE TRIGGER `friend_ship_delete_trigger`
AFTER DELETE ON `friends`
FOR EACH ROW
  BEGIN
    -- Delete all their messages
    DELETE FROM `messages`
    WHERE (
            `messages`.`sender` = OLD.first_user
            AND
            `messages`.`receiver` = OLD.second_user
          )
          OR
          (
            `messages`.`sender` = OLD.second_user
            AND
            `messages`.`receiver` = OLD.first_user
          );
    -- Remove them from their mutual groups
    DELETE FROM `group_members`
    WHERE (
            `group_members`.`member_id` = OLD.first_user
            AND
            `group_members`.`group_id` IN (
              SELECT `groups`.`id`
              FROM `groups`
              WHERE `groups`.`owner` = OLD.second_user
            )
          )
          OR
          (
            `group_members`.`member_id` = OLD.second_user
            AND
            `group_members`.`group_id` IN (
              SELECT `groups`.`id`
              FROM `groups`
              WHERE `groups`.`owner` = OLD.first_user
            )
          );
  END;
~
DELIMITER ;
