var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('OK');
});

router.post('/', function(req, res, next) {
  console.log(req.body)
  res.end();
});

module.exports = router;
