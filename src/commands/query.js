import config from '../../config';
import { createClient } from 'wolfram-alpha';
import { getRandom } from '../util';

const wolfram = createClient(config.wolframToken);
const errorResponses = ['I couldn\'t find anything.',
'Yuka-chan is smarter than me, she would know.',
'Only the Fox God knows.'];

class Command {

  constructor() {
    this.aliases = ['convert', 'query', 'q'];
  }

  run(payload) {

    const { content } = payload.message;
    const split = content.split(' ');
    const command = split[1];
    let query = content.replace(/\S+ /, '');

    if (command === 'q' || command === 'query') {
      query = content.replace(/\S+ \S+ /, '');
    }

    wolfram.query(query, (error, result) => {

      if (error || result.length === 0) {
        payload.message.reply(errorResponses[getRandom(0,3)]);
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