const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

const getAllUsers = async () => {
  try {
    const { rows } = await client.query(
      `SELECT id, username, name, location, active
      FROM users;
    `);

    return rows;
  } catch (error) {
    console.error(error);
  }
};

const createUser = async ({ username, password, name, location }) => {
  try {
    const { rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password, name, location)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `, [username, password, name, location]);
    console.log('createUser: ', user)
    return user;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, fields = {}) => {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ user ] } = await client.query(`
      UPDATE users
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    return user;
  } catch (error) {
    throw error;
  }
};

const createPost = async ({ authorId, title, content }) => {
  try {
    const { rows: [ post ] } = await client.query(`
      INSERT INTO posts("authorId", title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [ authorId, title, content ]);
    console.log('createPost: ', post)

    return post;
  } catch (error) {
    throw error;
  }
};

const updatePost = async (id, { title, content, active }) => {
  try {
    const { rows: [ post ] } = await client.query(`
      UPDATE posts
      SET "title" = $1, "content" = $2, "active" = $3
      WHERE id = $4
      RETURNING *;
    `, [ title, content, active, id ]);

    return post;
  } catch (error) {
    throw error;
  }
};

const getAllPosts = async () => {
  try {
    const { rows } = await client.query(
      `SELECT id, "authorId", title, content, active
      FROM posts;
    `);

    return rows;
  } catch (error) {
    console.error(error);
  }
};

const getPostsByUser = async (userId) => {
  try {
    const { rows } = await client.query(`
    SELECT * FROM posts
    WHERE "authorId" = $1
    `, [userId]);

    return rows;
  } catch (error) {
    console.error(error);
  }
};

const getUserById = async (userId) => {
  try {
    const { rows: [user] } = await client.query(`
      SELECT * FROM users
      WHERE id = $1
    `, [ userId ]);
    user.posts = await getPostsByUser(userId);

    return user;
  } catch (error) {
    console.error(error);
  }
};

const createTags = async (tagList) => {
  if (tagList.length === 0) {
    return;
  };

  const insertValues = tagList.map(
    (_, index) => `$${ index + 1}`)
    .join(', ');

  const selectValues = tagList.map(
    (_, index) => `$${ index + 1}`)
    .join(', ');

  try {
    const { row: tags } = await client.query(`
      INSERT INTO tags(name)
      VALUES ${ insertValues }
      ON CONFLICT (name) DO NOTHING;
    `, [ tagList ]);

    const { row: [tag] } = await client.query(`
      SELECT * FROM tags
      WHERE name
      IN ${ selectValues }
    `, [ tagList ]);

    return tag;
  } catch (error) {
    console.error(error);
  }
} 

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById
}