module.exports = {
    apps: [
        {
            name: 'ProjectM',
            script: 'bin/www',
            kill_timeout:5000,
            env: {},
            env_production: {
                NODE_ENV: 'production'
            },
            env_development: {
                NODE_ENV: 'development'
            },
            "merge_logs": true,
            "log_date_format": "YYYY-MM-DD HH:mm Z"
        }
    ],
    deploy: {
        production: {
            user: 'arshingolabchi1',
            host: '188.40.89.142',
            ref: 'origin/master',
            repo: 'git@gitlab.com:ProjectM/src.git',
            path: '/var/www/vhosts/mapcode.ir',
            "post-deploy": 'npm install --production && npm start -- --env production',
            "env"  : {
                "NODE_ENV": "production"
            }
        }
    }
};
