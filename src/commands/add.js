import path from 'path';
import jsonfile from 'jsonfile';
import { getEmote, getImage } from '../util';

const emotesPath = path.join(__dirname, '../../assets/emotes.json');
const assetsPath = path.join(__dirname, '../../assets');
const emotes = require(emotesPath);
const exec = require('child_process').exec;

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

  let emote = getEmote(message);
  const image = getImage(message);

  if (!image) {
    return done(null, 'That is not an image.');
  }

  // If the emote already exist we want to find the appropriate counter to append to the emote handle
  if (emotes.hasOwnProperty(emote)) {

    // Find all emotes that match our emote name
    let pattern = new RegExp(`${emote}(\\d+)`);
    let keys = Object.keys(emotes);
    let found = keys.reduce((prev, cur) => {

      if (pattern.test(cur)) {
        prev.push(cur);
      }

      return prev;

    }, [emote]).sort((first, second) => {

      // We need to sort by the ending numbers not by the entire string to catch /emote10 being placed before /emote2
      return first.replace(emote, '') - second.replace(emote, '');

    });
  
    // Reject the emote if the image already exists
    for (let e of found) {

      if(emotes[e] === image){
        return done(null, `That image already exists under ${e}`);
      }

    }

    // Find the appropriate counter
    let last = found[found.length-1];
    let counter = 2;
    let matched = last.match(pattern);

    if (matched) {
      counter = parseInt(matched[1], 10) + 1;
    }

    emote = `${emote}${counter}`;

  }

  emotes[emote] = image;
  jsonfile.writeFile(emotesPath, emotes, { spaces: 2 }, error => {

    if (error) {
      return console.log(error);
    }

    done(error, `Added emote as ${emote}.`);
    //change git push to the  <local branch>:<remote branch> for the branch you want to update
    if (process.env.NOCCHI_ENV === 'production') {
      exec('git commit -m "emote update" ./assets/emotes.json;git push origin master');
    }
  });
};

module.exports = new Command();
