const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const reply = (originalMessage, replyText) => {
  const to = originalMessage['From']
  const from = originalMessage['To']
  return client.messages
    .create({
      body: replyText,
      from,
      to
    })
    .then(message => console.log(message.sid))
    .done()
}

module.exports = {
  reply
};
