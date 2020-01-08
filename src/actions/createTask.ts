import * as twilio from '../services/twilio';
import * as monday from '../services/monday';

const DEFAULT_BOARD_ID = 154509005;
const GROUP_ID = '';


module.exports = db => async (payload, message) => {
  console.log('creating new task');
  try {
    let boardId = DEFAULT_BOARD_ID;
    console.log(message);

    if (message && message.boardName !== undefined) {
      const boardIdResponse = await monday.getBoardIdByName(message.boardName);
      if (boardIdResponse.success) {
        boardId = boardIdResponse.id;
      } else {
        throw new Error(boardIdResponse.error);
      }
    }
    const { id } = await monday.createItem(
      message.userInput,
      boardId,
      GROUP_ID
    );
    const from = payload['From'];
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
    return twilio.reply(payload, `Done`);
  } catch (error) {
    console.log(error);
    return twilio.reply(payload, `*Error*:\n${error}`);
  }
};