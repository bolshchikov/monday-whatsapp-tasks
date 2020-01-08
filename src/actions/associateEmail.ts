import Message from '../types/Message';
import { reply } from '../services/twilio';
import TwilioPayload from '../types/TwilioPayload';
import { getUserIdByEmail } from '../services/monday';

export default db => async (payload: TwilioPayload, message: Message) => {
  console.log('Associating email with the user');
  const userEmail = message['userInput'];
  const mondayResponse = await getUserIdByEmail(
    userEmail
  );
  if (!mondayResponse.success) {
    console.log(mondayResponse.error);
    return reply(payload, `*Error*:\n${mondayResponse.error}`);
  }
  const from = payload['From'];
  const dbResponse = await db.setUserId(from, mondayResponse.id);
  if (!dbResponse.success) {
    return reply(payload, `*Error*:\n${dbResponse.error}`);
  }
  return reply(payload, `Done`);
};