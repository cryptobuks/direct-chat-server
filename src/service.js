const auth = require('./auth');
const Contact = require('./model/Contact');
const db = require('./db/db');
const fs = require('fs');
const request = require('request');
const uuid = require('uuid/v4');
const paths = require('./paths');
const path = require('path');
const Axios = require('axios');

class Service {
  constructor() {
    this.botAvatar = '/assets/img/bot.gif';
    this.defaultAvatar = '/assets/img/default-avatar.svg';
    this.allUsers = this.getAllUsers();
  }

  auth(token) {
    const email = auth.decrypt(token);
    return email;
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

  async downloadImage(imageUrl, email) {
    const url = imageUrl;
    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const name = email.replace('@', 'at');
    const writer = fs.createWriteStream(path.resolve(paths.avatar, name));
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(name));
      writer.on('error', reject);
    });
  }

  async createNewUser(user) {
    if (user.email && user.name && user.image) {
      console.log(`user.image:${user.image}`);
      const urlReg = /https?:\/\/.*\.(jpg|gif|jpeg|svg|bmp)?.*/gi;
      const match = urlReg.exec(user.image);

      if (match) {
        const imageName = await this.downloadImage(user.image, user.email);
        const contact = new Contact(user.email, user.name, 'online', imageName);
        await db.addUser(contact);
        return [undefined, 201,];
      }
    }

    return [undefined, 400,];
  }

  async fetchMyContact(email) {
    const myContact = await db.findUserByEmail(email);

    if (myContact) {
      console.log('found');
      return myContact;
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
