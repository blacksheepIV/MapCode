CREATE TABLE IF NOT EXISTS `users` (
  `id`               MEDIUMINT UNSIGNED NOT NULL PRIMARY KEY  AUTO_INCREMENT,
  `name`             VARCHAR(40) CHARACTER SET utf8 COLLATE utf8_persian_ci       NOT NULL,
  `melli_code`       VARCHAR(10)        NOT NULL UNIQUE,
  `email`            VARCHAR(100)       NOT NULL UNIQUE,
  `date`             TIMESTAMP          NOT NULL,
  `mobile_phone`     VARCHAR(11)        NOT NULL UNIQUE,
  `phone`            VARCHAR(11),
  `username`         VARCHAR(15)        NOT NULL UNIQUE,
  `password`         VARCHAR(60)        NOT NULL,
  `address`          TEXT CHARACTER SET utf8 COLLATE utf8_persian_ci,
  `description`      TEXT CHARACTER SET utf8 COLLATE utf8_persian_ci,
  `recommender_user` MEDIUMINT UNSIGNED,
  `type`             TINYINT UNSIGNED   NOT NULL              DEFAULT 0,
  `code`             VARCHAR(10)                 UNIQUE,
  `credit`           SMALLINT UNSIGNED  NOT NULL              DEFAULT 0,
  `bonus`            SMALLINT UNSIGNED  NOT NULL              DEFAULT 0,

  FOREIGN KEY (`recommender_user`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
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
  `requester` MEDIUMINT UNSIGNED NOT NULL,
  `requestee` MEDIUMINT UNSIGNED NOT NULL,

  PRIMARY KEY (`requester`, `requestee`),

  FOREIGN KEY (`requester`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`requestee`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `groups` (
  `id`    INT UNSIGNED       NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `owner` MEDIUMINT UNSIGNED NOT NULL,
  `name`  VARCHAR(25)        NOT NULL,

  FOREIGN KEY (`owner`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  UNIQUE (`id`, `name`)
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `group_users` (
  `group_id` INT UNSIGNED       NOT NULL,
  `user_id`  MEDIUMINT UNSIGNED NOT NULL,

  PRIMARY KEY (`group_id`, `user_id`),

  FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `point_categories` (
    `id`     SMALLINT UNSIGNED NOT NULL PRIMARY KEY  AUTO_INCREMENT,
    `code`   SMALLINT UNSIGNED NOT NULL,
    `name`   VARCHAR(30)   CHARACTER SET utf8 COLLATE utf8_persian_ci UNIQUE NOT NULL ,
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
  `name`            VARCHAR(30)   CHARACTER SET utf8 COLLATE utf8_persian_ci    NOT NULL,
  `phone`           VARCHAR(15)        NOT NULL,
  `province`        VARCHAR(25) CHARACTER SET utf8 COLLATE utf8_persian_ci      NOT NULL,
  `city`            VARCHAR(25)  CHARACTER SET utf8 COLLATE utf8_persian_ci     NOT NULL,
  `code`            VARCHAR(17)        UNIQUE,
  `address`         TEXT CHARACTER SET utf8 COLLATE utf8_persian_ci  NOT NULL,
  `public`          BOOLEAN            NOT NULL,
  `owner`           MEDIUMINT UNSIGNED NOT NULL,
  `rate`            TINYINT UNSIGNED   NOT NULL              DEFAULT 0,
  `popularity`      BIGINT UNSIGNED    NOT NULL              DEFAULT 0,
  `category`        SMALLINT UNSIGNED NOT NULL,
  `description`      TEXT CHARACTER SET utf8 COLLATE utf8_persian_ci,

  FOREIGN KEY (`owner`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`category`) REFERENCES `point_categories` (`id`)
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `sender`   MEDIUMINT UNSIGNED NOT NULL,
  `receiver` MEDIUMINT UNSIGNED NOT NULL,
  `point`    INT UNSIGNED       NOT NULL,
  `message`  TEXT,

  FOREIGN KEY (`sender`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`receiver`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`point`) REFERENCES `points` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `group_messages` (
  `sender`   MEDIUMINT UNSIGNED NOT NULL,
  `group_id` INT UNSIGNED       NOT NULL,
  `point`    INT UNSIGNED       NOT NULL,
  `message`  TEXT,

  FOREIGN KEY (`sender`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`point`) REFERENCES `points` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
  ENGINE = INNODB;
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tags` (
  `id`  INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `tag` VARCHAR(20)  NOT NULL UNIQUE
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
