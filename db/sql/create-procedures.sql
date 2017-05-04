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
    IN  `category`        VARCHAR(30) CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,
    IN  `description`     TEXT CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,
    IN `tags`             TEXT CHARACTER SET utf8mb4
                          COLLATE utf8mb4_persian_ci,

    OUT `point_code`      VARCHAR(17),
    OUT `err`             TINYINT UNSIGNED
  )
    PROC: BEGIN
    DECLARE credit, bonus SMALLINT UNSIGNED;
    DECLARE first_code, second_code, category_id SMALLINT UNSIGNED;

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
        U.`id`, T.`code`, U.`code`
    INTO category_id, first_code, second_code
    FROM point_categories AS U
    JOIN point_categories AS T ON U.parent = T.id
    WHERE U.name = category
          AND U.`parent` IS NOT NULL;

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
    WHERE points.category = category_id;

    SET @cat_count = @cat_count + 1;

    -- TODO: Remove '-' from point code
    SET @code = CONCAT('mp', CAST(first_code AS CHAR(10)), CAST(second_code AS CHAR(10)), CAST(@cat_count AS CHAR(10)));

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
