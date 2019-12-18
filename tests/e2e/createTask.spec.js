const nock = require('nock');
const axios = require('axios');
const createTaskMessage = require('../fixtures/messages/createTask.json');

describe('Create new task', () => {
  test('Create a new task successfully', async (done) => {
    const mondayCall = nock('https://api.monday.com')
      .post('/v2')
      .reply(200, {
        data: {
          'create_item': {
            id: 123456
          }
        }
      });

    const twilioReply = nock('https://api.twilio.com')
      .post(
        uri => uri.startsWith('/2010-04-01/Accounts'),
        body => body.includes('Done'))
      .reply(200, {});

    await axios.post('http://localhost:3000/messages', createTaskMessage);

    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 600);
  });
});
