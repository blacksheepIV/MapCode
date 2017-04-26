CREATE VIEW users_public AS
  SELECT
    `name`,
    `melli_code`,
    `email`,
    `date`,
    `mobile_phone`,
    `phone`,
    `username`,
    `address`,
    `description`,
    `type`,
    `users`.`code`,
    `credit`,
    `bonus`,
    `T`.`code` AS `recommender_user`
  FROM `users`
    LEFT JOIN (
                 SELECT
                   `id`,
                   `code`
                 FROM `users`
               ) AS T ON `users`.`recommender_user` = `T`.`id`;
