* First steps:
	- Install MySQL
	- Install Redis
	- Install NodeJS and NPM
	- Install PM2
	    `npm install -g pm2`

* Run `npm install`
  or `npm install --production` If you don't want to install
  development tools.

* Create .env file for configurations.
  This file should set following variables:
  `
      # This variable indicates whether or not .env config has been loaded
      PROJECTM_ENV_CONF
      PORT = 3000
      # API URL
      API_HREF = 'http://localhost:3000/api/'
      # You can generate it with uuid4 (and python uuid package)
      JWT_SECRET_CODE = 'A Sekret Kode!'
      # Every redis key will have this string as it's prefix
      REDIS_PREFIX = 'projectm:'
      # Only set this if Redis server is configured with a password
      REDIS_PASSWORD = myRedisPassword!!
      # Database configurations
      DB_USER = projectm
      DB_PASS = projectm123456
      DB_NAME = projectmdb
      # Hashids unique key (In order to generate unique hashids)
      HASHIDS_KEY = 'r5309rfadfn'
      # Max number that can be passed to MySQL queries with LIMIT
      # Default = 100
      QUERY_LIMIT_MAX = 50
      # Max friends number
      MAX_FRIENDS = 100
  `
  Note: If you want to use `npm run dball` these variables
  should not be inside quotations (Like above .env file example):
      - DB_USER
      - DB_PASS
      - DB_NAME
      - REDIS_PASSWORD

* Create database
    You should have a MySQL username and password that at least have full
    access on a single database (for example database `projectm`).

    `npm run mkdb`
        Gets your MySQL information and tries to execute SQL
        files in an existing database.

    `npm run mkdb -- remake`
        Gets your MySQL information and drops the database if
        it exists and the recreates it and then executes SQL
        files in it.

    For the first time, if you have created the database just
    execute the first command, otherwise execute the second one.

    Note: Use `npm run mkdb` for MySQL version < 5.6
          and `npm run mkdb-new` for MySQL version >= 5.6

    `(DBCONFIG=$(./bin/printDBNameUsernamePassword.js)) && (echo $DBCONFIG \\nY | npm run mkdb -- remake) && (npm run dummy-inserts);`
        Recreates the database and inserts dummy data and does not ask for db configs!

* [Optional] Run `npm run dummy-inserts`
             to insert some dummy data into database using API.

             Run `npm run dummy-inserts -- --fall-through`
             to ignore errors and execute all jobs.
             Useful when some of dummy data are already in the DB.

             Run `npm run dummy-inserts -- --fall-through --update-existing`
             To update existing data in DB if dummy data are already in there.


* Run `npm start`
