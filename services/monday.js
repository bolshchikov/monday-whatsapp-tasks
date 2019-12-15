const axios = require('axios');

const ENDPOINT = 'https://api.monday.com/v2';
const MONDAY_AUTH_TOKEN = process.env.MONDAY_AUTH_TOKEN;

axios.defaults.headers.common['Authorization'] = MONDAY_AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const callMondayAPI = async (query) => {
  const { status, data } = await axios.post(ENDPOINT, { query });
  if (status !== 200) {
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
  if (data['errors']) {
    return {
      success: false,
      error: data['errors'][0].message
    }
  }
  return {
    success: true,
    data: data['data']
  };
};

const createTask = async (taskName, boardId, groupId) => {
  const query = `
    mutation {
      create_item (board_id: ${boardId}, group_id: "${groupId}", item_name: "${taskName}") {
        id
      } 
    }
  `;
  const { success, data, error } = await callMondayAPI(query);
  if (!success) {
    return {
      success,
      error
    };
  }

  return {
    success: true,
    id: data['create_item']['id']
  };
};

const getUserIdByEmail = async (email) => {
  const query = `
    query {
      users (kind:non_guests) {
        id
        name
        email
      }
    }
  `;
  const { success, data, error } = await callMondayAPI(query);
  if (!success) {
    return {
      success,
      error
    };
  }
  const requiredUser = data['users'].find(user => user.email === email);
  if (!requiredUser) {
    return {
      success: false,
      error: 'No user with such email is found :('
    }
  }
  return {
    success: true,
    id: requiredUser.id
  };
};

module.exports = {
  createTask,
  getUserIdByEmail
};