var EMOTES = 'emotes.json';

var Discord    = require('discord.js');
var jsonfile   = require('jsonfile');
var config     = require('./config');
var emotes     = require('./' + EMOTES);
var audiomotes = require('./audiomotes');
var nocchi     = new Discord.Client();
var achan      = new Discord.Client();
var kashiyuka  = new Discord.Client();

var NOCCHI_NAME    = 'nocchi';
var ACHAN_NAME     = 'a-chan';
var KASHIYUKA_NAME = 'kashiyuka';
var AUDIO_DIR      = 'assets/audio/';
var VOLUME_DELTA   = 0.1;
var VOLUME_MAX     = 1.0;
var VOLUME_MIN     = 0.0;

var audioVolume  = 0.3;
var textChannel  = null;
var voiceChannel = null;
var perfume      = [nocchi, achan, kashiyuka];

// Login Perfume
nocchi.loginWithToken(config.tokens.nocchi, errorHandler);
achan.loginWithToken(config.tokens.achan, errorHandler);
kashiyuka.loginWithToken(config.tokens.kashiyuka, errorHandler);

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

  nocchi.joinVoiceChannel(voiceChannel, function (error) {

    if (error) {
      console.log('Error joining voice channel', error);
    } else {
      console.log('Joined voice channel.');
    }

  });

});

nocchi.on('message', function (data) { 

  var message      = data.content;
  var messageLower = message.toLowerCase();
  var user         = data.author.username;
  var voice        = nocchi.voiceConnection;
  var audioOptions = {volume: audioVolume};

  // Don't react to ourselves
  if (user === NOCCHI_NAME) {
    return;
  }

  var randomPerfume = perfume[random(0, perfume.length)];

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
    var splitted = message.split(' ');
    var emote    = getEmote(message);

    // Image emotes
    if (emotes.hasOwnProperty(emote)) {
      sendMessage(randomPerfume, emotes[emote]);
    }

    // Audio emotes
    if (audiomotes.hasOwnProperty(emote)) {
      playAudio(voice, audioOptions, emote);
    }

  } else if (messageLower === NOCCHI_NAME) {

    sendMessage(nocchi, 'Nocchi desu.');
    playAudio(voice, audioOptions, 'nocchi');

  } else if(messageLower === 'perfume') {

    introducePerfume();

  } else if (messageLower === NOCCHI_NAME + ' be louder') {

    audioVolume = clamp(audioVolume + VOLUME_DELTA, VOLUME_MIN, VOLUME_MAX);
    sendMessage(nocchi, 'OKAY');

  } else if (messageLower === NOCCHI_NAME + ' be quieter') {

    audioVolume = clamp(audioVolume - VOLUME_DELTA, VOLUME_MIN, VOLUME_MAX);
    sendMessage(nocchi, 'okay');

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

  var splitted = message.split(' ');
  return splitted[splitted.indexOf('add') + 1];

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
 * Achan, Kashiyuka and Nocchi introduce themselves.
 */
var introducePerfume = function () {

  var messageDelay = 700;

  delayMessage(kashiyuka, 'Kashiyuka desu.', messageDelay, function () {

    delayMessage(achan, 'A-chan desu.', messageDelay, function () {

      delayMessage(nocchi, 'Nocchi desu.', messageDelay, function () {

        delayMessage(nocchi, 'Sannin awasete', messageDelay, function () {

          sendMessage(kashiyuka, 'Perfume desu.');
          sendMessage(achan, 'Perfume desu.');
          sendMessage(nocchi, 'Perfume desu.');

        });

      });

    });

  });

};

/**
 * Sends a delayed message to the textChannel and excutes the callback afterwards.
 * @param  {Discord.Client} client - A discord client.
 * @param  {String} message - A message string.
 * @param  {Number} delay - The amount of time to wait before executing the callback.
 * @param  {Function} done - A callback
 */
var delayMessage = function (client, message, delay, done) {

  sendMessage(client, message);
  setTimeout(done, delay);

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

    voice.playFile(file, options, function (error) {

      if (error) {
        console.log('Error playing file', file, error);
      }

    });

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

/**
 * Clamps a value between two points.
 * @param {Number} val - The to be clamped value.
 * @param {Number} min - The minimum the value can go to
 * @param {Number} max - The maximum the value can go to
 * @returns {Number}
 */
var clamp = function (val, min, max) {

    if (val < min) {
        return min;
    } else if (val > max) {
        return max;
    }

    return val;

};


/**
 * Returns a random integer between min and max.
 * @param  {Integer} min
 * @param  {Integer} max
 * @return {Integer}
 */
var random = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};
