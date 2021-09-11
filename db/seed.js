const { 
  client, 
  getAllUsers,
  createUser,
  updateUser
} = require('./index');

const dropTables = async () => {
  try {
    console.log('Starting to drop tables...')

    await client.query(`
    DROP TABLE IF EXISTS posts;  
    DROP TABLE IF EXISTS users;
    `);

    console.log('Finished dropping tables!');
  } catch (error) {
    console.error('Error dropping tables!')
    throw error;
  }
}

const createTables = async () => {
  try {
    console.log('Starting to build tables...');

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        location varchar(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

    await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

    console.log('Finished buliding tables!');
  } catch (error) {
    console.error('Error building tables!')
    throw error;
  }
}

const createInitialUsers = async () => {
  try {
    console.log('Starting to create users...');

    const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'AZ'});
    const sandra = await createUser({ username: 'sandra', password: '2sandy4me', name: 'San Dra', location: 'CA'});
    const glamgal = await createUser({ username: 'glamgal', password: 'soglam', name: 'Glam Gal', location: 'HI'});

    console.log('Finished creating users!');
  } catch (error) {
    console.error('Error creating users!');
    throw error;
  }
}

const rebuildDB = async () => {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    throw error;
  } 
}

const testDB = async () => {
  try {
    console.log('Starting to test database...');

    console.log('Calling getAllusers...');
    const users = await getAllUsers();
    console.log('getAllUsers: ', users);

    console.log('Calling updateUser on users[0]...');
    const updateUserResult = await updateUser(users[0].id, {
      name: 'Newname Sogood',
      location: 'Lesterville, KY'
    });
    console.log('updateUser: ', updateUserResult);

    console.log('Finished database tests!');
  } catch (error) {
    console.error('Error testing database!')
    console.error(error);
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());