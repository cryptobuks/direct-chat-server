const Sequelize = require('sequelize');
const paths = require('../paths');

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
    email: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
    image: {
      type: Sequelize.STRING,
    },
  },
  {
    indexes: [
      // Create a unique index on email
      {
        unique: true,
        fields: ['email',],
      },
    ],
  }
);

if (process.env.DB_RESET === 'true') {
  // force: true will drop the table if it already exists
  User.sync({ force: true, }).then(() => {
    // Table created
    return User.create({
      email: 'hancock.ai@dc.com',
      name: 'Hancock',
    });
  });
}
