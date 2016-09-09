import path from 'path';
import emotes from '../../assets/emotes';
import audioEmotes from '../../assets/audiomotes';
import { getEmote } from '../util';
import Discord from 'discord.js';


const audioPath = path.join(__dirname, '../../assets/audio/');


class Command {

  constructor() {
    this.aliases = ['parseEmote'];
  }

  run(payload) {

    const { bot, message } = payload;
    const { content } = message;
    
    const emote = getEmote(content);
    const isPM = message.channel.isPrivate;

    if (emotes.hasOwnProperty(emote)) {
      bot.sendMessage(message, emotes[emote]);
    }

    if (!isPM && audioEmotes.hasOwnProperty(emote)) {
      bot.voiceConnection.playFile(`${audioPath}${audioEmotes[emote]}`);
    }

  }

}

module.exports = new Command();
