CREATE ALGORITHM = MERGE VIEW users_public AS
  SELECT
    `users`.`name`,
    `users`.`melli_code`,
    `users`.`email`,
    `users`.`date`,
    `users`.`mobile_phone`,
    `users`.`phone`,
    `users`.`username`,
    `users`.`address`,
    `users`.`description`,
    `users`.`type`,
    `users`.`code`,
    `users`.`credit`,
    `users`.`bonus`,
    `T`.`code` AS `recommender_user`
  FROM `users`
    LEFT JOIN `users` AS T ON `users`.`recommender_user` = `T`.`id`;


CREATE ALGORITHM = MERGE VIEW users_detailed AS
  SELECT
    `users`.`name`,
    `users`.`melli_code`,
    `users`.`email`,
    `users`.`date`,
    `users`.`mobile_phone`,
    `users`.`phone`,
    `users`.`username`,
    `users`.`address`,
    `users`.`description`,
    `users`.`type`,
    `users`.`code`,
    `users`.`credit`,
    `users`.`bonus`,
    `T`.`code` AS `recommender_user`,
    friendsCount_ForUpdate(`users`.`id`) AS `friends_count`,
    friendRequestsCount_ForUpdate(`users`.`id`) AS `friend_requests_count`
  FROM `users`
    LEFT JOIN `users` AS T ON `users`.`recommender_user` = `T`.`id`;


CREATE VIEW point_tags_concated AS
  SELECT
    `point_id` AS `id`,
    GROUP_CONCAT(`tags`.`tag` SEPARATOR ' ') as `tags`
  FROM `point_tags`
    JOIN `tags` ON `tags`.`id` = `point_tags`.`tag_id`
  GROUP BY `point_id`;


CREATE VIEW points_detailed_with_owner_id AS
  SELECT
    `lat`,
    `lng`,
    `submission_date`,
    `expiration_date`,
    `points`.`name`,
    `points`.`phone`,
    `province`,
    `city`,
    `points`.`code`,
    `points`.`address`,
    `public`,
    `users`.`id`            AS `owner_id`,
    `users`.`username`            AS `owner`,
    `rate`,
    `popularity`,
    `point_categories`.`name` AS `category`,
    `points`.`description`,
    `point_tags_concated`.`tags`
  FROM `points`
    JOIN `users` ON `users`.`id` = `points`.`owner`
    JOIN `point_categories` ON `point_categories`.`id` = `points`.`category`
    JOIN `point_tags_concated` ON `point_tags_concated`.`id` = `points`.`id`;

CREATE VIEW points_detailed AS
  SELECT
    `lat`,
    `lng`,
    `submission_date`,
    `expiration_date`,
    `points`.`name`,
    `points`.`phone`,
    `province`,
    `city`,
    `points`.`code`,
    `points`.`address`,
    `public`,
    `users`.`username`            AS `owner`,
    `rate`,
    `popularity`,
    `point_categories`.`name` AS `category`,
    `points`.`description`,
    `point_tags_concated`.`tags`
  FROM `points`
    JOIN `users` ON `users`.`id` = `points`.`owner`
    JOIN `point_categories` ON `point_categories`.`id` = `points`.`category`
    JOIN `point_tags_concated` ON `point_tags_concated`.`id` = `points`.`id`;


CREATE ALGORITHM = MERGE VIEW `messages_detailed` AS
  SELECT
    `messages`.`id` as `code`,
    `U1`.`username` AS `sender`,
    `U2`.`username` AS `receiver`,
    IF (`messages`.`point` IS NULL, `personal_points`.`lat`, `points`.`lat`) AS `lat`,
    IF (`messages`.`point` IS NULL, `personal_points`.`lng`, `points`.`lng`) AS `lng`,
    IF (`messages`.`point` IS NULL, FALSE, TRUE) AS `non_personal`,
    IF (`messages`.`point` IS NULL, `personal_points`.`id`, `points`.`code`) AS `point_code`,
    `messages`.`message`,
    `messages`.`sent_time`
  FROM `messages`
  JOIN `users` AS U1 ON `U1`.`id` = `messages`.`sender`
  JOIN `users` AS U2 ON `U2`.`id` = `messages`.`receiver`
  LEFT OUTER JOIN `points` ON `points`.`id` = `messages`.`point`
  LEFT OUTER JOIN `personal_points` ON `personal_points`.`id` = `messages`.`personal_point`;
