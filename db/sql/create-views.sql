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
