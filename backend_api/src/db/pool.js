const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

/**
 * Attempts to derive a PostgreSQL connection string.
 * Preference order:
 * 1) process.env.DATABASE_URL (common convention)
 * 2) process.env.POSTGRES_URL (provided by the platform container wiring)
 * 3) database_postgres/db_connection.txt (contains a psql command; we parse out the URL)
 */
function getConnectionString() {
  const envUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim();
  }

  // Fallback: read connection hint file from sibling database workspace.
  // This is a best-effort helper for local/dev; production should use env vars.
  try {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'role-based-access-dashboard-304334-304345',
      'database_postgres',
      'db_connection.txt'
    );
    const content = fs.readFileSync(filePath, 'utf8').trim();
    // Expected: "psql postgresql://user:pass@host:port/db"
    const match = content.match(/(postgres(?:ql)?:\/\/\S+)/i);
    if (match && match[1]) {
      return match[1];
    }
  } catch (err) {
    // Intentionally swallow; callers will fail with a clear error when DB is used.
  }

  return null;
}

const connectionString = getConnectionString();

const pool = new Pool({
  connectionString: connectionString || undefined,
  // If neither env nor file exists, pg will try other env vars; if that fails,
  // queries will error and return a clear message from our handlers.
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Unexpected PG pool error:', err);
});

module.exports = {
  pool,
  getConnectionString,
};

