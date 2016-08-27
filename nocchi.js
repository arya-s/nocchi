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

var NOCCHI_NAME = 'nocchi';
var AUDIO_DIR   = projectPath + '/assets/audio/';

var audioVolume  = 0.4;
var textChannel  = null;
var voiceChannel = null;
var currencies   = config.currencies;

oxr.set({app_id: config.oxr});

nocchi.loginWithToken(config.discord, errorHandler);

nocchi.on('ready', function () {

  // Play the game
  nocchi.setPlayingGame('GAME', errorHandler);

  var channels          = nocchi.channels;
  var foundTextChannel  = false;
  var foundVoiceChannel = false;

  for (var c in channels) {
    if (channels.hasOwnProperty(c)) {

      var channel = channels[c];

      if (!foundTextChannel && channel instanceof Discord.TextChannel) {

        textChannel      = channel;
        foundTextChannel = true;

      } else if (!foundVoiceChannel & channel instanceof Discord.VoiceChannel) {

        voiceChannel      = channel;
        foundVoiceChannel = true;

      }

      if (foundTextChannel && foundVoiceChannel) {
        break;
      }

    }
  }

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
        sendMessage(nocchi, 'Error adding emote. Please try again');
        return;

      }

      sendMessage(nocchi, response);

    });

  } else if (message.indexOf('/') > -1 || message.indexOf('^') > -1) { 

    // Check emotes
    var emote = getEmote(message);

    // Image emotes
    if (emotes.hasOwnProperty(emote)) {
      sendMessage(nocchi, emotes[emote]);
    }

    // Audio emotes
    if (audiomotes.hasOwnProperty(emote)) {
      playAudio(voice, audioOptions, emote);
    }

  } else if (messageLower === NOCCHI_NAME) {

    sendMessage(nocchi, 'Nocchi desu.');
    playAudio(voice, audioOptions, 'nocchi');

  } else if (messageLower.indexOf(NOCCHI_NAME) > -1 &&
    (messageLower.indexOf(' in ') > -1 || messageLower.indexOf(' to ') > -1)) {

    var idx = 1;

    //    0                        1                            2       3      4
    // nocchi [<currencySymbol>]<amount>[<currencySymbol>] [<currency>] in <currency>

    if (splittedLower.length < 4) {
      return sendMessage(nocchi, 'Something is missing, I can\'t help you.');
    }

    var amount = splittedLower[idx];
    var fromCurrency, toCurrency;

    // $ and ¥ are in front of the number
    if (currencies.hasOwnProperty(amount.charAt(0))) {

      fromCurrency = currencies[amount.charAt(0)];
      idx++;

    } else if(currencies.hasOwnProperty(amount.charAt(amount.length -1))) {

      fromCurrency = currencies[amount.charAt(amount.length -1)];
      idx++;

    } else if (currencies.hasOwnProperty(splittedLower[curIdx + 1])) {

      fromCurrency = currencies[splittedLower[curIdx + 1]];
      idx += 2;

    } else {

      fromCurrency = splittedLower[curIdx +1].toUpperCase();
      idx += 2;

    }

    // Skip the "in" keyword
    idx++;

    if (idx >= splittedLower.length) {
      return sendMessage(nocchi, 'I coulnd\'t understand that. Please try again.');
    }

    if (currencies.hasOwnProperty(splittedLower[idx])) {

      toCurrency = currencies[splittedLower[idx]];

    } else {

      toCurrency = splittedLower[idx].toUpperCase();

    }

    oxr.latest(function () {

      fx.rates = oxr.rates;
      fx.base  = oxr.base;

      try {

        var exchanged = fx(amount).from(fromCurrency).to(toCurrency);
        sendMessage(nocchi, amount + ' ' + fromCurrency + ' = ' + exchanged.toFixed(2) + ' ' + toCurrency);

      } catch (error) {

        console.log('Error exchanging currnecies', error);
        sendMessage(nocchi, 'I couldn\'t exchange that. Please try again.');

      }

    });

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

/**
 * Sends a message to the text channel via the supplied client.
 * @param  {Discord.Client} client
 * @param  {String} message
 */
var sendMessage = function (client, message) {
  client.sendMessage(textChannel, message, {}, errorHandler);
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
