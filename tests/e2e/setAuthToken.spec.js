const nock = require('nock');
const axios = require('axios');
const DBDriver = require('../drivers/db');
const TwilioDriver = require('../drivers/twilio');
const MessageBuilder = require('../builders/message');

const ACTIONS = require('../../dist/types/Actions').default;

const TIMEOUT = 50;

describe.only('Set user monday token', () => {
  const from = '+12345678';
  let twilioDriver, dbDriver;

  beforeEach(() => {
    twilioDriver = new TwilioDriver();
    dbDriver = new DBDriver();
  });

  test('Set user monday token successfully', async (done) => {
    const token = 'My.random.token';
    twilioDriver.whenCallingWith('Done');

    const message = new MessageBuilder();
    message
      .action(ACTIONS.MONDAY_TOKEN)
      .body(token)
      .from(`whatsapp:${from}`);

    await axios.post('http://localhost:3000/messages', message.build());

    setTimeout(async () => {
      expect(nock.isDone()).toBe(true);
      const res = await dbDriver.getTokenFor(from);
      expect(res).toEqual(token);
      done();
    }, TIMEOUT);
  });
});
