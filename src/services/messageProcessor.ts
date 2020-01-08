import { Job } from 'bull';
import { reply } from './twilio';
import Message from '../types/Message';
import ACTIONS from '../types/Actions';
import TwilioPayload from '../types/TwilioPayload';
import createTaskImpl from '../actions/createTask';
import associateEmailImpl from '../actions/associateEmail';
import setMondayTokenImpl from '../actions/setMondayToken';
import getUserUnfinishedTasksImpl from '../actions/getUserUnfinishedTasks';

const parseMessage = (payload: TwilioPayload): Message => {
  const body = payload['Body'];
  const [action, userInput, boardName, groupName] = body.split('\n');
  return {
    action,
    userInput,
    boardName,
    groupName
  };
};

export default async (queue, dbClient) => {
  const { build } = await import('./db');
  const db = build(dbClient);

  const createTask = createTaskImpl(db);
  const associateEmail = associateEmailImpl(db);
  const setMondayToken = setMondayTokenImpl(db);
  const getUserUnfinishedTasks = getUserUnfinishedTasksImpl(db);

  const process = async (payload: TwilioPayload) => {
    const message = parseMessage(payload);

    if (message.action.toLowerCase() === ACTIONS.MONDAY_TOKEN) {
      return setMondayToken(payload, message);
    }

    const { error, success, token } = await db.getUserToken(payload.From);
    
    if (!success) {
      return reply(payload, `*Error:*\n${error}`);
    }

    switch (message.action.toLowerCase()) {  
      case ACTIONS.NEW_TASK:
        return createTask(token, payload, message);
      case ACTIONS.ASSOCIATE_WITH_EMAIL:
        return associateEmail(token, payload, message);
      case ACTIONS.USER_UNFINISHED_TASKS:
        return getUserUnfinishedTasks(token, payload, false);
      case ACTIONS.USER_UNFINISHED_TASKS_TODAY:
        return getUserUnfinishedTasks(token, payload, true);
      default:
        return reply(payload, 'Action is not recognized.');
    }
  };

  queue.process((job: Job) => {
    const payload = job.data;
    return process(payload);
  });
};
