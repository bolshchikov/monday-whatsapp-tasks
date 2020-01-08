import twilio from 'twilio';
import TwilioPayload from '../types/TwilioPayload';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export const reply = (originalPayload: TwilioPayload, replyText) => {
  const to = originalPayload['From'];
  const from = originalPayload['To'];
  return client.messages
    .create({
      body: replyText,
      from,
      to
    })
    .then(message => console.log(message.sid));
};

