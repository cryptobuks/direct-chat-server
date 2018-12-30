const Contact = require('./model/Contact');

class Service {
  constructor() {
    this.botAvatar = '/assets/img/bot.gif';
  }

  sleep() {
    const seconds = 2;
    let waitTill = new Date(new Date().getTime() + seconds * 1000);
    while (waitTill > new Date()) {}
  }

  fetchAllContact() {
    return this.fetchRecentChatContact();
  }

  fetchRecentChatContact() {
    this.sleep();
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
}

module.exports = new Service();
