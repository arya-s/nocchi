import config from '../../config';
import { getRandom } from '../util';
const errorResponses = ['I couldn\'t find anything.',
'Yuka-chan is smarter than me, she would know.',
'Only the Fox God knows.'];

class Command {
  constructor() {
    this.aliases = ['question', 'question\,'];
  }
  run(payload) {
      payload.message.reply(errorResponses[getRandom(0,3)]);
  }
}

module.exports = new Command();
