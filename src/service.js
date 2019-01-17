const auth = require('./auth');
const Contact = require('./model/Contact');

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
    const text = auth.decrypt(token);
    console.log(`decrypted:${text}`);
    return true;
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
    this.allUsers.push(user);
  }

  fetchMyContact(params) {
    //this.sleep(0.1);
    const email = params.email.toLowerCase();
    const myContact = this.allUsers.find(contact => {
      return contact.email.toLowerCase() === email;
    });

    if (myContact === undefined) {
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
    //    this.sleep(0.1);
    return this.allUsers.filter(user => {
      return !user.email.includes('linden');
    });
  }

  fetchNotifications() {
    this.sleep(3);
    return [
      {
        contact: new Contact(
          2,
          'Tom Jerry',
          'away',
          'https://www.kasandbox.org/programming-images/avatars/leafers-ultimate.png'
        ),
        type: 'friend-request',
      },

      {
        contact: new Contact(
          4,
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
