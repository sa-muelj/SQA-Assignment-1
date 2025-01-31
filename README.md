### 1. Team Contributions

The project team consists of Samuel Jones and Hannah Openshaw. In line with the assignment brief, two additional features were created, those being User Authentication and Blog Post Management. To make work as efficient as possible, the two features were individually assigned – this includes all development work and initial testing and writing of tests. Each member also peer reviewed the other feature branch where necessary by pull request. Overall:
Samuel: User Management, Initial Project Setup, GitHub Action creation, GitHub cleanliness/management, ReadMe
Hannah: Blog Post Management, Test Case ideation, ReadMe,  GitHub cleanliness/management

### 2. Setup Instructions

Once access has been granted to this repository, please either clone ‘main’ to your local drive OR create a personal codespace attached to the ‘main’ branch. Open a terminal and type
```
npm start
```
 and use the pop up to navigate to the correct port to view the app in a web browser.
Create an account by using the ‘Register’ button, and then log in with your credentials. From here, you will have access to the application and can create, view, search posts and see statistics for posts. Once finished, please logout to ensure your account remains secure and no other users can gain access.

The app can be tested by entering 
```
npx jest
```
into a terminal.


### 3. Features

The app features consist of:
-	User authentication. Users can register an account, log in and log out. By logging in a session is created keeping the user’s environment private from other users.
-	CRUD operations. Posts can be created, read, updated and deleted from the blog.
-	Stats. Various statistics are available about the posts.
-	Search. A case insensitive search feature to find posts based on Title.



*Challenges and Solutions*

One challenge found was implementing a user authentication feature. There are various packages and node modules that exist, such as passportJS, which offers a complete package for authentication by username/password, OAuth integration as well as multiple authentication strategies. For this application, only a local strategy of username/password was needed, and implementing passportJS was overkill for our needs. This issue was solved by using a combination of express-session, express-flash and bcrypt to create our own user authentication strategy.


### 4. Evidence Summary

*Feature Implementation:*

Please use this link for a 2 minute video running through the features of the app [here](https://drive.google.com/file/d/1niPQb7EnqM59ptrjkXqsh7Jdz10acoH0/view?usp=drive_link).

auth.js holds all of the routes relevant to user authentication, including logging in, registration, session creation and logout.

Using express-session, express-flash and bcrypt, we use bcrypt to hash and compare passwords, create a session with express-session to hold cookies and session information as well as provide messages to the client side using express-flash. Messages focus around issues with empty fields, incorrect credentials or if a user already exists.

Within auth.js we also ensure that a user will automatically redirect to the blog router if a user is signed in and tries to navigate to any of the /user routes. Similarly, in app.js we ensure that a user cannot access any of the blog routes if a session does not exist. However, this introduces an issue – what if a user is trying to log in or register? They won’t have a session, but will be redirected to the login page, so on and so forth.

We include the below code block to ensure that a user does not enter into a redirect loop; as explained above, if they are trying to register or login, then a session won’t exist.

```
app.use((req, res, next) => {
  // Exclude /user/login and /user/register from session check - stops redirect loop
  if (req.path === '/user/login' || req.path === '/user/register') {
    return next(); // Skip session check for login route
  }

  if (!req.session || !req.session.username) {
    return res.redirect('/user/login'); // Redirect to login if no session or username is not set
  }

  next(); // Proceed to the next if the user is authenticated
});
```
For the search feature, we use the .like operator to perform a partial match on the field retrieved – this ensures that if we search ‘Javascript’, the title ‘Javascript examples’ will still be returned; and other examples. Also, we have not specified the database attribute is case sensitive, ensuring our search bar is case insensitive.
The code for this can be found in blog.js.

### 5. Testing approach

Due to the small features being implemented, we decided to retrospectively test our app using a testing framework. Throughout development, we tested the application manually, ensuring functionality acted as we expected. Part of this decision was due to our inexperience with the coding languages and libraries we were using; both of our roles at PwC are low-code based and involve different types of testing.

Whilst not conventional, we felt that this decision allowed us to work as efficiently as possible, whilst ensuring at each step we were developing according to our functionality. We had discussed what tests would look like, and how we should ensure that we are meeting our acceptance criteria without using jest, our chosen framework. For example, in testing user authentication we looked to black and white box test. We did this by initially testing ourselves, knowing what we had developed. Once complete, we passed it over to the other team member, with no knowledge of the new code, to try and find edge cases or issues. For our experience, we found this worked very well.

When we were finished with development, we wrote tests using the Jest framework in the ‘staging’ branch. When running the Jest suite, we received positive results:

![image](https://github.com/user-attachments/assets/48908831-bd88-412c-9f59-f3d0051240e3)

For edge cases and error handling, we implemented this into our Jest suite, using extreme values, incorrect values, empty fields and wrote against our functionality to ensure error handling was appropriate. Looking at the logs made show that our error handling routes were handled correctly. Whilst too long for the README, these can be read by running ‘npx jest’ in the terminal.

We noted it was important to run tests on edge cases that were covered by client side validation as well (specifics of this discussed later). For empty field validation, a request would never actually be made from a normal user, but direct requests could do this.

### 6. Security Enhancements

Update `blog.js` to handle form submissions and create blog posts:

*Field validation*

For client side, we have used the ‘required’ flag within the pug template:

```
input(type="text", name="username", placeholder="Username", required)
```
(taken from login.pug)

This produces the little pop up on a field when it is empty:

![image](https://github.com/user-attachments/assets/e1b2564a-2a3d-4bd3-a41c-33e8885bd8af)

For server side, we have implemented the allowNull flag within sequelize, to ensure that should someone try to directly request the app, they cannot enter an empty row into the table.

```
title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
```
(taken from index.js)

This is also checked within the route itself, with this line:

```
username == "" || password == "" || username == null || password == null
```
(taken from auth.js)

*Password Hashing*

We use the bcrypt library to implement password hashing. For this, in auth.js we hash our password before inserting the hash into the database – this ensures that a user’s actual password is never stored anywhere but their own memory (or password manager to be more secure!). When validating the password to log in, we use the bcrypt.compare() method to compare the given password with the hash. The good thing about the bcrypt.compare() method is that we don’t need to include any other information other than the hash and the given password – bcrypt handles the hashing algorithm itself, making it very accessible to implement.

*CSRF Attack Mitigation*

Cross Site request forgery attacks aim to trick a user’s browser to performing illegitimate actions on a website that they are already authenticated in to, by opening a link from a malicious email, for example. By including the following code when we create a session, (in particular, the sameSite flag being set to ‘strict’), this mitigates attacks. It denies cookie data being sent during cross-domain requests.

```
cookie: {
      secure: false,          // Set to true if using HTTPS
      sameSite: 'strict',     // Mitigate CSRF attacks
      maxAge: 90000           // Session expiration time (15 minutes)
  }
```
Alongside this, we set a maximum session age to 15 minutes to ensure should a user forget to log out, no one can access their account. In the case of testing locally, we have to set the secure flag to false, as local networks don’t support HTTPS. Whilst this hardcoded value can usually be handled using the dotenv library, with network restrictions on PwC laptops we cannot implement this feature.

### 7. Code Quality and Refactoring

To ensure code quality, we use ESLint to lint our codebase on the ‘staging’ branch. By using GitHub actions (details explained in the last section), we automatically run ESLint on the codebase. Whilst ESLint will throw errors for anything found against our Linting rules, by analysing the results we can deduce where issues are, correct them and recommit. To manually run ESLint, we can run ‘npx eslint’ in the terminal.

In terms of refactoring, we looked to separate the two features into different routes. All routes handled in auth.js can be accessed by the ‘/user/’ url path, separate from the ‘/’ path for all blog features. 

Across the codebase there were issues with single/double quotes and indents – using ESLint corrected these issues.

### 8. CI/CD and Git Practices Evidence

![image](https://github.com/user-attachments/assets/771b479d-59dc-4e9f-89f4-bb10a47535dd)

```
name: Lint

on: [push]

jobs:
  eslint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2  # Checkout code

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20.18.1'  # Specify your Node.js version

      - name: Install dependencies
        run: |
          npm install  # Install dependencies, including ESLint

      - name: Run ESLint
        run: |
          npx eslint --fix  # Run ESLint directly via npx
```
![image](https://github.com/user-attachments/assets/571b434c-f5f8-460f-b650-964542782c48)

![image](https://github.com/user-attachments/assets/0db7d3c8-aedd-4252-94eb-c20a506bd0dc)




