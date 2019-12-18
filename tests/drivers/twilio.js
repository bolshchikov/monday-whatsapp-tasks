const nock = require('nock');

class TwilioDriver {
  whenCallingWith(message) {
    return nock('https://api.twilio.com')
      .post(
        uri => uri.startsWith('/2010-04-01/Accounts'),
        body => body.includes(message))
      .reply(200, {});
  }
}

module.exports = TwilioDriver;