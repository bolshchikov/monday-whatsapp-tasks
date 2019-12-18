const nock = require('nock');
const axios = require('axios');
const associateEmailMessage = require('../fixtures/messages/associateEmail.json');

describe('Associate user by email address', () => {
  test('Successful action', async (done) => {
    const mondayCall = nock('https://api.monday.com')
      .post('/v2')
      .reply(200, {
        data: {
          users: [
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
          ]
        }
      });

    const twilioReply = nock('https://api.twilio.com')
      .post(
        uri => uri.startsWith('/2010-04-01/Accounts'),
        body => body.includes('Done'))
      .reply(200, {});

    await axios.post('http://localhost:3000/messages', associateEmailMessage);

    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 600);
  });

  test('User provided wrong email', async (done) => {
    const mondayCall = nock('https://api.monday.com')
      .post('/v2')
      .reply(200, {
        data: {
          users: [
            {
              id: 123456,
              name: 'Vasya',
              email: 'vasya@test.com'
            },
            {
              id: 67890,
              name: 'Sergey',
              email: 'sergey@somewrongemailaddress.net'
            }
          ]
        }
      });

    const twilioReply = nock('https://api.twilio.com')
      .post(
        uri => uri.startsWith('/2010-04-01/Accounts'),
        body => body.includes('No user with such email is found'))
      .reply(200, {});

    await axios.post('http://localhost:3000/messages', associateEmailMessage);

    setTimeout(() => {
      expect(mondayCall.isDone()).toBe(true);
      expect(twilioReply.isDone()).toBe(true);
      done();
    }, 600);
  });
});
