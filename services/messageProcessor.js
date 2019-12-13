const monday = require('./monday');
const twilio = require('./twilio');

const PERSONAL_TASKS_BOARD_ID = 154509005;
const GROUP_ID = 'Personal';

const parseMessageBody = (message) => {
  const body = message['Body'];
  const [action, title, boardName, groupName] = body.split('\n');
  return {
    action,
    title,
    boardName,
    groupName
  }
}

const createTask = async (message) => {
  console.log('creating new task');
  const messageBody = parseMessageBody(message);
  console.log(messageBody);
  const { success, body } = await monday.createTask(
    messageBody.title,
    PERSONAL_TASKS_BOARD_ID,
    GROUP_ID
  );
  console.log(data);
  if (success) {
    twilio.reply(message, `*Done*:\n${body}`);
  } else {
    twilio.reply(message, `*Error*:\n${body}`);
  }
};

const process = (message) => {
  const { action } = parseMessageBody(message);
  switch (action.toLowerCase()) {
    case 'new task':
      createTask(message);
      break;
    default:
      break;
  }

};

module.exports = (queue) => {
  setInterval(() => {
    const maybeMessage = queue.process();
    if (maybeMessage) {
      process(maybeMessage);
    }
  }, 500);
};