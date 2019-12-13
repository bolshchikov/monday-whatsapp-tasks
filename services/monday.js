const axios = require('axios');

const ENDPOINT = 'https://api.monday.com/v2';
const MONDAY_AUTH_TOKEN = process.env.MONDAY_AUTH_TOKEN;

axios.defaults.headers.common['Authorization'] = MONDAY_AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const createTask = async (taskName, boardId, groupId) => {
  const { status, data } = await axios.post(ENDPOINT, {
    query: `mutation {create_item(board_id: ${boardId}, group_id: "${groupId}", item_name: "${taskName}") {id} }`
  });
  if (status !== 200) {
    return {
      success: false,
      body: 'Something went wrong'
    }
  }
  if (data['errors']) {
    return {
      success: false,
      body: data['errors'][0].message
    }
  }
  return {
    success: true,
    body: data['data']['create_item']['id']
  }
};

module.exports = {
  createTask
};