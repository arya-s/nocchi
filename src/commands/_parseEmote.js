import emotes from '../../assets/emotes';

/**
 * Parses an emote and returns an emote image if one exists
 */
class Command {

  constructor() {
    this.aliases = ['parseEmote'];
  }

  run(payload) {

    const { textChannel } = payload.channels;
    const { content } = payload.message;
    const emote = getEmote(content);

    if (emotes.hasOwnProperty(emote)) {
      textChannel.sendMessage(emotes[emote]);
    }

  }

}

/**
 * Helper function to parse an emote from a message
 * @param  {String} message
 * @return {String} The first emote that has been found.
 */
const getEmote = function (message) {

  return message.toLowerCase().split(' ').find(e => {

      return (
        e.indexOf('http') === -1 &&
        e.indexOf('www.') === -1 &&
        (e.indexOf('/') > -1 || e.indexOf('^') > -1)
      );

  });

};

module.exports = new Command();
