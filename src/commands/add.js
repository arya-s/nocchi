import path from 'path';
import jsonfile from 'jsonfile';
import { getEmote, getImage } from '../util';

const emotesPath = path.join(__dirname, '../../assets/emotes.json');
const assetsPath = path.join(__dirname, '../../assets');
const emotes = require(emotesPath);


class Command {

  constructor() {
    this.aliases = ['add'];
  }

  run(payload) {

    const { bot, message } = payload;
    const { content } = message;
    const lower = content.toLowerCase();

    if(lower.indexOf('add') === -1 || lower.indexOf('to') === -1 || !getEmote(content)) {
      return bot.sendMessage(message, 'I couldn\'t add that emote');
    }

    addEmote(content, (error, response) => {

      if (error) {

        console.log('Error adding emote.', error);
        return bot.sendMessage(message, 'Error adding emote. Please try again.');

      }

      bot.sendMessage(message, response);

    });

  }

}

const addEmote = function (message, done) {
  const emote = getEmote(message);
  const image = getImage(message);
  if (!image) {
    return done(null, 'That is not an image.');
  }

  if(emotes[emote] === image){
    return done(null, 'Image with command is already exist in database');
  }

  if (emotes.hasOwnProperty(emote)) {
    let counter = 1;
    if(emote.match(/(\d+)$/))
    {
      counter = parseInt(emote.match(/(\d+)$/)[0], 10);
      counter +=1;
  } else {
      emote = `${emote}${counter}`
    }
  }

  emotes[emote] = image;
  jsonfile.writeFile(emotesPath, emotes, { spaces: 2 }, error => {

    if (error) {
      return console.log(error);
    }

    done(error, 'Added emote as ${emote}');
  });
};

module.exports = new Command();
