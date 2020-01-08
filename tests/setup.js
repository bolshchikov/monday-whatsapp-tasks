require('dotenv').config();
const http = require('http');
const Redis = require('ioredis');
const stoppable = require('stoppable');
const appFactory = require('../dist/app');

const redis = new Redis();
const PORT = process.env.PORT || 3000;

module.exports = () => new Promise((resolve) => {
  const app = appFactory(redis);
  global['__REDIS_CLIENT__'] = redis;
  global['__MESSAGE_QUEUE__'] = app.queue;
  global['__APP_SERVER__'] = stoppable(http.createServer(app), 0);
  global['__APP_SERVER__'].listen(PORT, resolve);
});
