const mysql = require('mysql2/promise');
require('dotenv').config();

// CONNEXION A LA BASE DE DONNEES
const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: process.env.DB_CHARSET
});

module.exports = connection;
