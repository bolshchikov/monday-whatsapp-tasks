const monday = require('./monday');
const twilio = require('./twilio');

const PERSONAL_TASKS_BOARD_ID = 154509005;
const GROUP_ID = '';

const ACTIONS = {
  NEW_TASK: 'task',
  ASSOCIATE_WITH_EMAIL: 'email',
  USER_UNFINISHED_TASKS: 'tasks',
  USER_UNFINISHED_TASKS_TODAY: 'tasks today'
};

const parseMessageBody = (message) => {
  const body = message['Body'];
  const [action, userInput, boardName, groupName] = body.split('\n');
  return {
    action,
    userInput,
    boardName,
    groupName
  };
};


module.exports = (queue, dbClient) => {
  const db = require('./db')(dbClient);

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

  const getUserUnfinishedTasks = async (message, isToday = false) => {
    console.log('Get user unfinished tasks');
    const from = message['From'];
    const dbResponse = await db.getUserId(from);
    if (!dbResponse.success) {
      console.log(dbResponse.error);
      return twilio.reply(message, `*Error*:\n${dbResponse.error}`);
    }
    const userId = dbResponse.userId;
    const mondayResponse = isToday
      ? await monday.getUserUnfinishedTasksToday(userId)
      : await monday.getUserUnfinishedTasks(userId);
    if (!mondayResponse.success) {
      console.log(mondayResponse.error);
      return twilio.reply(message, `*Error*:\n${mondayResponse.error}`);
    }
    if (mondayResponse.success && mondayResponse.tasks.length === 0) {
      return twilio.reply(message, 'Yayy! No unfinished tasks for you');
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
        getUserUnfinishedTasks(message, false);
        break;
      case ACTIONS.USER_UNFINISHED_TASKS_TODAY:
        getUserUnfinishedTasks(message, true);
        break;
      default:
        twilio.reply(message, 'Action is not recognized.');
        break;
    }
  };

  return setInterval(() => {
    const maybeMessage = queue.process();
    if (maybeMessage) {
      process(maybeMessage);
    }
  }, 500);
};
