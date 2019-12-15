const express = require('express');

module.exports = (queue) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send('OK');
  });

  router.post('/', (req, res) => {
    const message = req.body;
    queue.push(message);
    res.end();
  });

  return router;
};
