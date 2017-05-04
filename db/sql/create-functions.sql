-- SPLIT_STR MySQL Function
-- from http://blog.fedecarg.com/2009/02/22/mysql-split-string-function/

CREATE FUNCTION SPLIT_STR(
  x TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,
  delim VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci,
  pos INT
)
RETURNS TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci
RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(x, delim, pos),
    CHAR_LENGTH(SUBSTRING_INDEX(x, delim, pos -1)) + 1),
    delim, '');

/*
Example:
SELECT SPLIT_STR('a|bb|ccc|dd', '|', 3) as third;
+-------+
| third |
+-------+
| ccc   |
+-------+
*/
