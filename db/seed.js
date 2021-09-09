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
    
    `);
  } catch (error) {
    throw error;
  }
}

testDB();