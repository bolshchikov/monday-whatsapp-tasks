module.exports = () => new Promise((resolve) => {
  clearInterval(global['__INTERVAL_ID__']);
  global['__REDIS_CLIENT__'].disconnect();
  global['__APP_SERVER__'].stop(resolve);
});
