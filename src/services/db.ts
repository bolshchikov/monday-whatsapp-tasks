export interface DBService {
  setUserId(phoneNumber: string, userId: string): Promise<{ success: boolean, error?: string }>,
  getUserId(phoneNumber: string): Promise<{ success: boolean, error?: string, userId?: number }>,
  setUserToken(phoneNumber: string, token: string): Promise<{ success: boolean, error?: string }>,
  getUserToken(phoneNumber: string): Promise<{ success: boolean, error?: string, token?: string }>
};

export const build = dbClient => {
  const setKey = (key, value) => dbClient.set(key, value)
    .then(res => ({ success: res === 'OK' }))
    .catch(error => ({
      success: false,
      error
    }));

  const getKey = (key) => dbClient.get(key).catch(error => ({
    success: false,
    error
  }));

  return <DBService>{
    setUserId(phoneNumber, userId) {
      return setKey(`${phoneNumber}:userId`, userId);
    },
    setUserToken(phoneNumber, token) {
      return setKey(`${phoneNumber}:token`, token)
    },
    getUserId(phoneNumber) {
      return getKey(`${phoneNumber}:userId`).then((maybeUserId: string | null) => {
        if (maybeUserId === null) {
          return {
            success: false,
            error: 'No Monday user is associated with this phone number'
          };
        }
        return {
          success: true,
          userId: parseInt(maybeUserId, 10)
        };
      });
    },
    getUserToken(phoneNumber) {
      return getKey(`${phoneNumber}:token`).then((maybeToken: string | null) => {
        if (maybeToken === null) {
          return {
            success: false,
            error: 'No Monday token is set for this phone number'
          };
        }
        return {
          success: true,
          token: maybeToken
        };
      });
    }
  };
};


