#!/usr/bin/env node
/**
 * Spark Server MySQL
 * A static library for SQL.
 * Used so that other modules can access the MySQL server without needing to load in credentials,
 * or create another connection.
 * @author Patrick Emery
 */

const mysql = require('mysql2/promise');


this.connect = (host, user, password, database) => {
  this.connection = mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
  });
};

this.query = async (query, data, callback) => this.connection.query(query, data, callback);

this.close = () => {
  this.connection.end();
};
