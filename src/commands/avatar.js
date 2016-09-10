import config from '../../config';

class Command {

  constructor() {
    this.aliases = ['avatar'];
  }

  run(payload) {

    const { content } = payload.message;
    const { users } = payload.bot;
    const searchUser = content.split(' ')[2].toLowerCase();

    const foundUser = users.find(user => {
      return user.username.toLowerCase().indexOf(searchUser) > -1;
    });

    if (foundUser) {
      payload.message.reply(foundUser.avatarURL);
    } else {
      payload.message.reply('Could not find that user.');
    }

  }

}

module.exports = new Command();
