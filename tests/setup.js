require('dotenv').config();
const http = require('http');
const stoppable = require('stoppable');
const appFactory = require('../app');

const PORT = process.env.PORT || 3000;

module.exports = () => {
  return new Promise((resolve) => {
    const app = appFactory({});
    global['__INTERVAL_ID__'] = app.intervalId;
    global['__APP_SERVER__'] = stoppable(http.createServer(app), 0);
    global['__APP_SERVER__'].listen(PORT, resolve);
  });
};
