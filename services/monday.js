const axios = require('axios');

const ENDPOINT = 'https://api.monday.com/v2';
const MONDAY_AUTH_TOKEN = process.env.MONDAY_AUTH_TOKEN;

axios.defaults.headers.common['Authorization'] = MONDAY_AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const createTask = (taskName, boardId, groupId) => {
  return axios.post(ENDPOINT, {
    query: `mutation {create_item (board_id: ${boardId}, group_id: ${groupId}, item_name: ${taskName}) {id} }`
  });
};

module.exports = {
  createTask
};