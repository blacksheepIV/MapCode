var mysql = require('mysql');


var conn = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    supportBigNumbers: true,
    multipleStatements: true,
    charset: 'utf8mb4_persian_ci'
});

module.exports.conn = conn;


module.exports.objectInsertQuery = function (tableName, obj, callback) {
    var values = [tableName];
    var query = "INSERT INTO ?? SET ";
    Object.keys(obj).forEach(function (key) {
        query += ' ?? = ?, ';
        values.push(key, obj[key]);
    });
    query = query.substr(0, query.length - 2) + ';';
    conn.query(query, values, function (err, results, fields) {
        callback(err, results, fields);
    });
};


module.exports.runUpdateQuery = function (options, callback) {
    var fields = Object.keys(options.fields);
    // If there is no field to update
    if (!fields.length)
        return callback();

    var values = [options.table];
    var query = "UPDATE ?? SET ";
    fields.forEach(function (field, index) {
        query += '?? = ?' + (index !== fields.length - 1 ? ', ' : ' ');
        values.push(field, options.fields[field]);
    });

    var conditions = Object.keys(options.conditions);
    // If there is any condition
    if (conditions.length) {
        query += "WHERE ";
        conditions.forEach(function (cond, index) {
            query += '?? = ?' + (index !== conditions.length - 1 ? 'AND ' : ';');
            values.push(cond, options.conditions[cond]);
        });
    }

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
