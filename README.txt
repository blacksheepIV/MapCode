* First steps:
	- Install MySQL
	- Install Redis
	- Install NodeJS and NPM
	- Install PM2

* Run `npm install`

* Create .env file for configurations.
  This file should set following variables:
  `
      PORT = 3000
      # API URL
      API_HREF = 'http://localhost:3000/api/'
      # You can generate it with uuid4 (and python uuid package)
      JWT_SECRET_CODE = 'A Sekret Kode!'
      # Every redis key will have this string as it's prefix
      REDIS_PREFIX = 'projectm:'
  `

* Run `npm start`
