#!/usr/bin/env node
/**
 * Spark Server MySQL
 * A static library for SQL.
 * Used so that other modules can access the MySQL server without needing to load in credentials,
 * or create another connection.
 * @author Patrick Emery
 */

const mysql = require('mysql');

let connection;

this.connect = (host, user, password, database) => {
  connection = mysql.createConnection({
    host,
    user,
    password,
    database,
  });
};

this.query = (query, data, callback) => {
  connection.query(query, data, callback);
};

this.close = () => {
  connection.end();
};
