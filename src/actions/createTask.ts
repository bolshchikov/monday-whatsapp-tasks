import { reply } from '../services/twilio';
import * as monday from '../services/monday';
import Message from '../types/Message';
import TwilioPayload from '../types/TwilioPayload';

const DEFAULT_BOARD_ID = 154509005;
const GROUP_ID = '';


export default db => async (userToken: string, payload: TwilioPayload, message: Message) => {
  console.log('creating new task');
  try {
    let boardId = DEFAULT_BOARD_ID;
    console.log(message);

    if (message && message.boardName !== undefined) {
      const boardIdResponse = await monday.getBoardIdByName(userToken, message.boardName);
      if (boardIdResponse.success) {
        boardId = boardIdResponse.id;
      } else {
        throw new Error(boardIdResponse.error);
      }
    }
    const { id } = await monday.createItem(
      userToken,
      message.userInput,
      boardId,
      GROUP_ID
    );
    const from = payload['From'];
    const { userId } = await db.getUserId(from);

    if (userId) {
      const assignUserResponse = await monday.assignItem(
        userToken,
        boardId,
        id,
        userId
      );
      if (!assignUserResponse.success) {
        throw new Error(assignUserResponse.error);
      }
    }
    return reply(payload, `Done`);
  } catch (error) {
    console.log(error);
    return reply(payload, `*Error*:\n${error}`);
  }
};