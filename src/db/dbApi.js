const Contact = require('../model/Contact');
const db = require('./db');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

getUserByEmail = async email => {
  email = email.toLowerCase();
  return await db.User.findOne({
    where: {
      email,
    },
    raw: true,
  });
};

getUserByEmailPw = async (email, pw) => {
  email = email.toLowerCase();
  return await db.User.findOne({
    where: {
      email,
      pw,
    },
    raw: true,
  });
};

addUser = async contact => {
  await db.User.create(contact);
};

addContact = async (user, contact) => {
  await db.Contact.create({ me: user.email, contact: contact.email, });
};

addNotification = async (myEmail, contactEmail, type) => {
  await removeNotification(myEmail, contactEmail);
  await db.Notification.create({
    me: myEmail,
    contact: contactEmail,
    type,
  });
};

removeNotification = async (myEmail, contactEmail) => {
  await db.Notification.destroy({
    where: {
      me: myEmail,
      contact: contactEmail,
    },
  });
};

getAllContacts = async () => {
  return await db.User.findAll({
    attributes: ['email', 'name', 'status', 'image',],
    raw: true,
  });
};

getNotifications = async email => {
  const notifications = await db.Notification.findAll({
    attributes: ['contact', 'type',],
    where: {
      me: email,
    },
    raw: true,
  });

  if (notifications.length === 0) {
    return [];
  }

  const contacts = [];
  for (let [key, notification,] of Object.entries(notifications)) {
    let contact = await db.User.findOne({
      attributes: ['email', 'name', 'status', 'image',],
      where: {
        email: notification.contact,
      },
      raw: true,
    });
    contact.type = notification.type;
    contacts.push(contact);
  }

  return contacts;
};

getContacts = async email => {
  console.log('dbApi:getContacts');

  let contacts = await db.Contact.findAll({
    attributes: ['contact',],
    where: {
      me: email,
    },
    raw: true,
  });

  if (contacts.length === 0) {
    return [];
  }
  contacts = contacts.map(contact => contact.contact);

  return await db.User.findAll({
    attributes: ['email', 'name', 'status', 'image',],
    where: {
      email: { [Op.in]: contacts, },
    },
    raw: true,
  });
};

getRecentContacts = async email => {
  console.log('dbApi:getRecentContacts');
  let contacts = await db.Recent.findAll({
    attributes: ['contact',],
    where: {
      me: email,
    },
    raw: true,
    order: [['time', 'DESC',],],
  });

  if (contacts.length === 0) {
    return [];
  }
  console.log('Have recent contacts');
  contacts = contacts.map(contact => contact.contact);

  return await db.User.findAll({
    attributes: ['email', 'name', 'status', 'image',],
    where: {
      email: { [Op.in]: contacts, },
    },
    raw: true,
  });
};

module.exports = {
  getUserByEmail,
  getUserByEmailPw,
  addUser,
  getContacts,
  getAllContacts,
  getRecentContacts,
  addContact,
  addNotification,
  removeNotification,
  getNotifications,
};
