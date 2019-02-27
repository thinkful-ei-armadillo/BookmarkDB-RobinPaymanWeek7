/*global supertest */
const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const {makeBookmarkArray} = require('./bookmarks.fixtures');

describe('Bookmark Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: {
        host: '127.0.0.1',
        user: 'dunder_mifflin',
        password: process.MIGRATION_DB_PASS,
        database: 'bookmark_test'
      },
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks').truncate());

  context('Given there are bookmarks in the database', () => {
    const testBookmarks = makeBookmarkArray();

    beforeEach('insert bookmarks', () => {
      return db.into('bookmarks').insert(testBookmarks);
    });
    afterEach('cleanup', () => db('bookmarks').truncate());

    it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(200, testBookmarks);
      // TODO: add more assertions about the body
    });
    it('GET /bookmarks/:bookmark_id responds with 200 and the specified article', () => {
      const bookmarkId = 2;
      const expectedBookmark = testBookmarks[bookmarkId - 1];
      return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .expect(200, expectedBookmark);
    });
  
  });
  context(`Given no bookmarks`, () => {
    it(`responds with 200 and an empty list`, () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(200, []);
    });
  });
});
