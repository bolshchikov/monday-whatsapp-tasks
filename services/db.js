module.exports = (dbClient) => {
  const setUserId = (phoneNumber, userId) => {
    return dbClient.set(phoneNumber, userId)
      .then(
        res => ({ success: res === 'OK' }),
        error => ({
          success: false,
          error
        })
      );
  };

  const getUserId = (phoneNumber) => {
    return dbClient.get(phoneNumber)
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
  return {
    setUserId,
    getUserId
  };
};


