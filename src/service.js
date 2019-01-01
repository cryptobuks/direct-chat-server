const Contact = require('./model/Contact');

class Service {
  constructor() {
    this.botAvatar = '/assets/img/bot.gif';
    this.defaultAvatar = '/assets/img/default-avatar.svg';
  }

  sleep(seconds = 2) {
    let waitTill = new Date(new Date().getTime() + seconds * 1000);
    while (waitTill > new Date()) {}
  }

  fetchMyContact() {
    this.sleep(3);
    return new Contact(0, 'Linden Quan', 'online', this.defaultAvatar);
  }

  fetchAllContact() {
    this.sleep(1);
    return this.fetchRecentChatContact();
  }

  fetchRecentChatContact() {
    this.sleep(1);
    return [
      new Contact(1, 'AI-Bot', 'online', this.botAvatar),
      new Contact(
        2,
        'Tom Jerry',
        'away',
        'https://www.kasandbox.org/programming-images/avatars/leafers-ultimate.png'
      ),
      new Contact(
        3,
        'Jim Karry',
        'online',
        'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/thinking-face.png'
      ),
      new Contact(
        4,
        'Win Fred',
        'online',
        'https://flyingmeat.com/images/acorn_256x256.png'
      ),
      new Contact(
        5,
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
