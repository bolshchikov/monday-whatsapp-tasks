const nock = require('nock');
const axios = require('axios');
const TwilioDriver = require('../drivers/twilio');
const MondayDriver = require('../drivers/monday');
const MessageBuilder = require('../builders/message');

const ACTIONS = require('../../contants/actions');

describe('Create new task', () => {
  let mondayDriver, twilioDriver;

  beforeEach(() => {
    mondayDriver = new MondayDriver();
    twilioDriver = new TwilioDriver();
  });

  test('Create a new task successfully', async (done) => {
    const mondayCall = mondayDriver.givenReply({
      'create_item': {
        id: 123456
      }
    });

    const twilioReply = twilioDriver.whenCallingWith('Done');

    const message = new MessageBuilder();
    message
      .action(ACTIONS.NEW_TASK)
      .body('My new task')
      .from(Math.random().toString());

    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 600);
  });

  test('Assign created tasks if email exists', async (done) => {
    const userId = 67890;
    mondayDriver.givenReply({
      users: [
        {
          id: userId,
          name: 'Sergey',
          email: 'sergey@test.net'
        }
      ]
    });
    mondayDriver.givenReply({
      'create_item': {
        id: 123456
      }
    });
    mondayDriver.givenReply({
      'change_column_value': {
        id: "406324307"
      }
    });

    twilioDriver.whenCallingWith('Done');
    twilioDriver.whenCallingWith('Done');

    const from = Math.random().toString();
    const createTaskMessage = new MessageBuilder();
    const associateEmailMessage = new MessageBuilder();

    associateEmailMessage
      .action(ACTIONS.ASSOCIATE_WITH_EMAIL)
      .body('sergey@test.net')
      .from(from);

    createTaskMessage
      .action(ACTIONS.NEW_TASK)
      .body('Some new task')
      .from(from);

    await axios.post('http://localhost:3000/messages', associateEmailMessage.build());
    await axios.post('http://localhost:3000/messages', createTaskMessage.build());

    setTimeout(() => {
      expect(nock.pendingMocks()).toEqual([]);
      done();
    }, 1400);
  });
});
