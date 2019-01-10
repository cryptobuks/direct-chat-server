const Contact = require('./model/Contact');

class Service {
  constructor() {
    this.botAvatar = '/assets/img/bot.gif';
    this.defaultAvatar = '/assets/img/default-avatar.svg';
  }

  sleep(seconds = 1) {
    let waitTill = new Date(new Date().getTime() + seconds * 1000);
    while (waitTill > new Date()) {}
  }

  fetchMyContact(params) {
    //this.sleep(0.1);
    const email = params.email;
    console.log(email);
    return {};
    // return new Contact(
    //   'Linden.quan@gmail.com',
    //   'Linden Quan',
    //   'online',
    //   this.defaultAvatar
    // );
  }

  fetchAllContact() {
    this.sleep(0.1);
    return this.fetchRecentChatContact();
  }

  fetchRecentChatContact() {
    //    this.sleep(0.1);
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
