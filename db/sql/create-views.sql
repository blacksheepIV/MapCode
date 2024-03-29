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


CREATE ALGORITHM = MERGE VIEW `users_detailed` AS
  SELECT
    `users`.`id`,
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
    `T`.`code`                                  AS `recommender_user`,
    friendsCount_ForUpdate(`users`.`id`)        AS `friends_count`,
    friendRequestsCount_ForUpdate(`users`.`id`) AS `friend_requests_count`,
    userPointsCount(`users`.`id`)               AS `points_count`,
    userPersonalPointsCount(`users`.`id`)       AS `personal_points_count`,
    userSentMessagesCount(`users`.`id`)         AS `sent_messages_count`,
    userReceivedMessagesCount(`users`.`id`)     AS `received_messages_count`,
    userUnreadMessagesCount(`users`.`id`)       AS `unread_messages_count`
  FROM `users`
    LEFT JOIN `users` AS T ON `users`.`recommender_user` = `T`.`id`;

CREATE VIEW point_tags_concated AS
  SELECT
    `point_id` AS `id`,
    GROUP_CONCAT(`tags`.`tag` SEPARATOR ' ') as `tags`
  FROM `point_tags`
    JOIN `tags` ON `tags`.`id` = `point_tags`.`tag_id`
  GROUP BY `point_id`;


CREATE VIEW `points_detailed` AS
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
    `users`.`id`              AS `owner_id`,
    `users`.`username`        AS `owner`,
    `rate`,
    `popularity`,
    `point_categories`.`name` AS `category`,
    `points`.`description`,
    `point_tags_concated`.`tags`
  FROM `points`
    JOIN `users` ON `users`.`id` = `points`.`owner`
    JOIN `point_categories` ON `point_categories`.`id` = `points`.`category`
    LEFT JOIN `point_tags_concated` ON `point_tags_concated`.`id` = `points`.`id`;


CREATE ALGORITHM = MERGE VIEW `messages_detailed` AS
  SELECT
    `messages`.`id`                                                         AS `code`,
    `U1`.`username`                                                         AS `sender`,
    `U1`.`id`                                                               AS `sender_id`,
    `U2`.`username`                                                         AS `receiver`,
    `U2`.`id`                                                               AS `receiver_id`,
    IF(`messages`.`point` IS NULL, `personal_points`.`lat`, `points`.`lat`) AS `lat`,
    IF(`messages`.`point` IS NULL, `personal_points`.`lng`, `points`.`lng`) AS `lng`,
    IF(`messages`.`point` IS NULL, FALSE, TRUE)                             AS `non_personal`,
    IF(`messages`.`point` IS NULL, `personal_points`.`id`, `points`.`code`) AS `point_code`,
    `messages`.`message`,
    `messages`.`sent_time`,
    `messages`.`read`
  FROM `messages`
    JOIN `users` AS U1 ON `U1`.`id` = `messages`.`sender`
    JOIN `users` AS U2 ON `U2`.`id` = `messages`.`receiver`
    LEFT OUTER JOIN `points` ON `points`.`id` = `messages`.`point`
    LEFT OUTER JOIN `personal_points` ON `personal_points`.`id` = `messages`.`personal_point`;


CREATE VIEW `groups_detailed` AS
  SELECT
    `groups`.`owner`                               AS `owner`,
    `groups`.`name`                                AS `name`,
    GROUP_CONCAT(`users`.`username` SEPARATOR ' ') AS `members`
  FROM `group_members`
    JOIN `groups` ON `groups`.`id` = `group_members`.`group_id`
    JOIN `users` ON `users`.`id` = `group_members`.`member_id`
  GROUP BY `group_members`.`group_id`;


CREATE VIEW `friends_username` AS
  SELECT
    U1.`username` AS `first_user`,
    U2.`username` AS `second_user`
  FROM `friends`
    JOIN `users` AS U1 ON U1.`id` = `friends`.`first_user`
    JOIN `users` AS U2 ON U2.`id` = `friends`.`second_user`;
