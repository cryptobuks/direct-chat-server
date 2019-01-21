const auth = require('./auth');
const Contact = require('./model/Contact');
const db = require('./db/db');

class Service {
  constructor() {
    this.botAvatar = '/assets/img/bot.gif';
    this.defaultAvatar = '/assets/img/default-avatar.svg';
    this.allUsers = this.getAllUsers();
  }

  sleep(seconds = 1) {
    let waitTill = new Date(new Date().getTime() + seconds * 1000);
    while (waitTill > new Date()) {}
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

  createNewUser(user) {
    if (user.email && user.name && user.image) {
      const contact = new Contact(user.email, user.name, 'online', user.image);
      this.allUsers.push(contact);
      console.log(this.allUsers);
      return [undefined, 201,];
    }

    return [undefined, 400,];
  }

  fetchMyContact(email) {
    const myContact = this.allUsers.find(contact => {
      return contact.email.toLowerCase() === email;
    });

    if (!myContact) {
      console.log('not found');
      return {};
    }
    console.log('found');
    return myContact;
  }

  fetchAllContact() {
    this.sleep(0.1);
    return this.fetchRecentChatContact();
  }

  fetchRecentChatContact() {
    return this.allUsers.filter(user => {
      return !user.email.includes('linden');
    });
  }

  fetchNotifications() {
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
