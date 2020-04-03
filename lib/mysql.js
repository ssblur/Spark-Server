#!/usr/bin/env node
/**
 * Spark Server MySQL
 * A static library for SQL.
 * Used so that other modules can access the MySQL server without needing to load in credentials,
 * or create another connection.
 * @author Patrick Emery
 */

const mysql = require('mysql');


this.connect = (host, user, password, database) => {
  this.connection = mysql.createConnection({
    host,
    user,
    password,
    database,
  });
};

this.query = (queryString, data, callback) => this.query(queryString, data, callback);

this.close = () => {
  this.connection.end();
};
