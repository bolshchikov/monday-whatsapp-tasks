const axios = require('axios');
const TwilioDriver = require('../drivers/twilio');
const MondayDriver = require('../drivers/monday');
const MessageBuilder = require('../builders/message');

const ACTIONS = require('../../contants/actions');

const users = [
  {
    id: 123456,
    name: 'Vasya',
    email: 'vasya@test.com'
  },
  {
    id: 67890,
    name: 'Sergey',
    email: 'sergey@test.net'
  }
];

describe('Associate user by email address', () => {
  let mondayDriver, twilioDriver;

  beforeEach(() => {
    mondayDriver = new MondayDriver();
    twilioDriver = new TwilioDriver();
  });

  test('Successful action', async (done) => {
    const mondayCall = mondayDriver.givenReply({ users });
    const twilioReply = twilioDriver.whenCallingWith('Done');
    const message = new MessageBuilder();
    message
      .action(ACTIONS.ASSOCIATE_WITH_EMAIL)
      .body('sergey@test.net')
      .from(Math.random().toString());

    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 600);
  });

  test('User provided wrong email', async (done) => {
    const mondayCall = mondayDriver.givenReply({ users });
    const twilioReply = twilioDriver.whenCallingWith('No user with such email is found');
    const message = new MessageBuilder();
    message
      .action(ACTIONS.ASSOCIATE_WITH_EMAIL)
      .body('some@wrontemailaddress.com')
      .from(Math.random().toString());

    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 600);
  });
});
