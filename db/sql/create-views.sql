CREATE VIEW users_public AS
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


CREATE VIEW point_tags_concated AS
  SELECT
    `point_id`,
    GROUP_CONCAT(`tags`.`tag` SEPARATOR ' ') as `tags`
  FROM `point_tags`
    JOIN `tags` ON `tags`.`id` = `point_tags`.`tag_id`
  GROUP BY `point_id`;


CREATE VIEW points_beautified AS
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
    `users`.`code`            AS `owner`,
    `rate`,
    `popularity`,
    `point_categories`.`name` AS `category`,
    `points`.`description`,
    `point_tags_concated`.`tags`
  FROM `points`
    JOIN `users` ON `users`.`id` = `points`.`owner`
    JOIN `point_categories` ON `point_categories`.`id` = `points`.`category`
    JOIN `point_tags_concated` ON `point_tags_concated`.`point_id` = `points`.`id`;
