import config from '../../config';

const lmgtfyLink = 'http://lmgtfy.com/?q=';

class Command {
  constructor() {
    this.aliases = ['google'];
  }
  run(payload) {
    const { content } = payload.message;
    const split = content.split(' ');
    var query = "";
    for(var i=2;i<split.length;i++) {
        if(i != 2){
            query += "+"+split[i];
        } else {
            query = split[i];
        }
    }
    payload.message.channel.sendMessage(lmgtfyLink+query);
  }
}

module.exports = new Command();
