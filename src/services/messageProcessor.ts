const twilio = require('./twilio');
const ACTIONS = require('../contants/actions');
const createTaskImpl = require('../actions/createTask');
const associateEmailImpl = require('../actions/associateEmail');
const getUserUnfinishedTasksImpl = require('../actions/getUserUnfinishedTasks');

const parseMessage = (payload) => {
  const body = payload['Body'];
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

  const createTask = createTaskImpl(db);
  const associateEmail = associateEmailImpl(db);
  const getUserUnfinishedTasks = getUserUnfinishedTasksImpl(db);

  const process = (payload) => {
    const message = parseMessage(payload);
    switch (message.action.toLowerCase()) {
      case ACTIONS.NEW_TASK:
        return createTask(payload, message);
      case ACTIONS.ASSOCIATE_WITH_EMAIL:
        return associateEmail(payload, message);
      case ACTIONS.USER_UNFINISHED_TASKS:
        return getUserUnfinishedTasks(payload, false);
      case ACTIONS.USER_UNFINISHED_TASKS_TODAY:
        return getUserUnfinishedTasks(payload, true);
      default:
        return twilio.reply(payload, 'Action is not recognized.');
    }
  };

  queue.process((job) => {
    const payload = job.data;
    return process(payload);
  });
};
