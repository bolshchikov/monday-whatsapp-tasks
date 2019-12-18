const nock = require('nock');
const axios = require('axios');
const getTasksMessage = require('../fixtures/messages/getTasks.json');
const tasksReply = require('../fixtures/replies/items.json');

describe('Get tasks', () => {
  test('Get tasks successfully', async (done) => {
    const mondayCall = nock('https://api.monday.com')
      .post('/v2')
      .reply(200, tasksReply);

    const twilioReply = nock('https://api.twilio.com')
      .post(
        uri => uri.startsWith('/2010-04-01/Accounts'),
        body => body.includes('Schedule an appointment'))
      .reply(200, {});

    await axios.post('http://localhost:3000/messages', getTasksMessage);

    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 600);
  });
});
