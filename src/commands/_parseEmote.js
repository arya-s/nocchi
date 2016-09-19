import path from 'path';
import { getEmote } from '../util';
import Discord from 'discord.js';

const assetsPath = path.join(__dirname, '../../assets');
const audioPath = path.join(__dirname, '../../assets/audio/');
const emotes = require(`${assetsPath}/emotes`);
const audioEmotes = require(`${assetsPath}/audiomotes`);


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
      message.channel.sendMessage(emotes[emote]);
    }

    if (!isPM && audioEmotes.hasOwnProperty(emote)) {
        payload.voiceConnection.playFile(`${audioPath}${audioEmotes[emote]}`);
    }

  }

}

module.exports = new Command();
