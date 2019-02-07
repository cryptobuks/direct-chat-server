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
    email: {
      primaryKey: true,
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
    pw: {
      type: Sequelize.STRING,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['email',],
      },
    ],
  }
);

User.sync({ force: process.env.DB_RESET === 'true', }).then(() => {
  return User.create({
    email: ai.email,
    name: ai.name,
    status: ai.status,
    image: ai.image,
  }).catch(function(err) {
    console.log(err.message);
  });
});

const Contact = sequelize.define(
  'contact',
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUIDV4,
      defaultValue: () => uuid(),
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['id',],
      },
    ],
  }
);

Contact.belongsTo(User, { foreignKey: { name: 'contact', }, });
Contact.belongsTo(User, { foreignKey: { name: 'me', }, });
Contact.sync({ force: process.env.DB_RESET === 'true', });

const Recent = sequelize.define(
  'recent',
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUIDV4,
      defaultValue: () => uuid(),
    },
    time: {
      type: Sequelize.BIGINT,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['id',],
      },
    ],
  }
);

Recent.belongsTo(User, { foreignKey: { name: 'contact', }, });
Recent.belongsTo(User, { foreignKey: { name: 'me', }, });
Recent.sync({ force: process.env.DB_RESET === 'true', });

const Notification = sequelize.define(
  'notification',
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUIDV4,
      defaultValue: () => uuid(),
    },
    type: {
      type: Sequelize.STRING,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['id',],
      },
    ],
  }
);

Notification.belongsTo(User, { foreignKey: { name: 'me', }, });
Notification.belongsTo(User, { foreignKey: { name: 'contact', }, });
Notification.sync({ force: process.env.DB_RESET === 'true', });

module.exports = { User, Contact, Recent, Notification, };
