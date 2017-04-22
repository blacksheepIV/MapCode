var mysql = require('mysql');


var conn = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST    ,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    supportBigNumbers: true,
    multipleStatements: true
});

module.exports.conn = conn;


// TODO: SQL injection : use ??
module.exports.objectInsertQuery = function (tableName, obj, callback) {
    var values = [tableName];
    var query = "INSERT INTO ?? SET ";
    for (var key in obj) {
        query += key + ' = ?, ';
        values.push(obj[key]);
    }
    query = query.substr(0, query.length - 2) + ';';
    conn.query(query, values, function (err, results, fields) {
        callback(err, results, fields);
    });
};


module.exports.listOfDuplicates = function (err) {
    err = String(err);

    var fields = err.match(/key '\w+'/g);
    for (var i = 0; i < fields.length; i++) {
        fields[i] = "duplicate_" + fields[i].substr(5, fields[i].length - 6);
    }

    return fields;
};


module.exports.getFromBy = function (columns, table, conditions, callback) {
    var values = [].concat(columns);
    var query = "SELECT ";
    for (var i = 0; i < columns.length; i++) {
        query += "??" + (i !== columns.length - 1 ? ', ' : ' ');
    }

    query += "FROM ?? ";
    values.push(table);

    query += "WHERE ";
    var keys = Object.keys(conditions);
    for (i = 0; i < keys.length; i++) {
        query += '?? = ?' + (i !== keys.length - 1 ? 'AND ' : ';');
        values.push(keys[i], conditions[keys[i]]);
    }

    conn.query(query, values, function (err, results, fields) {
        callback(err, results, fields);
    });
};
