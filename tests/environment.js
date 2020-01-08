require('dotenv').config();
const NodeEnvironment = require('jest-environment-node');

class RedisEnv extends NodeEnvironment {
  async setup() {
    await super.setup();
    this.global.setDbKey = global['__REDIS_CLIENT__'].set.bind(global['__REDIS_CLIENT__']);
    this.global.getDbKey = global['__REDIS_CLIENT__'].get.bind(global['__REDIS_CLIENT__']);
  }
  async teardown() {
    await super.teardown();
    await global['__REDIS_CLIENT__'].flushdb();
  }
}

module.exports = RedisEnv;