#!/usr/bin/env node
/**
 * Spark Server MySQL
 * A static library for SQL.
 * Used so that other modules can access the MySQL server without needing to load in credentials,
 * or create another connection.
 * @author Patrick Emery
 */

const mysql = require('mysql2/promise');

/**
 * A convenience function for connecting to MySQL.
 * Doesn't do much on its own, but allows server modules to share one Pool.
 * @param {String} host The host to connect to.
 * @param {String} user The username used to connect.
 * @param {String} password The password used to connect.
 * @param {String} database The database to post to and poll from.
 */
this.connect = (host, user, password, database) => {
  this.connection = mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
  });
};

/**
 * A convenience function for querying the active database.
 * @param {String} query The query string to pose.
 * @param {Array<*>} data The data to sanitize and insert into the query string.
 * @param {Function} callback The callback function. In practice, await or then are used more often.
 */
this.query = async (query, data, callback) => this.connection.query(query, data, callback);

/**
 * Closes the active connection.
 */
this.close = () => {
  this.connection.end();
};
