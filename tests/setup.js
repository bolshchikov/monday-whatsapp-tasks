require('dotenv').config();
const http = require('http');
const Redis = require('ioredis');
const stoppable = require('stoppable');
const appFactory = require('../app');

const redis = new Redis();
const PORT = process.env.PORT || 3000;

module.exports = () => new Promise((resolve) => {  
  const app = appFactory(redis);
  global['__REDIS_CLIENT__'] = redis;
  global['__INTERVAL_ID__'] = app.intervalId;
  global['__APP_SERVER__'] = stoppable(http.createServer(app), 0);
  global['__APP_SERVER__'].listen(PORT, resolve);
});
