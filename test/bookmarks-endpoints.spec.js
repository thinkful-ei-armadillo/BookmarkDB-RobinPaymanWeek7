/*global supertest */
const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('Bookmark Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks').truncate());

  context('Given there are bookmarks in the database', () => {
    const testBookmarks = [
      {
        id: 1,
        title: 'hey',
        url: 'https://google.com',
        rating: 1,
        description: 'wuddup playa'
      },
      {
        id: 2,
        title: 'yo wuddup b',
        url: 'https://thinkful.com',
        rating: 3,
        description: 'yo jus chillin'
      }
    ];

    beforeEach('insert bookmarks', () => {
      return db.into('bookmarks').insert(testBookmarks);
    });

    it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(200, testBookmarks);
      // TODO: add more assertions about the body
    });
  });
});
