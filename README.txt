* First steps:
	- Install MySQL
	- Install Redis
	- Install NodeJS and NPM
	- Install PM2
	    `npm install -g pm2`
	- Install apiDoc (Optional: For generating API documentations)
	    `npm install -g apidoc`
	- Install nsp and snyk NPM packages (Optional: For testing NPM packages security)
	    `npm install -g nsp`
	    `npm install -g snyk`
	- Install mocha (Optional: For testing)
	    `npm install -g mocha`

* Run `npm install`

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
      REDIS_PASSWORD = 'myRedisPassword!!'
      # Database configurations
      DB_HOST = 'localhost'
      DB_USER = 'projectm'
      DB_PASS = 'projectm123456'
      DB_NAME = 'projectmdb'
      # Hashids unique key (In order to generate unique hashids)
      HASHIDS_KEY = 'r5309rfadfn'
  `

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

    `--dummy-inserts`
        Add this argument to npm run mkdb if you want to insert some
        dummy rows into database tables.

* Run `npm start`
