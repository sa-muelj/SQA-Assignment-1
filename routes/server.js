if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config
}

const express = require('express');
const routerServer = express.Router();
const { BlogPost, User } = require('../models');
const bcrypt = require('bcrypt');
const initialisePassport = require('../passport-config');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

initialisePassport(
    passport,
    async username =>  {
    const usernameFound = await User.findAll({
        where: {
          username: username
        }
      });
        console.log(usernameFound)
        return usernameFound
    }
)

routerServer.use(express.urlencoded({ extended: false }));
routerServer.use(flash())
routerServer.use(session({
    secret: 'some_secret',
    resave: false,
    saveUninitialized: false
}
))

routerServer.use(passport.initialize())
routerServer.use(passport.session())

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
        await User.create({username: req.body.username, password: req.body.password});
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    console.log('user made =')
    console.log(req.body)
});

routerServer.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

module.exports = routerServer; 