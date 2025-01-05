const express = require('express');
const routerBlog = express.Router();
const { BlogPost } = require('../models');


routerBlog.get('/create', (req, res) => {
  res.render('create', { title: 'Create Post' });
});

routerBlog.post('/create', async (req, res) => {
  await BlogPost.create(req.body);
  res.redirect('/');
});

routerBlog.get('/post/:id', async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (post) {
    res.render('post', { title: post.title, post });
  } else {
    res.status(404).send('Post not found');
  }
});

routerBlog.get('/edit/:id', async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (post) {
    res.render('edit', { title: 'Edit Post', post });
  } else {
    res.status(404).send('Post not found');
  }
});

routerBlog.post('/edit/:id', async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (post) {
    await post.update(req.body);
    res.redirect(`/post/${post.id}`);
  } else {
    res.status(404).send('Post not found');
  }
});

routerBlog.post('/delete/:id', async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (post) {
    await post.destroy();
    res.redirect('/');
  } else {
    res.status(404).send('Post not found');
  }
});

routerBlog.get('/stats', async (req, res) => {
  const posts = await BlogPost.findAll();
  const lengths = posts.map(post => post.title.length + post.content.length);
  const stats = {
    average_length: lengths.reduce((a, b) => a + b, 0) / lengths.length,
    median_length: lengths.sort((a, b) => a - b)[Math.floor(lengths.length / 2)],
    max_length: Math.max(...lengths),
    min_length: Math.min(...lengths),
    total_length: lengths.reduce((a, b) => a + b, 0)
  };
  res.render('stats', { title: 'Post Statistics', ...stats });
});

routerBlog.get('/search', (req, res) => {  
  res.render('search', { title: 'Search Posts' });  
});  



module.exports = routerBlog;

