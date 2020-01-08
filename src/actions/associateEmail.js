const twilio = require('../services/twilio');
const monday = require('../services/monday');

module.exports = db => async (payload, message) => {
  console.log('Associating email with the user');
  const userEmail = message['userInput'];
  const mondayResponse = await monday.getUserIdByEmail(
    userEmail
  );
  if (!mondayResponse.success) {
    console.log(mondayResponse.error);
    return twilio.reply(payload, `*Error*:\n${mondayResponse.error}`);
  }
  const from = payload['From'];
  const dbResponse = await db.setUserId(from, mondayResponse.id);
  if (!dbResponse.success) {
    return twilio.reply(payload, `*Error*:\n${dbResponse.error}`);
  }
  return twilio.reply(payload, `Done`);
};