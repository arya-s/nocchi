import config from '../../config';
import { createClient } from 'wolfram-alpha';

const wolfram = createClient(config.wolframToken);

class Command {

  constructor() {
    this.aliases = ['convert'];
  }

  run(payload) {

    const { content } = payload.message;
    const query = content.replace(/\S+ /, '');

    wolfram.query(query, (error, result) => {

      if (error || result.length === 0) {

        payload.message.reply('I could not convert this for you. Please try again.');
        return console.log(error);

      }

      const res = result[1];

      if (res && res.subpods && res.subpods[0]) {
        payload.message.reply(res.subpods[0].text);
      }

    });

  }

}

module.exports = new Command();
