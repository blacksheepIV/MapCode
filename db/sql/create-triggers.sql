DELIMITER ~
CREATE TRIGGER enforce_friendship_id_order BEFORE INSERT ON friends
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
