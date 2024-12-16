### 1. Initialize the Project

First, create a new directory for your project and initialize it with npm:

```sh
mkdir express-pug-sqlite-blog
cd express-pug-sqlite-blog
npm init -y
```

### 2. Install Dependencies

Install the necessary dependencies:

```sh
npm install express pug
npm install --save-dev nodemon
```

### 3. Set Up the Basic Express Server

Create the `app.js` file to set up the Express server with Pug as the view engine:

```js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/create', (req, res) => {
    res.render('create', { title: 'Create Post' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
```

### 4. Create Initial Routes and Views

In this step, we will move the route definitions from `app.js` to a separate `blog.js` file for better organization.

Create the `blog.js` file to define the initial routes for the index and create pages:

```js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

router.get('/create', (req, res) => {
    res.render('create', { title: 'Create Post' });
});

module.exports = router;
```

Update `app.js` to use the new routes:

```js
const blogRouter = require('./routes/blog');
app.use('/', blogRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
```

Create the following Pug templates in the `views` directory:

`layout.pug`

```pug
doctype html
html
    head
        title= title
    body
        header
            nav
                ul
                    li
                        a(href="/") Home
                    li
                        a(href="/create") Create Post
        main
            h1= title
            block content
```

`index.pug`

```pug
extends layout

block content
    ul
        each post in posts
            li
                a(href=`/post/${post.id}`) #{post.title} by #{post.author} (#{post.created_at.toLocaleDateString()})
```

`create.pug`

```pug
extends layout

block content
    form(action="/create", method="POST")
        input(type="text", name="title", placeholder="Title", required)
        input(type="text", name="author", placeholder="Author", required)
        textarea(name="content", placeholder="Content", required)
        button(type="submit") Create
```

### 5. Add Sequelize for Database Handling

Install Sequelize and SQLite dependencies:

```sh
npm install sqlite3 sequelize
```

Create the `database.js` file to configure the SQLite database connection using Sequelize:

```js
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite')
});

module.exports = sequelize;
```

Create the `index.js` file to define the BlogPost model using Sequelize:

```js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');

const BlogPost = sequelize.define('BlogPost', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
});

module.exports = { sequelize, BlogPost };
```

Update `app.js` to include Sequelize:

```js
const { sequelize } = require('./models');

sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
```

### 6. Update Routes to Handle Form Submissions and Creation

Update `blog.js` to handle form submissions and create blog posts:

```js
const { BlogPost } = require('../models');

router.post('/create', async (req, res) => {
    await BlogPost.create(req.body);
    res.redirect('/');
});

module.exports = router;
```

### 7. Add Remaining Routes and Views

Update `blog.js` to include routes for viewing individual posts, editing, and statistics:

```js
router.get('/post/:id', async (req, res) => {
    const post = await BlogPost.findByPk(req.params.id);
    res.render('post', { title: post.title, post });
});

router.get('/edit/:id', async (req, res) => {
    const post = await BlogPost.findByPk(req.params.id);
    res.render('edit', { title: `Edit ${post.title}`, post });
});

router.post('/edit/:id', async (req, res) => {
    const post = await BlogPost.findByPk(req.params.id);
    await post.update(req.body);
    res.redirect(`/post/${post.id}`);
});

router.post('/delete/:id', async (req, res) => {
    const post = await BlogPost.findByPk(req.params.id);
    await post.destroy();
    res.redirect('/');
});

router.get('/stats', async (req, res) => {
    const posts = await BlogPost.findAll();
    const lengths = posts.map(post => post.content.length);
    const stats = {
        average_length: lengths.reduce((a, b) => a + b, 0) / lengths.length,
        median_length: lengths.sort((a, b) => a - b)[Math.floor(lengths.length / 2)],
        max_length: Math.max(...lengths),
        min_length: Math.min(...lengths),
        total_length: lengths.reduce((a, b) => a + b, 0)
    };
    res.render('stats', { title: 'Post Statistics', ...stats });
});

module.exports = router;
```

Create the following additional Pug templates in the `views` directory:

`post.pug`

```pug
extends layout

block content
    p.post-meta By #{post.author} (Posted on #{post.created_at.toLocaleString()})
    p.post-content= post.content
    a(href=`/edit/${post.id}`) Edit Post
```

`edit.pug`

```pug
extends layout

block content
    form(action=`/edit/${post.id}`, method="POST")
        input(type="text", name="title", value=post.title, required)
        textarea(name="content", required)= post.content
        button(type="submit") Save Changes

    form(action=`/delete/${post.id}`, method="POST")
        button(type="submit", class="danger") Delete Post
```

`stats.pug`

```pug
extends layout

block content
    p Average: #{average_length.toFixed(2)} characters
    p Median: #{median_length.toFixed(2)} characters
    p Maximum: #{max_length.toFixed(2)} characters
    p Minimum: #{min_length.toFixed(2)} characters
    br
    p Total length of all posts: #{total_length.toFixed(2)} characters
```

### 8. Add Styles

Create the `styles.css` file to add some basic styles:

```css
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background: #f4f4f4;
}

header {
    background: #333;
    color: #fff;
    padding: 1rem;
    text-align: center;
}

nav ul {
    list-style: none;
    padding: 0;
}

nav ul li {
    display: inline;
    margin-right: 1rem;
}

a {
    color: #333;
    text-decoration: none;
}

button {
    background: #333;
    color: #fff;
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;
}

button.danger {
    background: #ff0000;
}
```

### 9. Run the Application

Start the application using the following command:

```sh
npm start
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).