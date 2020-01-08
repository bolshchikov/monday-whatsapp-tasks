module.exports = () => new Promise((resolve) => {
  global['__MESSAGE_QUEUE__'].close()
    .then(() => global['__REDIS_CLIENT__'].disconnect())
    .then(() => global['__APP_SERVER__'].stop())
    .then(resolve);
});
