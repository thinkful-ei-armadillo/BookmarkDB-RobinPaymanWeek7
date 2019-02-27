/*global supertest */
const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const {
  makeBookmarkArray,
  makeMaliciousBookmark
} = require('./bookmarks.fixtures');

describe('Bookmark Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: {
        host: '127.0.0.1',
        user: 'dunder_mifflin_admin',
        database: 'bookmarks-test'
      }
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  afterEach('clean table', () => db('bookmarks').truncate());

  before('clean the table', () => db('bookmarks').truncate());

  describe(`POST /bookmarks`, () => {
    it(`creates a bookmark, responding with 201 and the new bookmark`, function() {
      const newBookmark = {
        title: 'Hey',
        description: 'Test new article content...',
        url: 'https://google.com',
        rating: 1
      };
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.description).to.eql(newBookmark.description);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/bookmarks/${res.body.id}`)
            .expect(res.body)
        );
    });

    it(`responds with 400 for trying to create bookmark with rating of 6`, function() {
      const newBookmark = {
        title: 'Hey',
        description: 'Test new article content...',
        url: 'https://google.com',
        rating: 6
      };
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(400);
    });

    it(`responds with 400 for trying to create bookmark with rating of -1`, function() {
      const newBookmark = {
        title: 'Hey',
        description: 'Test new article content...',
        url: 'https://google.com',
        rating: -1
      };
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(400);
    });

    const requiredFields = ['title', 'url', 'rating'];

    requiredFields.forEach(field => {
      const newBookmark = {
        title: 'Test new article',
        rating: 1,
        url: 'https://google.com'
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newBookmark[field];

        return supertest(app)
          .post('/bookmarks')
          .send(newBookmark)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();
      return supertest(app)
        .post(`/bookmarks`)
        .send(maliciousBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(expectedBookmark.title);
          expect(res.body.content).to.eql(expectedBookmark.content);
        });
    });
  });

  context('Given there are bookmarks in the database', () => {
    const testBookmarks = makeBookmarkArray();

    beforeEach('insert bookmarks', () => {
      return db.into('bookmarks').insert(testBookmarks);
    });

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
