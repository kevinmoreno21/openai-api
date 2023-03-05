const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'demo',
  password: 'jrAvHpQG1pI6KLSdR8DT',
  database: 'demoOpenai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database!');
    connection.release();
  } catch (error) {
    console.error(error);
  }
})();

module.exports = pool;
