require('dotenv').config();
const app = require('./app');
const { PORT, DB_URL } = require('./config');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'dunder_mifflin_admin',
    password: process.env.MIGRATION_DB_PASS,
    database: 'bookmarks'
  }
});

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
