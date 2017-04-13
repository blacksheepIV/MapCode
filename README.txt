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
  `

* Run `npm start`
