import config from '../../config';
import { getRandom } from '../util';

class Command {
  constructor() {
    this.aliases = ['dude'];
  }
  run(payload) {
    var response="dude";
    var length=getRandom(5, 100);
    for(var i=0;i<length;i++) {
        response+=getRandom(0,9);
    }
    response += "?";
    payload.message.reply(response);
  }
}

module.exports = new Command();
