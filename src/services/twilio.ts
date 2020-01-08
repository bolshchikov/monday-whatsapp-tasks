const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

import twilio from 'twilio';
const client = twilio(accountSid, authToken);

export const reply = (originalMessage, replyText) => {
  const to = originalMessage['From'];
  const from = originalMessage['To'];
  return client.messages
    .create({
      body: replyText,
      from,
      to
    })
    .then(message => console.log(message.sid));
};

