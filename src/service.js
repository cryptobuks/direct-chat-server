const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const Contact = require('./model/Contact');
const request = require('request');
const uuid = require('uuid/v4');
const api = require('./utils/api');
const { OAuth2Client, } = require('google-auth-library');
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const ai = require('./model/ai');
const defaultUser = require('./model/defaultUser');
const db = require('./db/dbApi');

class Service {
  constructor() {
    this.tokenExpireIn = process.env.TOKEN_EXPIRE_IN;
    this.botAvatar = '/assets/img/bot.gif';
    this.defaultAvatar = '/assets/img/default-avatar.svg';
    this.authTable = {};
  }

  auth(email, clientToken) {
    const { token, csrf_token, expires_at, } = this.authTable[email];
    if (token && token === clientToken && new Date().getTime() < expires_at) {
      return true;
    }
    return false;
  }

  updateAuthTable(user) {
    this.authTable[user.email] = {
      token: user.token,
      csrf_token: user.csrf_token,
      expires_at: user.expires_at,
    };
  }

  expendImageUrl(user) {
    if (!user.fullImageUri) {
      user.image = `/assets/avatar/${user.image}`;
      user.fullImageUri = true;
    }
    return user;
  }

  addToken(user) {
    delete user.id;
    delete user.status;
    user.image = `/assets/avatar/${user.image}`;
    user.token = uuid();
    user.csrf_token = uuid();
    user.expires_at = new Date().getTime() + Number(this.tokenExpireIn);
    this.updateAuthTable(user);
    return user;
  }

  async signup(email, pw) {
    const user = Object.assign({}, defaultUser);
    user.email = email;
    user.name = email.split('@')[0];
    user.pw = pw;
    return await this.createNewUser(user);
  }

  async signin(email, pw) {
    const user = await db.getUserByEmailPw(email, pw);

    if (user) {
      console.log('found');
      return [this.addToken(user), 200,];
    }

    console.log('Not Found:' + email);
    return [{}, 401,];
  }

  async addContact(user, contact) {
    await db.addContact(user, contact);
  }

  async createNewUser(user) {
    console.log('method:createNewUser');
    if (user.email && user.name && user.image) {
      const urlReg = /https?:\/\/.*\.(jpg|gif|jpeg|svg|bmp)?.*/gi;
      const match = urlReg.exec(user.image);
      if (match) {
        user.image = await api.downloadImage(user.image, user.email);
      }

      const newUser = new Contact(
        user.email,
        user.name,
        'online',
        user.image,
        user.pw
      );

      try {
        await db.addUser(newUser);
      } catch (error) {
        console.log(error.name);
        if (error.name === 'SequelizeUniqueConstraintError') {
          return [{}, 403,];
        }
      }
      console.log(`new user [${newUser.email}]is created`);
      this.addContact(newUser, ai);
      return [this.addToken(newUser), 201,];
    }

    console.log(`Failed to create user:${JSON.stringify(user)}`);
    return [undefined, 400,];
  }

  async fetchMyContact(email) {
    const myContact = await db.getUserByEmail(email);

    if (myContact) {
      console.log('found');
      return this.addToken(myContact);
    }

    console.log('Not Found:' + email);
    return {};
  }

  async fetchAllContact(email) {
    console.log('----- fetchAllContact');
    let contacts = await db.getContacts(email);
    if (!contacts) {
      contacts = [];
    }
    const originalLenght = contacts.length;
    contacts = contacts.filter(contact => contact.email != ai.email);
    if (contacts.length != originalLenght) {
      contacts.unshift(ai);
    }
    return contacts.map(contact => this.expendImageUrl(contact));
  }

  async fetchContactsWithKeywords(keyword, email) {
    let contacts = await db.getAllContacts();
    let allMyContacts = await this.fetchAllContact(email);
    allMyContacts = allMyContacts.map(contact => contact.email);
    let notificationContacts = await db.getNotifications(email);

    contacts = contacts.filter(
      contact =>
        contact.email !== ai.email &&
        contact.email !== email &&
        !allMyContacts.includes(contact.email) &&
        contact.name.toLowerCase().includes(keyword.toLowerCase())
    );

    return contacts.map(contact => {
      let notificationContact = notificationContacts.filter(
        c => c.email === contact.email
      )[0];
      if (notificationContact) {
        contact.type = notificationContact.type;
      } else {
        contact.type = 'stranger';
      }
      return this.expendImageUrl(contact);
    });
  }

  async fetchRecentChatContact(email) {
    let contacts = await db.getRecentContacts(email);
    if (!contacts) {
      contacts = [];
    }

    return contacts.map(contact => this.expendImageUrl(contact));
  }

  async creatUserWithFbToken(token) {
    const profile = await api.fetchFbProfile(token);
    console.log(`FB profile: ${JSON.stringify(profile)}`);
    const user = await db.getUserByEmail(profile.email);
    if (user) {
      return [this.addToken(user), 201,];
    }

    console.log(`Cannot find user ${profile.email}`);
    return await this.createNewUser(profile);
  }

  async creatUserWithGoogleToken(token) {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();
    console.log(profile);
    const user = await db.getUserByEmail(profile.email);
    if (user) {
      return [this.addToken(user), 201,];
    }

    console.log(`Cannot find user ${profile.email}`);
    profile.image = profile.picture;
    return await this.createNewUser(profile);
  }

  async fetchNotifications(email) {
    const notifications = await db.getNotifications(email);
    return notifications.map(notification => this.expendImageUrl(notification));
  }

  async sendFriendRequest(email, contactEmail) {
    console.log(email + ',' + contactEmail);
    let notifications = await this.fetchNotifications(contactEmail);
    let notification = notifications.filter(n => n.email === email)[0];
    if (notification && notification.type === 'sentFriendRequest') {
      await db.removeNotification(email, contactEmail);
      await db.removeNotification(contactEmail, email);
      await db.addContact({ email, }, { email: contactEmail, });
      await db.addContact({ email: contactEmail, }, { email, });
    } else {
      await db.addNotification(email, contactEmail, 'sentFriendRequest');
      await db.addNotification(contactEmail, email, 'receivedFriendRequest');
    }
  }
}

module.exports = new Service();
