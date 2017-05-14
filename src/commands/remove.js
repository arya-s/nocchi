import path from 'path';
import jsonfile from 'jsonfile';
import { getEmote, getImage, checkIfPerms } from '../util';

const emotesPath = path.join(__dirname, '../../assets/emotes.json');
const assetsPath = path.join(__dirname, '../../assets');
const emotes = require(emotesPath);
const exec = require('child_process').exec;

class Command {

  constructor() {
    this.aliases = ['remove'];
  }

  run(payload) {

    const { bot, message } = payload;
    const { content } = message;
    const lower = content.toLowerCase();
    
    if(!(checkIfPerms('remove', payload.message.author.id))) {  
        return bot.sendMessage(message, 'You do not have permission to do that.'); 
    }

    removeEmote(content, (error, response) => {

      if (error) {

        console.log('Error removing emote.', error);
        return message.channel.send(message, 'Error removing emote. Please try again.');

      }

      message.channel.send(message, response);

    });

  }

}

const removeEmote = function (message, done) {
  const emote = getEmote(message);
  if (emotes.hasOwnProperty(emote)) {
    delete emotes[emote];
    return done(null, `Deleted emote ${emote}.`);
  } else {
    return done(null, 'We Don\'t have that emote.');
  }
  
  jsonfile.writeFile(emotesPath, emotes, { spaces: 2 }, error => {

    if (error) {
      return console.log(error);
    }

    done(error, 'Deleted emote.');
    //change git push to the  <local branch>:<remote branch> for the branch you want to update
    if (process.env.NOCCHI_ENV === 'production') {
      exec('git commit -m "emote update" ./assets/emotes.json;git push origin master');
    }
  });
};

module.exports = new Command();
