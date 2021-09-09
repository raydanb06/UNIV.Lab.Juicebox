const { 
  client, 
  getAllUsers 
} = require('./index');

dropTables = async () => {
  try {
    console.log('Starting to drop tables...')

    await client.query(`
      DROP TABLE IF EXISTS users;
    `);

    console.log('Finished dropping tables!');
  } catch (error) {
    console.error('Error dropping tables!')
    throw error;
  }
}

createTables = async () => {
  try {
    console.log('Starting to build tables...');

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL
      );
    `);

    console.log('Finished buliding tables!');
  } catch (error) {
    console.error('Error building tables!')
    throw error;
  }
}

rebuildDB = async () => {
  try {
    client.connect();

    await dropTables();
    await createTables();
  } catch (error) {
    throw error;
  } 
}

testDB = async () => {
  try {
    console.log('Starting to test database...');

    const users = await getAllUsers();
    console.log('getAllUsers: ', users)

    console.log('Finished database tests!');
  } catch (error) {
    console.error('Error testing database!')
    console.error(error);
  } finally {
    client.end();
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());