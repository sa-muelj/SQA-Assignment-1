const express = require('express');
const authRouter = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const session = require('express-session'); // required libraries

authRouter.get('/register', async (req, res) => { // display register page
    res.render('register');
});

authRouter.post('/register', async (req, res) => { // POST for registering a user
    let { username, password } = req.body;
    
    username = username.trim();
    password = password.trim();                    // removes trailing whitespaces

    if (username == "" || password == "") {        // required fields server side check
        console.log({
            status: "FAILED",
            message: "Empty input fields provided! Please provide data for these fields"
        });
    } else if (password.length < 8) {              // password policy check
        console.log({
            status: "FAILED",
            message: "Password is too short! A strong password should be at least 8 characters long"
        });
    } else {                                       // Check if the user already exists
        
        const userFound = await User.findAll({     // sequelize WHERE query to retrieve usernames - unique field server side check
            where: {
                username: req.body.username,
            },
        });

        if (userFound.length !== 0) {              // If a user already exists
            console.log({
                status: "FAILED",
                message: "User already exists"
            });
        } else {                                   // Password encryption
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
                try {
                    const newUser = await User.create({ 
                        username: req.body.username, 
                        password: hashedPassword 
                    });
                    res.redirect('/user/login');
                    console.log({
                        status: "SUCCESS",
                        message: "Account created successfully",
                        data: newUser
                    });
                } catch (err) {
                    console.log({
                        status: "FAILED",
                        message: "An error occurred while creating user account"
                    });
                }
            }).catch(err => {
                console.log({
                    status: "FAILED",
                    message: "An error occurred while hashing password"
                });
            });
        }
    }
});


authRouter.get('/login', (req, res) => {
    if (req.session && req.session.username) {
      return res.redirect('/');                    // If the user is logged in, redirect them to the home page
    }
    res.render('login');                           // Render the login page if not logged in
  });
  

authRouter.post('/login', async (req, res) => {    // POST to allow user to login
    let { username, password } = req.body;
    username = username.trim();
    password = password.trim();                    // Remove trailing whitespaces
    if (username == "" || password == "") {        // Server side validation - empty fields
        console.log({
            status: "FAILED",
            message: "Empty fields"
        });
    } else {                                       // Check if the user exists
        const userFound = await User.findAll({     // Find user requested to compare to
            where: {
                username: req.body.username,
            },
        });

        if (userFound.length !== 0) {              // if user exists, compare hashedPassword to password given
            const hashedPassword = userFound[0].password;
            bcrypt.compare(password, hashedPassword).then((result) => {
                if (result) {
                    const sessionData = req.session;
                    sessionData.username = username;    // Create session and assign username to session
                    res.redirect('/');
                    console.log({
                        status: "SUCCESS",
                        message: "Signin Successful",
                        data: userFound,
                        data2: sessionData
                    });
                } else {
                    console.log({
                        status: "FAILED",
                        message: "Invalid password entered"
                    });
                }
            }).catch((err) => {
                console.log({
                    status: "FAILED",
                    message: "An error occurred while comparing password"
                });
            });
        } else {
            console.log({
                status: "FAILED",
                message: "Invalid credentials"
            });
        }
    }
});

authRouter.get('/logout', (req, res) => {          // Logout route
    if (req.session) {                             // if session exists
      req.session.destroy((err) => {               // destory session
        if (err) {
          return res.status(500).json({ message: 'Failed to log out' });
        }  
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login'); // Redirect to the login page after logout
      });
    } else {                                       // If the session doesn't exist, just redirect to the login page
      res.redirect('/login');
    }
  });
  

module.exports = authRouter;
