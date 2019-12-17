const nock = require('nock');
const axios = require('axios');
const createTaskMessage = require('../fixtures/messages/createTask.json');

jest.mock('../../services/twilio', () => ({
  reply(_, text) {
    console.log(text);
  }
}));

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

    await axios.post('http://localhost:3000/messages', createTaskMessage);
    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      done();
    }, 501);
  });
});
