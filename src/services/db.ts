export const build = dbClient => {
  const setUserId = (phoneNumber, userId) => dbClient.set(`${phoneNumber}:userId`, userId)
    .then(
      res => ({ success: res === 'OK' }),
      error => ({
        success: false,
        error
      })
    );

  const getUserId = phoneNumber => dbClient.get(`${phoneNumber}:userId`)
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

  return {
    setUserId,
    getUserId
  };
};


