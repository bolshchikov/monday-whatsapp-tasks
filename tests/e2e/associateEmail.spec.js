const nock = require('nock');
const axios = require('axios');
const DBDriver = require('../drivers/db');
const TwilioDriver = require('../drivers/twilio');
const MondayDriver = require('../drivers/monday');
const MessageBuilder = require('../builders/message');

const ACTIONS = require('../../dist/types/Actions').default;

const TIMEOUT = 50;

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

  test('Successful action', async (done) => {
    mondayDriver.givenReply({ users });
    twilioDriver.whenCallingWith('Done');

    const message = new MessageBuilder();
    message
      .action(ACTIONS.ASSOCIATE_WITH_EMAIL)
      .body('sergey@test.net')
      .from(`whatsapp:${from}`);

    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(() => {
      expect(nock.isDone()).toBe(true);
      done();
    }, TIMEOUT);
  });

  test('User provided wrong email', async (done) => {
    mondayDriver.givenReply({ users });
    twilioDriver.whenCallingWith('No user with such email is found');

    const message = new MessageBuilder();
    message
      .action(ACTIONS.ASSOCIATE_WITH_EMAIL)
      .body('some@wrontemailaddress.com')
      .from(`whatsapp:${from}`);

    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(() => {
      expect(nock.isDone()).toBe(true);
      done();
    }, TIMEOUT);
  });
});
