import * as twilio from '../services/twilio';
import * as monday from '../services/monday';

module.exports = db => async (payload, isToday = false) => {
  console.log('Get user unfinished tasks');

  const from = payload['From'];

  const dbResponse = await db.getUserId(from);
  if (!dbResponse.success) {
    console.log(dbResponse.error);
    return twilio.reply(payload, `*Error*:\n${dbResponse.error}`);
  }

  const userId = dbResponse.userId;

  const mondayResponse = isToday
    ? await monday.getUserUnfinishedTasksToday(userId)
    : await monday.getUserUnfinishedTasks(userId);

  if (mondayResponse.success && mondayResponse.tasks.length === 0) {
    return twilio.reply(payload, 'Yayy! You are all done for today!');
  }

  const formattedMessage = mondayResponse.tasks.map(task => `◽ ${task.name}`).join('\n');

  return twilio.reply(payload, formattedMessage);
};