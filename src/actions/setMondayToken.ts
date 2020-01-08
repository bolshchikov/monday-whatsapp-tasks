import Message from '../types/Message';
import { reply } from '../services/twilio';
import { DBService } from '../services/db';
import TwilioPayload from '../types/TwilioPayload';

export default (db: DBService) => async (payload: TwilioPayload, message: Message) => {
  console.log('Setting user token');
  const token = message.userInput;
  const from = payload.From;
  const { success, error } = await db.setUserToken(from, token);
  if (success) {
    reply(payload, 'Done');
  } else {
    console.log(error);
    reply(payload, `*Error*:\n${error}`);
  }
};