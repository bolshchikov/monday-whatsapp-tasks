const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const setUserId = (phoneNumber, userId) => {
  return redis.set(phoneNumber, userId)
    .then(
      res => ({ success: res === 'OK' }),
      error => ({
        success: false,
        error
      })
    );
};

const getUserId = (phoneNumber) => {
  return redis.get(phoneNumber)
    .then(
      (userId) => {
        if (userId === null) {
          return {
            success: false,
            error: 'No Monday user is associated with this phone number'
          };
        }
        return {
          success: true,
          userId: parseInt(userId, 10)
        };
      },
      error => ({
        success: false,
        error
      })
    );
};

module.exports = {
  setUserId,
  getUserId
};
