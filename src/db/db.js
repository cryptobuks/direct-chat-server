const Sequelize = require('sequelize');
const paths = require('../paths');
const uuid = require('uuid/v4');
const ai = require('../model/ai');

const sequelize = new Sequelize(
  'dc',
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'sqlite',
    operatorsAliases: false,
    define: {
      timestamps: false, // true by default
      freezeTableName: true, // disable pluralization
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    // SQLite only
    storage: paths.storage,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const User = sequelize.define(
  'user',
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUIDV4,
      defaultValue: () => uuid(),
    },
    email: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'online',
    },
    image: {
      type: Sequelize.STRING,
      defaultValue: 'default-avatar.svg',
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['id', 'email',],
      },
    ],
  }
);

const Contact = sequelize.define(
  'contact',
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUIDV4,
      defaultValue: () => uuid(),
    },
    user: {
      primaryKey: true,
      type: Sequelize.UUIDV4,
      references: { model: 'user', key: 'id', },
    },
    contact: {
      primaryKey: true,
      type: Sequelize.UUIDV4,
      references: { model: 'user', key: 'id', },
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['id', 'user',],
      },
    ],
  }
);

User.sync({ force: process.env.DB_RESET === 'true', }).then(() => {
  // Table created
  return User.create({
    email: ai.email,
    name: ai.name,
    status: ai.status,
    image: ai.image,
  }).catch(function(err) {
    console.log(err.message);
  });
});

Contact.sync({ force: process.env.DB_RESET === 'true', });

findUserByEmail = async email => {
  email = email.toLowerCase();
  const user = await User.findOne({
    where: {
      email,
    },
    raw: true,
  });

  if (user) {
    return user;
  } else {
    return null;
  }
};

addUser = async contact => {
  await User.create(contact);
};

module.exports = { findUserByEmail, addUser, };
