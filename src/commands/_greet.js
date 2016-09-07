import config from '../../config';

class Command {

  constructor() {
    this.aliases = [config.botname];
  }

  run(payload) {

    const { channels: { textChannel } } = payload;
    const { botname } = config;

    textChannel.sendMessage(`${botname} desu.`);
    // Todo: play audio

  }

}

module.exports = new Command();
