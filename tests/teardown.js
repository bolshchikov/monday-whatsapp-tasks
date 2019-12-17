module.exports = () => {
  return new Promise((resolve) => {
    clearInterval(global['__INTERVAL_ID__']);
    global['__APP_SERVER__'].stop(resolve);
  });
};
