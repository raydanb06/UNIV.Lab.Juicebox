const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

getAllUsers= async () => {
  const { rows } = await client.query(
    `SELECT id, username
    FROM users;
  `);

  return rows;
}

createUser = async ({ username, password} ) => {
  try {
    const result = await client.query(`
    
    `);

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers
}