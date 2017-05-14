import path from 'path';
import config from '../../config';
import { replyWithError } from '../util';
const assetsPath = path.join(__dirname, '../../assets');
const emotes = require(`${assetsPath}/emotes`);

class Command {
  constructor() {
    this.aliases = ['answer', 'qq'];
  }
  run(payload) {
      const { bot, message } = payload;
      const { content } = message;
      if(content.search(new RegExp('is (rare|spark|rarespark|\@RareSpark\#5323) cancer', 'i')) > -1) {
        message.reply(emotes["/cancer4"]);
      } else if (content.search(new RegExp('should (sven|kitsunesvensson|\@kitsunesvensson\#2988) (shutup|shut up)', 'i')) > -1) {
        message.reply(emotes["/dragonshadows3"]+' \@kitsunesvensson\#2988');
      } else {
        replyWithError(message);
      }
  }
}

module.exports = new Command();
