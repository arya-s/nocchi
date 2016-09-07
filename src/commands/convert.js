class Command {

  constructor() {
    this.aliases = ['convert', 'exchange', 'c', 'x'];
  }

  run(payload) {
    payload.message.reply(`Test: ${payload.message.content}`);
  }

}

module.exports = new Command();
