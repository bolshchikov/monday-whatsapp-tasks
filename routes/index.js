const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to Monday-Whatsapp Task Manager');
});

module.exports = router;
