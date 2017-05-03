INSERT INTO `users` (`name`, `melli_code`, `email`, `date`, `mobile_phone`, `username`, `password`, `recommender_user`, `type`, `code`)
    VALUES ('حمیدرضا', '6190053157', 'hadfa@gadfad.com', '1996-05-09', '09365075855', 'mahdavipanah', '123453453452', NULL, 1, 'fdvcdfertg'),
           ('وحید خرم', '9875412569', 'fdafa@gmaiulc.com', '1997-09-07', '06325478965', 'vahid1428', 'passssss', 1, 3, 'redfre34re');


INSERT INTO `point_categories` (`id`, `code`, `name`, `parent`) VALUES
        (1, 1, 'رستوران', NULL),
        (2, 1, 'رستوران ایتالیایی', 1),
        (3, 2, 'رستوران ژاپنی', 1),
        (4, 3, 'کبابی', 1),

        (5, 2, 'فروشگاه', NULL),
        (6, 1, 'فروشگاه لباس', 5),
        (7, 2, 'فروشگاه کفش', 5);
