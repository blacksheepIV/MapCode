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


module.exports.runSelectQuery = function (options, callback) {
    var values = (options.columns === '*' ? [] : [].concat(options.columns));

    var query = "SELECT ";

    if (options.columns === '*' || !options.columns)
        query += "* ";
    else {
        // Convert options.columns to array if it's a single field string name
        if (!Array.isArray(options.columns))
            options.columns = [options.columns];

        options.columns.forEach(function (column, index) {
            query += "??" + (index !== options.columns.length - 1 ? ', ' : ' ');
        });
    }

    query += "FROM ?? ";
    values.push(options.table);

    if (options.conditions) {
        query += "WHERE ";
        var conditions = Object.keys(options.conditions);
        conditions.forEach(function (cond, index) {
            query += '?? = ?' + (index !== conditions.length - 1 ? ' AND ' : ' ');
            values.push(cond, options.conditions[cond]);
        });
    }

    // Insert custom conditions passed as raw SQL in the query
    if (options.customConditions) {
        query += options.conditions ? "" : "WHERE ";
        query += options.customConditions + " ";
    }

    if (options.start || options.start === 0) {
        query += 'LIMIT ?';
        values.push(options.start);

        if (options.limit) {
            query += ", ?";
            values.push(options.limit);
        }
    }

    conn.query(query, values, function (err, results, fields) {
        callback(err, results, fields);
    });
};
