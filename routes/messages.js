const express = require('express');
const router = express.Router();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

router.get('/', function (req, res, next) {
  res.send('OK');
});

router.post('/', function (req, res, next) {
  console.log(req.body)
  const to = req.body['From']
  const from = req.body['To']
  client.messages
    .create({
      body: 'Hello World!',
      from,
      to
    })
    .then(message => console.log(message.sid))
    .done()
  res.end();
});

module.exports = router;
