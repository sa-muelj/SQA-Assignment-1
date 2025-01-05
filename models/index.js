const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  Password: {
    type: DataTypes.STRING(30),
    allowNull: true
  }
}, { 
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});


module.exports = { sequelize, BlogPost, User };

