const db = require('./db');
const monday = require('./monday');
const twilio = require('./twilio');

const PERSONAL_TASKS_BOARD_ID = 154509005;
const GROUP_ID = '';

const ACTIONS = {
  NEW_TASK: 'task',
  ASSOCIATE_WITH_EMAIL: 'email',
  USER_UNFINISHED_TASKS: 'tasks'
};

const parseMessageBody = (message) => {
  const body = message['Body'];
  const [action, userInput, boardName, groupName] = body.split('\n');
  return {
    action,
    userInput,
    boardName,
    groupName
  }
};

const createTask = async (message) => {
  console.log('creating new task');
  const messageBody = parseMessageBody(message);
  console.log(messageBody);
  const { success, error } = await monday.createItem(
    messageBody.userInput,
    PERSONAL_TASKS_BOARD_ID,
    GROUP_ID
  );
  if (!success) {
    console.log(error);
    return twilio.reply(message, `*Error*:\n${error}`);
  }
  return twilio.reply(message, `Done`);
};

const associateEmail = async (message) => {
  console.log('Associating email with the user');
  const messageBody = parseMessageBody(message);
  const userEmail = messageBody['userInput'];
  const mondayResponse = await monday.getUserIdByEmail(
    userEmail
  );
  if (!mondayResponse.success) {
    console.log(mondayResponse.error);
    return twilio.reply(message, `*Error*:\n${mondayResponse.error}`);
  }
  const from = message['From'];
  const dbResponse = await db.setUserId(from, mondayResponse.id);
  if (!dbResponse.success) {
    return twilio.reply(message, `*Error*:\n${dbResponse.error}`);
  }
  return twilio.reply(message, `Done`);
};

const getUserUnfinishedTasks = async (message) => {
  console.log('Get user unfinished tasks');
  const from = message['From'];
  const dbResponse = await db.getUserId(from);
  if (!dbResponse.success) {
    console.log(dbResponse.error);
    return twilio.reply(message, `*Error*:\n${dbResponse.error}`);
  }
  const userId = dbResponse.userId;
  const mondayResponse = await monday.getUserUnfinishedTasks(userId);
  if (!mondayResponse.success) {
    console.log(mondayResponse.error);
    return twilio.reply(message, `*Error*:\n${mondayResponse.error}`);
  }
  const formattedMessage = mondayResponse.tasks.map(task => `◽ ${task.name}`).join('\n');
  return twilio.reply(message, formattedMessage);
};

const process = (message) => {
  const { action } = parseMessageBody(message);
  switch (action.toLowerCase()) {
    case ACTIONS.NEW_TASK:
      createTask(message);
      break;
    case ACTIONS.ASSOCIATE_WITH_EMAIL:
      associateEmail(message);
      break;
    case ACTIONS.USER_UNFINISHED_TASKS:
      getUserUnfinishedTasks(message);
      break;
    default:
      twilio.reply(message, 'Action is not recognized.');
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
