const express = require('express');

module.exports = (queue) => {
  const router = express.Router();
  router.get('/', function (req, res, next) {
    res.send('OK');
  });

  router.post('/', function (req, res) {
    const message = req.body;
    queue.push(message);
    res.end();
  });

  return router;
};
