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
  const { status, data } = await monday.createTask(
    messageBody.title,
    PERSONAL_TASKS_BOARD_ID,
    GROUP_ID
  );
  console.log(data);
  if (status === 200) {
    twilio.reply(message, "Done");
  } else {
    twilio.reply(message, "Something went wrong");
  }

};

const process = (message) => {
  const { action } = parseMessageBody(message);
  switch (action) {
    case 'Create task':
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