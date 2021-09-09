const { 
  client, 
  getAllUsers,
  createUser
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

createInitialUsers = async () => {
  try {
    console.log('Starting to create users...');

    const albert = await createUser({ username: 'albert', password: 'bertie99'});
    const albert2 = await createUser({ username: 'albert', password: 'imposter_albert'});

    console.log(albert);

    console.log('Finished creating users!');
  } catch (error) {
    console.error('Error creating users!');
    throw error;
  }
}

rebuildDB = async () => {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
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