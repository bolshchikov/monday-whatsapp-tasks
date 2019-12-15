const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const setUserEmail = (phoneNumber, userEmail, userId) => {
  const key = `${phoneNumber}:${userEmail}`;
  return redis.set(key, userId)
    .then(
      res => ({ success: res === 'OK' }),
      error => ({
        success: false,
        error
      })
    );
};

module.exports = {
  setUserEmail
};
