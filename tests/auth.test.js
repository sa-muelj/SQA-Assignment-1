const app = require('../app');
const request = require('supertest');
const User = require('../models/index');

describe('/user/register', () => {
    it('GET - should return status 200 and render /register', async () => {
      const response = await request(app).get('/register');
    
      // Check if status is 200
      expect(response.status).toBe(200);
    });

    it('POST - when given a unique username and a strong password, should create a new user in the database, and redirect to "/user/login"', async() => {
        
        const uniqueUsername = toString(Math.floor(Math.random() * (999999 - 1 + 1)) + 1);
        const strongPassword = "12345678";
        const usersBefore = User.findAll();
        const lengthBefore = usersBefore.length;
        

        await request(app).
        post('/user/register').
        end(
          (req, res) => {
            req = { "username" : uniqueUsername, "password" : strongPassword };
          }),
        
        expect(res.status).toBe(200);

        const usersAfter = User.findAll();
        const lengthAfter = usersAfter.length;

        expect(lengthAfter).toBe(lengthBefore + 1);
        expect(req.path).toBe("/user/login");
          
    });

    it('POST - when given a blank username and password, it should return the flash message "Empty input fields provided! Please provide data for these fields" and redirect to /user/register"', async() => {
        
      const uniqueUsername = '';
      const strongPassword = "";
      const usersBefore = User.findAll();
      const lengthBefore = usersBefore.length;
      

      await request(app).
      post('/user/register').
      end(
        (req, res) => {
          req = { "username" : uniqueUsername, "password" : strongPassword };
        }),
      
      expect(res.status).toBe(400);
      expect(req.message).toBe("Empty input fields provided! Please provide data for these fields");

      const usersAfter = User.findAll();
      const lengthAfter = usersAfter.length;

      expect(lengthAfter).toBe(lengthBefore);
      expect(req.path).toBe("/user/register");
      expect(req.session).toBeNull();
        
    });

    it('POST - when given a username that already exists and a password, it should return the flash message "Username already exists! Please choose another" and redirect to /user/register"', async() => {
        
      const uniqueUsername = 'samuel1';
      const strongPassword = "12345678";
      const usersBefore = User.findAll();
      const lengthBefore = usersBefore.length;
      

      await request(app).
      post('/user/register').
      end(
        (req, res) => {
          req = { "username" : uniqueUsername, "password" : strongPassword };
        }),
      
      expect(res.status).toBe(400);
      expect(req.message).toBe("Username already exists! Please choose another");

      const usersAfter = User.findAll();
      const lengthAfter = usersAfter.length;

      expect(lengthAfter).toBe(lengthBefore);
      expect(req.path).toBe("/user/register");
      expect(req.session).toBeNull();

    });
  });

  describe('/user/login', () => {
    it('GET - should return status 200 and render /login', async () => {
      const response = await request(app).get('/login');
    
      // Check if status is 200
      expect(response.status).toBe(200);
    });

    it('POST - when given a correct username and password, should create a new session, and redirect to "/"', async() => {
        
        const uniqueUsername = 'samuel1';
        const strongPassword = "12345678";
        
        await request(app).
        post('/user/login').
        end(
          (req, res) => {
            req = { "username" : uniqueUsername, "password" : strongPassword };
          }),
        
        expect(res.status).toBe(200);
        expect(req.path).toBe("/");
        expect(req.session).not.toBeNull();
          
    });

    it('POST - when given a blank username and password, it should return the flash message "Invalid username or password. Please try again!" and redirect to /user/login"', async() => {
        
      const uniqueUsername = '';
      const strongPassword = "";


      await request(app).
      post('/user/login').
      end(
        (req, res) => {
          req = { "username" : uniqueUsername, "password" : strongPassword };
        }),
      
      expect(res.status).toBe(400);
      expect(req.message).toBe("Invalid username or password. Please try again!");

      expect(req.path).toBe("/user/login");
      expect(req.session).toBeNull();
        
    });

    it('POST - when given a username that exists but an password, it should return the flash message "Invalid username or password. Please try again!" and redirect to /user/login"', async() => {
        
      const uniqueUsername = 'toString(Math.floor(Math.random() * (999999 - 1 + 1)) + 1)';
      const strongPassword = "12345678";
      const usersBefore = User.findAll();
      const lengthBefore = usersBefore.length;
      

      await request(app).
      post('/user/login').
      end(
        (req, res) => {
          req = { "username" : uniqueUsername, "password" : strongPassword };
        }),
      
      expect(res.status).toBe(400);
      expect(req.message).toBe("Invalid username or password. Please try again!");


      expect(lengthAfter).toBe(lengthBefore);
      expect(req.path).toBe("/user/login");
      expect(req.session).toBeNull();

    });
  });