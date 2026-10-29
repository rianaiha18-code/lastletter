
const mysql = require("mysql2/promise");
const fs = require("fs");

const useSSL = process.env.DB_SSL === "true";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    charset: "utf8mb4",

    ...(useSSL
        ? {
            ssl: {
                ca: fs.readFileSync(
                    process.env.DB_SSL_CA_PATH,
                    "utf8"
                ),
                rejectUnauthorized: true
            }
        }
        : {})
});

module.exports = pool;
