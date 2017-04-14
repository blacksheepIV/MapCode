var mysql = require('mysql');


var connection = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST    ,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    supportBigNumbers: true
});

connection.objectInsertQuery = function (tableName, obj, callback) {
    var values = [tableName];
    var query = "INSERT INTO ?? SET ";
    for (var key in obj) {
        query += key + ' = ?, ';
        values.push(obj[key]);
    }
    query = query.substr(0, query.length - 2) + ';';
    connection.query(query, values, function (err, results, fields) {
        callback(err, results, fields);
    });
};

connection.listOfDuplicates = function (err) {
    err = String(err);

    var fields = err.match(/key '\w+'/g);
    for (var i = 0; i < fields.length; i++) {
        fields[i] = fields[i].substr(5, fields[i].length - 6);
        fields[i] = 'duplicate' + fields[i][0].toUpperCase() + fields[i].substr(1);
    }

    return fields;
};

module.exports = connection;
