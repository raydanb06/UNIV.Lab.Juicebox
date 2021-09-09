const { client, getAllUsers } = require('./index');

testDB = async () => {
  try {
    client.connect();

    const users = await getAllUsers();
    console.log(users);
  } catch (error) {
    console.error(error);
  } finally {
    client.end();
  }
}

dropTables = async () => {
  try {
    await client.query(`
      DROP TABLE IF EXISTS users;
    `);
  } catch (error) {
    throw error;
  }
}

createTables = async () => {
  try {
    await client.query(`

  `);
  } catch (error) {
    throw error;
  }
}

rebuildDB = async () => {
  try {
    client.connect();

    await dropTables();
    await createTables();
  } catch (error) {
    console.error(error);
  } finally {
    client.end();
  }
}

testDB();