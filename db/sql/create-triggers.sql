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
