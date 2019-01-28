const Contact = require('../model/Contact');
const db = require('./db');

findUserByEmail = async email => {
  email = email.toLowerCase();
  return await db.User.findOne({
    where: {
      email,
    },
    raw: true,
  });
};

convertContact = contact =>
  new Contact(
    contact['user.email'],
    contact['user.name'],
    contact['user.status'],
    contact['user.image']
  );

addUser = async contact => {
  await db.User.create(contact);
};

getContacts = async email => {
  let contacts = await db.Contact.findAll({
    attributes: ['contact',],
    where: {
      me: email,
    },
    raw: true,
    include: [db.User,],
  });

  return contacts.map(convertContact);
};

getRecentContacts = async email => {
  let contacts = await db.Recent.findAll({
    attributes: ['contact',],
    where: {
      me: email,
    },
    raw: true,
    include: [db.User,],
    order: [['time', 'DESC',],],
  });
  return contacts.map(convertContact);
};

module.exports = { findUserByEmail, addUser, getContacts, getRecentContacts, };
