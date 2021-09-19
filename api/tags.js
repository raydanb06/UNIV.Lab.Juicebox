const express = require('express');
const tagsRouter = express.Router();

const { getAllTags, 
        getPostsByTagName 
      } = require('../db');

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

// /api/tags
tagsRouter.get('/', async (req, res) => {
  const tags = await getAllTags();
  
  res.send({
    tags
  });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  try {
    const tagName = req.params.tagName;
    
    const posts = await getPostsByTagName(tagName);

    res.send({
      posts
    });
  } catch ({ name, message }) {
    next({
      name: 'SearchTagError',
      message: `Unable to get tags of: ${ tagName }`
    });
  }

})

module.exports = tagsRouter;