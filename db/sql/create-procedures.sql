/*
 err:
     0 : Success
     2 : Owner not found
     3 : Not enough credit and bonus
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
                          CHARACTER SET utf8
                          COLLATE utf8_persian_ci,
    IN  `phone`           VARCHAR(15),
    IN  `province`        VARCHAR(25)
                          CHARACTER SET utf8
                          COLLATE utf8_persian_ci,
    IN  `city`            VARCHAR(25)
                          CHARACTER SET utf8
                          COLLATE utf8_persian_ci,
    IN  `address`         TEXT CHARACTER SET utf8
                          COLLATE utf8_persian_ci,
    IN  `public`          BOOLEAN,

    OUT `insert_id`       INT UNSIGNED,
    OUT `err`             TINYINT UNSIGNED
  )
    PROC: BEGIN
    DECLARE credit, bonus SMALLINT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
      ROLLBACK;
      SET insert_id = NULL;
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
      points.owner
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
      owner
    );
    SET insert_id = LAST_INSERT_ID();

    -- TODO: decrease bonus first or credit first?
    SET @column_name = 'bonus';
    SET @column_value = bonus;
    IF bonus = 0
    THEN
      SET @column_name = 'credit';
      SET @column_value = credit;
    END IF;
    SET @column_value = @column_value - 1;
    SET @owner = owner;
    SET @query = CONCAT('UPDATE `users` SET `', @column_name, '` = ? WHERE `id` = ?');
    PREPARE decrease_credit_bonus_statement FROM @query;
    EXECUTE decrease_credit_bonus_statement
    USING @column_value, @owner;
    COMMIT;
    DEALLOCATE PREPARE decrease_credit_bonus_statement;

    -- Success
    SET err = 0;
  END~
  delimiter ;
