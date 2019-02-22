const express = require('express');
const logger = require('../logger');
const uuid = require('uuid/v4');
const bookmarkRouter = express.Router();
const bodyParser = express.json();

const { bookmark } = require('../store');

bookmarkRouter
  .route('/bookmark')
  .get((req, res) => {
    res.json(bookmark);
  })
  .post(bodyParser, (req, res) => {
    const { title, content, url, rating=0 } = req.body;

    if (!title) {
      logger.error('Title is required');
      return res.status(400).send('Invalid Data');
    }

    if (!url) {
      logger.error('URL is required');
      return res.status(400).send('Invalid Data');
    }

    const id = uuid();

    const newBookmark = {
      id,
      title,
      content,
      rating,
      url
    };

    bookmark.push(newBookmark);

    logger.info(`Bookmark with id ${id} created`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmark/${id}`)
      .json(newBookmark);
  });

bookmarkRouter
  .route('/bookmark/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark1 = bookmark.find(c => c.id == id);

    // make sure we found a bookmark
    if (!bookmark1) {
      logger.error(`bookmark with id ${id} not found.`);
      return res.status(404).send('bookmark Not Found');
    }

    res.json(bookmark1);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmark.findIndex(c => c.id == id);

    if (bookmarkIndex === -1) {
      logger.error(`bookmark with id ${id} not found.`);
      return res.status(404).send('Not found');
    }


    bookmark.splice(bookmarkIndex, 1);

    logger.info(`bookmark with id ${id} deleted.`);

    res.status(204).end();
  });

module.exports = bookmarkRouter;
