const app = require('../app');
const request = require('supertest');
const User = require('../models/index');

describe('/user/register', () => {
    it('GET - should return status 200 and render /register', async () => {
      const response = await request(app).get('/register');
    
      // Check if status is 200
      expect(response.status).toBe(200);
    });

    it('POST - when given a unique username and a strong password, should create a new user in the database and redirect to "/"', async() => {
        
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

      


        



    




    
    });
  });