import config from '../../config';
import { getRandom, errorResponses } from '../util';

class Command {
  constructor() {
    this.aliases = ['answer', 'qq'];
  }
  run(payload) {
      payload.message.channel.sendMessage(errorResponses[getRandom(0,errorResponses.length)]);
  }
}

module.exports = new Command();
