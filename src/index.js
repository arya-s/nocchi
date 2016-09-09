import commands from './loadCommands';
import config from '../config';
import Discord from 'discord.js';
import Twit from 'twit';

const twit = new Twit(config.twitter).stream('user', {'with': 'user'});
const bot = new Discord.Client();
const { discordToken, botname } = config;

let voiceChannel = null;
let textChannel = null;


bot.on('ready', () => {

  const { channels } = bot;

  voiceChannel = channels.find(channel => { return channel instanceof Discord.VoiceChannel; });
  textChannel = channels.find(channel => { return channel instanceof Discord.TextChannel; });

  bot.setPlayingGame('GAME');
  bot.joinVoiceChannel(voiceChannel);

  twit.on('tweet', parseTweet);

});

bot.on('message', message => {

  const { content, channel } = message;
  const { username } = message.author;
  const [operator, cmd] = content.toLowerCase().split(' '); 

  // Don't react to ourselves
  if (username === botname) {
    return;
  }

  const payload = {
    bot,
    message,
    channels: { textChannel, voiceChannel }
  };

  if (commands.hasOwnProperty(`${operator} ${cmd}`)) {
    commands[`${operator} ${cmd}`].run(payload);
  } else if (content === botname) {
    commands[botname].run(payload);
  } else if (content.indexOf('/') > -1 || content.indexOf('^') > -1) {
    commands['parseEmote'].run(payload);
  }

});

bot.loginWithToken(discordToken);

const parseTweet = function (tweet) {

  if (tweet.user.screen_name !== config.twitter.user) {
    return;
  }

  if (tweet.entities.urls.length === 0) {
    return;
  }

  const url = tweet.entities.urls[0].expanded_url;

  if (url.indexOf('vine.co') > -1) {
    textChannel.sendMessage(`${config.owner} uploaded a new vine: ${url}`);
  } else if (url.indexOf('periscope.tv') > -1) {
    textChannel.sendMessage(`${config.owner} started streaming: ${url}`);
  }

};
