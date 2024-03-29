CREATE TABLE IF NOT EXISTS `users` (
  `id`               MEDIUMINT UNSIGNED NOT NULL PRIMARY KEY  AUTO_INCREMENT,
  `name`             VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci       NOT NULL,
  `melli_code`       VARCHAR(10)        NOT NULL UNIQUE,
  `email`            VARCHAR(100)       NOT NULL UNIQUE,
  `date`             TIMESTAMP          NOT NULL,
  `mobile_phone`     VARCHAR(11)        NOT NULL UNIQUE,
  `phone`            VARCHAR(11),
  `username`         VARCHAR(15)        NOT NULL UNIQUE,
  `password`         VARCHAR(60)        NOT NULL,
  `address`          TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,
  `description`      TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,
  `recommender_user` MEDIUMINT UNSIGNED,
  `type`             TINYINT UNSIGNED   NOT NULL              DEFAULT 0,
  `code`             VARCHAR(10)                 UNIQUE,
  `credit`           SMALLINT UNSIGNED  NOT NULL              DEFAULT 0,
  `bonus`            INTEGER UNSIGNED  NOT NULL              DEFAULT 0,

  FOREIGN KEY (`recommender_user`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `personal_points` (
  `id`          BIGINT UNSIGNED            NOT NULL  PRIMARY KEY AUTO_INCREMENT,
  `lat`         DECIMAL(10, 8)             NOT NULL,
  `lng`         DECIMAL(11, 8)             NOT NULL,
  `name`        VARCHAR(30)
                CHARACTER SET utf8mb4
                COLLATE utf8mb4_persian_ci NOT NULL,
  `owner`       MEDIUMINT UNSIGNED         NOT NULL,
  `description` TEXT CHARACTER SET utf8mb4
                COLLATE utf8mb4_persian_ci,

  FOREIGN KEY (`owner`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `friends` (
  `first_user`  MEDIUMINT UNSIGNED NOT NULL,
  `second_user` MEDIUMINT UNSIGNED NOT NULL,

  PRIMARY KEY (`first_user`, `second_user`),

  FOREIGN KEY (`first_user`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`second_user`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `friend_requests` (
  `first_user` MEDIUMINT UNSIGNED NOT NULL,
  `second_user` MEDIUMINT UNSIGNED NOT NULL,
  `requester` MEDIUMINT UNSIGNED NOT NULL,

  PRIMARY KEY (`first_user`, `second_user`),

  FOREIGN KEY (`first_user`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`second_user`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`requester`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `groups` (
  `id`    INT UNSIGNED       NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `owner` MEDIUMINT UNSIGNED NOT NULL,
  `name`  VARCHAR(25)
                CHARACTER SET utf8mb4
                COLLATE utf8mb4_persian_ci NOT NULL,

  FOREIGN KEY (`owner`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `owner_name_unique` UNIQUE (`owner`, `name`)
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `group_members` (
  `group_id` INT UNSIGNED       NOT NULL,
  `member_id`  MEDIUMINT UNSIGNED NOT NULL,

  PRIMARY KEY (`group_id`, `member_id`),

  FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`member_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `point_categories` (
    `id`     SMALLINT UNSIGNED NOT NULL PRIMARY KEY  AUTO_INCREMENT,
    `code`   SMALLINT UNSIGNED NOT NULL,
    `name`   VARCHAR(100)   CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci UNIQUE NOT NULL,
    `parent` SMALLINT UNSIGNED,

    FOREIGN KEY (`parent`) REFERENCES `point_categories` (`id`)
        ON UPDATE CASCADE
)
    ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `points` (
  `id`              INT UNSIGNED       NOT NULL  PRIMARY KEY AUTO_INCREMENT,
  `lat`             DECIMAL(10, 8)     NOT NULL,
  `lng`             DECIMAL(11, 8)     NOT NULL,
  `submission_date` TIMESTAMP NULL,
  `expiration_date` TIMESTAMP NULL,
  `name`            VARCHAR(30)   CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci    NOT NULL,
  `phone`           VARCHAR(15)        NOT NULL,
  `province`        VARCHAR(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci      NOT NULL,
  `city`            VARCHAR(25)  CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci     NOT NULL,
  `code`            CHAR(17)        UNIQUE,
  `address`         TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci  NOT NULL,
  `public`          BOOLEAN            NOT NULL,
  `owner`           MEDIUMINT UNSIGNED NOT NULL,
  `rate`            TINYINT UNSIGNED   NOT NULL              DEFAULT 0,
  `popularity`      BIGINT UNSIGNED    NOT NULL              DEFAULT 0,
  `category`        SMALLINT UNSIGNED NOT NULL,
  `description`      TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,

  FOREIGN KEY (`owner`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`category`) REFERENCES `point_categories` (`id`)
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id`          BIGINT UNSIGNED            NOT NULL  PRIMARY KEY AUTO_INCREMENT,
  `sender`   MEDIUMINT UNSIGNED NOT NULL,
  `receiver` MEDIUMINT UNSIGNED NOT NULL,
  `point`    INT UNSIGNED,
  `personal_point`    BIGINT UNSIGNED,
  `message`  TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,
  `sent_time` TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read` BOOLEAN NOT NULL DEFAULT FALSE,

  FOREIGN KEY (`sender`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`receiver`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`point`) REFERENCES `points` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`personal_point`) REFERENCES `personal_points` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tags` (
  `id`  INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `tag` VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci NOT NULL UNIQUE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `point_tags` (
  `point_id` INT UNSIGNED NOT NULL,
  `tag_id`   INT UNSIGNED NOT NULL,

  PRIMARY KEY (`point_id`, `tag_id`),

  FOREIGN KEY (`point_id`) REFERENCES `points` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `setting` VARCHAR(25) NOT NULL PRIMARY KEY,
  `value`   VARCHAR(25) NOT NULL
)
  ENGINE = INNODB;
-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
INSERT INTO settings (`setting`, `value`) VALUES
  ('max_friends_count', '100'),
  ('days_after_expiration', '3');
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `public_system_messages` (
  `subject`   VARCHAR(50) NOT NULL,
  `content`   TEXT        NOT NULL,
  `sent_time` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `personal_system_messages` (
  `receiver`  MEDIUMINT UNSIGNED NOT NULL,
  `subject`   VARCHAR(50)        NOT NULL,
  `content`   TEXT               NOT NULL,
  `sent_time` TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (`receiver`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `confirmation_requests` (
  `requester`    MEDIUMINT UNSIGNED NOT NULL,
  `request_time` TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (`requester`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_packages` (
  `id`               SMALLINT UNSIGNED          NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `name`             VARCHAR(40)
                     CHARACTER SET utf8mb4
                     COLLATE utf8mb4_persian_ci NOT NULL,
  `points_count`     SMALLINT UNSIGNED          NOT NULL,
  `price`            INT UNSIGNED               NOT NULL,
  `bonus_percentage` TINYINT UNSIGNED           NOT NULL
)
  ENGINE = INNODB;
