const mysql = require('mysql2/promise');

// CONNEXION A LA BASE DE DONNEES
const connection = await mysql.createConnection({
  host: '127.0.0.1',
  port: 8889,
  user: 'flutter',
  password: 'flutter',
  database: 'flutter_db',
  charset: 'utf8'
});

module.exports = connection;
