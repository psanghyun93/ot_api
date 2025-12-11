const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'aitest_db',
  user: process.env.DB_USER || 'aitest',
  password: process.env.DB_PASSWORD || 'aitest123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(' Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection
};
