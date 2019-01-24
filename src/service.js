//const auth = require('./auth');
const Contact = require('./model/Contact');
const db = require('./db/db');
const request = require('request');
const uuid = require('uuid/v4');
const api = require('./utils/api');

class Service {
  constructor() {
    this.tokenExpireIn = process.env.TOKEN_EXPIRE_IN;
    this.botAvatar = '/assets/img/bot.gif';
    this.defaultAvatar = '/assets/img/default-avatar.svg';
    this.allUsers = this.getAllUsers();
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

  getAllUsers() {
    return [
      new Contact('AI-Bot@directChat.com', 'AI-Bot', 'online', this.botAvatar),
      new Contact(
        'JimKarry@gmail.com',
        'Jim Karry',
        'online',
        'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/thinking-face.png'
      ),
      new Contact(
        'WinFred@hotmail.com',
        'Win Fred',
        'online',
        'https://flyingmeat.com/images/acorn_256x256.png'
      ),
      new Contact(
        'TomJerry@gmail.com',
        'Tom Jerry',
        'away',
        'https://www.kasandbox.org/programming-images/avatars/leafers-ultimate.png'
      ),
    ];
  }

  convertToClientUser(user) {
    delete user.id;
    delete user.status;
    user.image = `/assets/avatar/${user.image}`;
    user.token = uuid();
    user.csrf_token = uuid();
    user.expires_at = new Date().getTime() + Number(this.tokenExpireIn);
    this.updateAuthTable(user);
    return user;
  }

  async createNewUser(user) {
    console.log('method:createNewUser');
    if (user.email && user.name && user.image) {
      console.log(`user.image:${user.image}`);
      const urlReg = /https?:\/\/.*\.(jpg|gif|jpeg|svg|bmp)?.*/gi;
      const match = urlReg.exec(user.image);

      if (match) {
        const imageName = await api.downloadImage(user.image, user.email);
        const newUser = new Contact(user.email, user.name, 'online', imageName);
        await db.addUser(newUser);
        console.log(`new user [${newUser.email}]is created`);
        return [this.convertToClientUser(newUser), 201,];
      }
    }

    console.log(`Failed to create user:${JSON.stringify(user)}`);
    return [undefined, 400,];
  }

  async fetchMyContact(email) {
    const myContact = await db.findUserByEmail(email);

    if (myContact) {
      console.log('found');
      return this.convertToClientUser(myContact);
    }

    console.log('Not Found:' + email);
    return {};
  }

  async fetchAllContact() {
    return this.fetchRecentChatContact();
  }

  async fetchRecentChatContact() {
    return this.allUsers;
  }

  async creatUserWithFbToken(token) {
    const profile = await api.fetchFbProfile(token);
    console.log(`FB profile: ${JSON.stringify(profile)}`);
    const user = await db.findUserByEmail(profile.email);
    if (user) {
      return [this.convertToClientUser(user), 201,];
    }

    console.log(`Cannot find user ${profile.email}`);
    return await this.createNewUser(profile);
  }

  async fetchNotifications() {
    return [
      {
        contact: new Contact(
          'TomJerry@gmail.com',
          'Tom Jerry',
          'away',
          'https://www.kasandbox.org/programming-images/avatars/leafers-ultimate.png'
        ),
        type: 'friend-request',
      },

      {
        contact: new Contact(
          'WinFred@hotmail.com',
          'Win Fred',
          'online',
          'https://flyingmeat.com/images/acorn_256x256.png'
        ),
        type: 'friend-request-declined',
      },
    ];
  }
}

module.exports = new Service();
