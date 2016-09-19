import path from 'path';
import config from '../../config';

const assetsPath = path.join(__dirname, '../../assets');
const audioPath = path.join(__dirname, '../../assets/audio/');
const audioEmotes = require(`${assetsPath}/audiomotes`);


class Command {

  constructor() {
    this.aliases = [config.botname];
  }

  run(payload) {

    const { bot, message, channels: { textChannel, voiceChannel }, voiceConnection } = payload;
    const { botname } = config;

    const isPM = message.channel.isPrivate;
    
    message.channel.sendMessage(`${botname} desu.`);

    if (!isPM) {
     voiceConnection.playFile(`${audioPath}${audioEmotes['nocchi']}`);
    }

  }

}

module.exports = new Command();
