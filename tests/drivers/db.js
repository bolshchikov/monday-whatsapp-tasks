/* eslint-disable class-methods-use-this */
class DBDriver {
  setTokenFor(phoneNumber) {
    return global.setDbKey(`whatsapp:${phoneNumber}:token`, 'some-auth-token');
  }
  getTokenFor(phoneNumber) {
    return global.getDbKey(`whatsapp:${phoneNumber}:token`);
  }
}

module.exports = DBDriver;