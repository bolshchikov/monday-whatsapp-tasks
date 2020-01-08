const monday = require('./monday');
const twilio = require('./twilio');
const ACTIONS = require('../contants/actions');

const DEFAULT_BOARD_ID = 154509005;
const GROUP_ID = '';

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
    try {
      let boardId = DEFAULT_BOARD_ID;
      const messageBody = parseMessageBody(message);
      console.log(messageBody);

      if (messageBody && messageBody.boardName !== undefined) {
        const boardIdResponse = await monday.getBoardIdByName(messageBody.boardName);
        if (boardIdResponse.success) {
          boardId = boardIdResponse.id;
        } else {
          throw new Error(boardIdResponse.error);
        }
      }
      const { id } = await monday.createItem(
        messageBody.userInput,
        boardId,
        GROUP_ID
      );
      const from = message['From'];
      const { userId } = await db.getUserId(from);

      if (userId) {
        const assignUserResponse = await monday.assignItem(
          boardId,
          id,
          userId
        );
        if (!assignUserResponse.success) {
          throw new Error(assignUserResponse.error);
        }
      }
      return twilio.reply(message, `Done`);
    } catch (error) {
      console.log(error);
      return twilio.reply(message, `*Error*:\n${error}`);
    }
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
        return createTask(message);
      case ACTIONS.ASSOCIATE_WITH_EMAIL:
        return associateEmail(message);
      case ACTIONS.USER_UNFINISHED_TASKS:
        return getUserUnfinishedTasks(message, false);
      case ACTIONS.USER_UNFINISHED_TASKS_TODAY:
        return getUserUnfinishedTasks(message, true);
      default:
        return twilio.reply(message, 'Action is not recognized.');
    }
  };

  queue.process((job) => {
    const message = job.data;
    return process(message);
  });
};
