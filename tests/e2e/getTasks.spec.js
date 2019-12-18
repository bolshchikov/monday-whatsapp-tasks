const axios = require('axios');
const TwilioDriver = require('../drivers/twilio');
const MondayDriver = require('../drivers/monday');
const MessageBuilder = require('../builders/message');

const ACTIONS = require('../../contants/actions');

describe('Get tasks', () => {
  let mondayDriver, twilioDriver;

  beforeEach(() => {
    mondayDriver = new MondayDriver();
    twilioDriver = new TwilioDriver();
  });

  test('Fail if user is not associated', async (done) => {
    const twilioReply = twilioDriver.whenCallingWith('No Monday user is associated with this phone number');
    const message = new MessageBuilder();
    message
      .action(ACTIONS.USER_UNFINISHED_TASKS)
      .from(Math.random().toString());


    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(() => {
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 600);
  });

  test('Get tasks successfully', (done) => {
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
    const mondayCall = mondayDriver.givenReply({
      boards: [
        {
          items: [
            {
              name: 'Item with null status',
              'column_values': [
                {
                  id: 'person',
                  value: JSON.stringify({ id: userId })
                },
                {
                  id: 'status',
                  text: null,
                  value: null
                }
              ]
            }
          ]
        }
      ]
    });
    twilioDriver.whenCallingWith('Done');
    const twilioReply = twilioDriver.whenCallingWith('Item with null status');
    const from = Math.random().toString();
    const getTasksMessage = new MessageBuilder();
    const associateEmailMessage = new MessageBuilder();

    associateEmailMessage
      .action(ACTIONS.ASSOCIATE_WITH_EMAIL)
      .body('sergey@test.net')
      .from(from);

    getTasksMessage
      .action(ACTIONS.USER_UNFINISHED_TASKS)
      .from(from);


    axios.post('http://localhost:3000/messages', associateEmailMessage.build());
    axios.post('http://localhost:3000/messages', getTasksMessage.build());

    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 1400);
  });
});
