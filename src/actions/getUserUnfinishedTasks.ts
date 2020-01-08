import { reply } from '../services/twilio';
import * as monday from '../services/monday';
import TwilioPayload from '../types/TwilioPayload';

export default db => async (payload: TwilioPayload, isToday = false) => {
  console.log('Get user unfinished tasks');

  const from = payload['From'];

  const dbResponse = await db.getUserId(from);
  if (!dbResponse.success) {
    console.log(dbResponse.error);
    return reply(payload, `*Error*:\n${dbResponse.error}`);
  }

  const userId = dbResponse.userId;

  const mondayResponse = isToday
    ? await monday.getUserUnfinishedTasksToday(userId)
    : await monday.getUserUnfinishedTasks(userId);

  if (mondayResponse.success && mondayResponse.tasks.length === 0) {
    return reply(payload, 'Yayy! You are all done for today!');
  }

  const formattedMessage = mondayResponse.tasks.map(task => `◽ ${task.name}`).join('\n');

  return reply(payload, formattedMessage);
};