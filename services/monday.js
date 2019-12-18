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
    };
  }
  if (data['errors']) {
    return {
      success: false,
      error: data['errors'][0].message
    };
  }
  return {
    success: true,
    data: data['data']
  };
};

const createItem = async (taskName, boardId, groupId) => {
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
    };
  }
  return {
    success: true,
    id: requiredUser.id
  };
};

const getAllItems = async () => {
  const query = `
    query {
      boards {
        items {
          id,
          name,
          column_values {
            id,
            text,
            value
          }
        }
      }
    }
  `;
  const { success, error, data } = await callMondayAPI(query);
  if (!success) {
    return {
      success,
      error
    };
  }
  return data['boards'].reduce((acc, curr) => {
    acc.push(...curr.items);
    return acc;
  }, []);
};

const filterUnfinishedItems = (items) => {
  const res = [];
  for (let item of items) {
    for (let column of item.column_values) {
      if (column.id === 'status') {
        if (column.value === null) {
          res.push(item);
        }
        break;
      }
    }
  }
  return res;
};

const filterItemsByUserId = (items, userId) => {
  const res = [];
  for (let item of items) {
    for (let column of item.column_values) {
      if (column.id === 'person') {
        const val = JSON.parse(column.value);
        if (val && val.id === userId) {
          res.push(item);
        }
        break;
      }
    }
  }
  return res;
};

const filterByDate = (items, date) => {
  const res = [];
  for (let item of items) {
    for (let column of item.column_values) {
      if (column.id.startsWith('date')) {
        if (column.text === date) {
          res.push(item);
        }
        break;
      }
    }
  }
  return res;
};

const getUserUnfinishedTasks = async (userId) => {
  const items = await getAllItems();
  const unfinishedItems = filterUnfinishedItems(items);
  const userUnfinishedItems = filterItemsByUserId(unfinishedItems, userId);
  return {
    success: true,
    tasks: userUnfinishedItems
  };
};

const getUserUnfinishedTasksToday = async (userId) => {
  const fullDate = new Date(Date.now()).toISOString();
  const [date] = fullDate.split('T');
  const { tasks } = await getUserUnfinishedTasks(userId);
  return {
    success: true,
    tasks: filterByDate(tasks, date)
  };
};

const assignItem = (boardId, itemId, userId) => {
  const query = `
    mutation {
      change_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: "person", value:"{\"id\":${userId}}") {
        id
      }
    }
  `;
  console.log(query);
  return callMondayAPI(query);
};

module.exports = {
  createItem,
  assignItem,
  getUserIdByEmail,
  getUserUnfinishedTasks,
  getUserUnfinishedTasksToday
};