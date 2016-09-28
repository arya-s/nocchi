import commands from './loadCommands';
import config from '../config';
import { parseTweet } from './util/twitter';
import Discord from 'discord.js';
import Twit from 'twit';

const twit = new Twit(config.twitter).stream('user', {'with': 'user'});
const bot = new Discord.Client();
const { discordToken, botname } = config;

let voiceChannel = null;
let textChannel = null;
let twitLoaded = false;

bot.on('ready', () => {

  const { channels } = bot;

  voiceChannel = channels.find(channel => { return channel instanceof Discord.VoiceChannel; });
  textChannel = channels.find(channel => { return channel instanceof Discord.TextChannel; });

  bot.setPlayingGame('GAME');
  bot.joinVoiceChannel(voiceChannel);

  if (!twitLoaded) {

    twit.on('tweet', parseTweet);
    twitLoaded = true;

  }

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
