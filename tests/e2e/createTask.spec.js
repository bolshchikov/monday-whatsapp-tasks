const nock = require('nock');
const axios = require('axios');
const DBDriver = require('../drivers/db');
const TwilioDriver = require('../drivers/twilio');
const MondayDriver = require('../drivers/monday');
const MessageBuilder = require('../builders/message');

const ACTIONS = require('../../dist/types/Actions').default;

const TIMEOUT = 50;

describe('Create new task', () => {
  const from = '+123456789';
  let mondayDriver, twilioDriver, dbDriver;

  beforeEach(() => {
    dbDriver = new DBDriver();
    mondayDriver = new MondayDriver();
    twilioDriver = new TwilioDriver();
  });

  beforeEach(async () => {
    await dbDriver.setTokenFor(from);
  });


  test('Create a new task successfully', async (done) => {
    mondayDriver.givenReply({
      'create_item': {
        id: 123456
      }
    });

    twilioDriver.whenCallingWith('Done');

    const message = new MessageBuilder();
    message
      .action(ACTIONS.NEW_TASK)
      .body('My new task')
      .from(`whatsapp:${from}`);

    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(() => {
      expect(nock.isDone()).toBe(true);
      done();
    }, TIMEOUT);
  });

  test('Create a new task in a given board name', async (done) => {
    mondayDriver.givenReply({
      boards: [
        {
          id: 1,
          name: 'My board 1'
        },
        {
          id: 2,
          name: 'My board 2'
        },
        {
          id: 3,
          name: 'My board 3'
        }
      ]
    });

    mondayDriver.givenReply({
      'create_item': {
        id: 123456
      }
    });

    twilioDriver.whenCallingWith('Done');

    const message = new MessageBuilder();
    const boardNameForFuzzySearch = 'my barod 1';
    message
      .action(ACTIONS.NEW_TASK)
      .body(`My new task\n${boardNameForFuzzySearch}`)
      .from(`whatsapp:${from}`);

    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(() => {
      expect(nock.isDone()).toBe(true);
      done();
    }, TIMEOUT);
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

    const createTaskMessage = new MessageBuilder();
    const associateEmailMessage = new MessageBuilder();

    associateEmailMessage
      .action(ACTIONS.ASSOCIATE_WITH_EMAIL)
      .body('sergey@test.net')
      .from(`whatsapp:${from}`);

    createTaskMessage
      .action(ACTIONS.NEW_TASK)
      .body('Some new task')
      .from(`whatsapp:${from}`);

    await axios.post('http://localhost:3000/messages', associateEmailMessage.build());
    await axios.post('http://localhost:3000/messages', createTaskMessage.build());

    setTimeout(() => {
      expect(nock.pendingMocks()).toEqual([]);
      done();
    }, 1400);
  });
});
