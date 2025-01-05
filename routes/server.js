const express = require('express');
const routerServer = express.Router();
const { BlogPost, User } = require('../models');
const bcrypt = require('bcrypt');

routerServer.use(express.urlencoded({ extended: false }));

routerServer.get('/', async (req, res) => {
  const posts = await BlogPost.findAll();
  res.render('index', { title: 'Blog Posts', posts, name: 'Samuel'});
});

routerServer.get('/login', (req, res) => {
    res.render('login')
});

routerServer.get('/register', async (req, res) => {
    res.render('register');
});

var hashPassword = async function(req, res, next) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    next(); 
};

routerServer.post('/register', hashPassword, async (req, res) => {
    try {
        await User.create(req.body);
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    console.log(req.body)
});

routerServer.post('/login', (req, res) => {
    
});

module.exports = routerServer; 