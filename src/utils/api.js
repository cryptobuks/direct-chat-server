const Axios = require('axios');
const paths = require('../paths');
const fs = require('fs');
const path = require('path');

class Api {
  constructor() {
    this.prefix = '/api/';
    this.FB_API =
      'https://graph.facebook.com/me?fields=email,name&access_token=';
    this.FB_IMAGE_URL = 'https://graph.facebook.com/$id/picture?type=normal';
  }

  async fetchJSON(url) {
    let data = {};

    const response = await Axios({
      url,
      method: 'GET',
    });

    if (response.status >= 400) {
      const error = {
        message: `Error on ${url} with status ${response.status}`,
      };
      throw error;
    }

    return {
      status: response.status,
      headers: response.headers,
      json: response.data,
    };
  }

  async fetchFbProfile(token) {
    return this.fetchJSON(this.FB_API + token).then(response => {
      response.json.image = this.getFbPictureUrl(response.json.id);
      return response.json;
    });
  }

  getFbPictureUrl(id) {
    return this.FB_IMAGE_URL.replace('$id', id);
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
}

module.exports = new Api();
