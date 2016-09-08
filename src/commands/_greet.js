import path from 'path';
import config from '../../config';
import audioEmotes from '../../assets/audiomotes';

const audioPath = path.join(__dirname, '../../assets/audio/');


class Command {

  constructor() {
    this.aliases = [config.botname];
  }

  run(payload) {

    const { bot, message, channels: { textChannel, voiceChannel } } = payload;
    const { botname } = config;

    const isPM = message.channel.isPrivate;

    bot.sendMessage(message, `${botname} desu.`);

    if (!isPM) {
      bot.voiceConnection.playFile(`${audioPath}${audioEmotes['nocchi']}`);
    }

  }

}

module.exports = new Command();
