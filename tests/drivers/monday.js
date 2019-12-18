const nock = require('nock');

class MondayDriver {
  givenReply(data) {
    return nock('https://api.monday.com')
      .post('/v2')
      .reply(200, { data: data });
  }
}

module.exports = MondayDriver;