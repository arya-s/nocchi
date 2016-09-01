var EMOTES = 'emotes.json';

var projectPath = require('path').resolve(__dirname);
var Discord     = require('discord.js');
var jsonfile    = require('jsonfile');
var fx          = require('money');
var oxr         = require('open-exchange-rates');
var config      = require('./config');
var emotes      = require('./' + EMOTES);
var audiomotes  = require('./audiomotes');
var nocchi      = new Discord.Client();

var NOCCHI_NAME    = 'nocchi';
var AUDIO_DIR      = projectPath + '/assets/audio/';
var CURRENCY_MATCH = new RegExp('(' + NOCCHI_NAME + ') (\\d+) (\\S+)( in | to )(\\S+)'); 

var audioVolume       = 0.4;
var voiceChannel      = null;
var voiceChannelFound = false;
var textChannel       = null;
var textChannelFound  = false;
var currencies        = config.currencies;

oxr.set({app_id: config.oxr});

nocchi.loginWithToken(config.discord, errorHandler);

nocchi.on('ready', function () {

  var channels = nocchi.channels;

  for (var c in channels) {

    if (channels.hasOwnProperty(c)) {

      var channel = channels[c];
      if (!voiceChannelFound && channel instanceof Discord.VoiceChannel) {

        voiceChannel = channel;
        voiceChannelFound = true;

      } else if (!textChannelFound && channel instanceof Discord.TextChannel) {

        textChannel = channel;
        textChannelFound = true;

      }
    }

  }

  // Play the game
  nocchi.setPlayingGame('GAME', errorHandler);
  nocchi.joinVoiceChannel(voiceChannel, errorHandler);

});

nocchi.on('message', function (data) { 

  var message       = data.content;
  var splitted      = message.split(' ');
  var messageLower  = message.toLowerCase();
  var splittedLower = messageLower.split(' ');
  var user          = data.author.username;
  var voice         = nocchi.voiceConnection;
  var audioOptions  = {volume: audioVolume};

  // Don't react to ourselves
  if (user === NOCCHI_NAME) {
    return;
  }

  if (messageLower.indexOf('add') > -1 && messageLower.indexOf('to') > -1 && getEmote(message)) {

    addEmote(message, function (error, response) {

      if (error) {

        console.log('Error adding emote.');
        nocchi.sendMessage(data, 'Error adding emote. Please try again');
        return;

      }

      nocchi.sendMessage(data, response);

    });

  } else if (message.indexOf('/') > -1 || message.indexOf('^') > -1) { 

    // Check emotes
    var emote = getEmote(message);

    // Image emotes
    if (emotes.hasOwnProperty(emote)) {
      nocchi.sendMessage(data, emotes[emote]);
    }

    // Audio emotes
    if (audiomotes.hasOwnProperty(emote)) {
      playAudio(voice, audioOptions, emote);
    }

  } else if (messageLower === NOCCHI_NAME) {

    nocchi.sendMessage(nocchi, 'Nocchi desu.');
    playAudio(voice, audioOptions, 'nocchi');

  } else if (messageLower.indexOf(NOCCHI_NAME) > -1 &&
    (messageLower.indexOf(' in ') > -1 || messageLower.indexOf(' to ') > -1)) {

    var matched = messageLower.match(CURRENCY_MATCH);
    matched = matched.filter(function (e) { return typeof e !== 'undefined'; });

    if (!matched || matched.length < 4) {
      return nocchi.reply(data, 'Something is missing, I can\'t help you.');
    }

    var lastIdx      = matched.length - 1;
    var amount       = matched[lastIdx - 3];
    var fromCurrency = matched[lastIdx - 2];

    if (config.currencies.hasOwnProperty(fromCurrency)) {
      fromCurrency = config.currencies[fromCurrency];
    }

    var toCurrency   = matched[lastIdx];

    if (config.currencies.hasOwnProperty(toCurrency)) {
      toCurrency = config.currencies[toCurrency];
    }

    oxr.latest(function () {

      fx.rates = oxr.rates;
      fx.base  = oxr.base;

      try {

        var exchanged = fx(amount).from(fromCurrency).to(toCurrency);
        nocchi.reply(data, amount + ' ' + fromCurrency + ' = ' + exchanged.toFixed(2) + ' ' + toCurrency);

      } catch (error) {

        console.log('Error exchanging currnecies', error);
        nocchi.reply(data, 'I couldn\'t exchange that. Please try again.');

      }

    });

  } else if (user === 'arya⊿' && messageLower.charAt(0) === '.') {

    nocchi.sendMessage(textChannel, message.substring(1), {}, errorHandler);

  }

});

/**
 * Adds an emote to the emotes collection if the emote wasn't already present.
 * @param  {String} message - A message containing the keyword 'add' and 'to',
 * an emote command and an image url
 * @param  {Function} done - Callback for when the emote was added.
 */
var addEmote = function (message, done) {

  var emote = getEmote(message);
  if (emotes.hasOwnProperty(emote)) {

    done(null, 'We already have that emote');
    return;

  }

  var image = getImage(message);
  if (!image) {

    done(null, 'That is not an image.');
    return;
    
  }

  emotes[emote] = getImage(message);

  jsonfile.writeFile(EMOTES, emotes, {spaces: 2}, function (error) {
    done(error, 'Added emote.');
  });

};

/**
 * Extracts an image from a message. The image must come directly after the keyword 'add'
 * @param  {String} message
 * @return {String} The url of an image.
 */
var getImage = function (message) {

  var splitted      = message.split(' ');
  var splittedLower = message.toLowerCase().split(' ');
  var image         = splitted[splittedLower.indexOf('add') + 1];

  if (image.indexOf('http') === -1 ) {
    return;
  }

  return image;

};

/**
 * Finds the first occurence of an emote command in the provided message
 * @param  {String} message
 * @return {String} A string containing the emote
 */
var getEmote = function (message) {

  return message.split(' ').find(function (e) {
      return (e.indexOf('http') === -1 && e.indexOf('/') > -1) || (e.indexOf('^') > -1); 
  });

};

var playAudio = function (voice, options, audiomote) {

  if (!audiomotes.hasOwnProperty(audiomote)) {
    return;
  }

  var file = AUDIO_DIR + audiomotes[audiomote];

  if (voice) {
    voice.playFile(file, options, errorHandler);
  }

};

/**
 * A generic error handler that logs the error to stdout
 * @param  {Error} error
 */
var errorHandler = function (error, meta) {

  if (error) {
    console.log('Error occured', error);
  }

};
