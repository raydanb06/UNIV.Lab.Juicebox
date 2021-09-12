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

const createPost = async ({ authorId, title, content, tags = [] }) => {
  try {
    const { rows: [ post ] } = await client.query(`
      INSERT INTO posts("authorId", title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [ authorId, title, content ]);

    const tagList = await createTags(tags);

    return await addTagsToPost(post.id, tagList);
  } catch (error) {
    throw error;
  }
};

const updatePost = async (id, fields = {}) => {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }
  
  try {
    const { rows: [ post ] } = await client.query(`
      UPDATE posts
      SET ${ setString }
      WHERE id = ${ id }
      RETURNING *;
    `, Object.values(fields));

    return post;
  } catch (error) {
    throw error;
  }
};

const getAllPosts = async () => {
  try {
    const { rows: postIds } = await client.query(`
      SELECT id
      FROM posts;
    `);

    const posts = await Promise.all(postIds.map(
      post => getPostById( post.id )
    ));

    return posts;
  } catch (error) {
    console.error(error);
  }
};

const getPostsByUser = async (userId) => {
  try {
    const { rows: postIds } = await client.query(`
    SELECT id
    FROM posts
    WHERE "authorId" = $1
    `, [userId]);

    const posts = await Promise.all(postIds.map(
      post => getPostById( post.id )
    ));

    return posts;
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
  console.log('createTags function...');
  
  if (tagList.length === 0) {
    return;
  };

  const insertValues = tagList.map(
    (_, index) => `$${ index + 1}`)
    .join('), (');
  console.log('insertValues:', insertValues)

  const selectValues = tagList.map(
    (_, index) => `$${ index + 1}`)
    .join(', ');
  console.log('selectValues:', selectValues)

  try {
    console.log('Inserting tags...')
    const { rows: tags } = await client.query(`
      INSERT INTO tags(name)
      VALUES (${ insertValues })
      ON CONFLICT (name) DO NOTHING;
    `, Object.values(tagList));
    console.log('Made it through insertValues...')

    console.log('Selecting tags...')
    console.log(Object.values(tagList))
    const { rows } = await client.query(`
      SELECT * FROM tags
      WHERE name
      IN (${ selectValues });
    `, Object.values(tagList));

    console.log('End createTags function...')
    return rows;
  } catch (error) {
    console.error(error);
  }
}

const createPostTag = async (postId, tagId) => {
  try {
    await client.query(`
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
    `, [ postId, tagId ]);
  } catch (error) {
    console.error(error);
  }
}

const addTagsToPost = async (postId, tagList) => {
  try {
    const createPostTagPromises = tagList.map(
      tag => createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}

const getPostById = async (postId) => {
  try {
    const { rows: [ post ] } = await client.query(`
    SELECT *
    FROM posts
    WHERE id = $1;
    `, [postId]);

    const { rows: tags } = await client.query(`
      SELECT tags.*
      FROM tags
      JOIN post_tags on tags.id=post_tags."tagId"
      WHERE post_tags."postId" = $1;
    `, [postId]);

    const { rows: [ author ] } = await client.query(`
      SELECT id, username, name, location
      FROM users
      WHERE id = $1;
    `, [post.authorId]);

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    throw error;
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
  getUserById,
  createTags,
  createPostTag,
  addTagsToPost,
  getPostById
}