var Discord      = require('discord.js');
var config       = require('./config');
var emotes       = require('./emotes');
var audiomotes   = require('./audiomotes');
var nocchi       = new Discord.Client();
var achan        = new Discord.Client();
var kashiyuka    = new Discord.Client();

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
  var user         = data.author.username;
  var voice        = nocchi.voiceConnection;
  var audioOptions = {volume: audioVolume};

  // Don't react to ourselves
  if (user === NOCCHI_NAME) {
    return;
  }

  if (message.indexOf('/') > -1) { 

    // Check emotes
    var splitted = message.split(' ');
    var emote    = splitted.find(function (e) { return e.indexOf('/') > -1; });

    // Image emotes
    if (emotes.hasOwnProperty(emote)) {
      data.channel.sendMessage(emotes[emote]);
    }

    // Audio emotes
    if (audiomotes.hasOwnProperty(emote)) {
      playAudio(voice, audioOptions, emote);
    }

  } else if (message.toLowerCase() === NOCCHI_NAME) {

    data.channel.sendMessage('Nocchi desu.');
    playAudio(voice, audioOptions, 'nocchi');

  } else if(message.toLowerCase() === 'perfume') {

    introducePerfume();

  } else if (message.toLowerCase() === NOCCHI_NAME + ' be louder') {

    audioVolume = clamp(audioVolume + VOLUME_DELTA, VOLUME_MIN, VOLUME_MAX);
    data.channel.sendMessage('OKAY');

  } else if (message.toLowerCase() === NOCCHI_NAME + ' be quieter') {

    audioVolume = clamp(audioVolume - VOLUME_DELTA, VOLUME_MIN, VOLUME_MAX);
    data.channel.sendMessage('okay');

  }

});

/**
 * Achan, Kashiyuka and Nocchi introduce themselves.
 */
var introducePerfume = function () {

  var messageDelay = 700;

  delayMessage(kashiyuka, 'Kashiyuka desu.', messageDelay, function () {

    delayMessage(achan, 'A-chan desu.', messageDelay, function () {

      delayMessage(nocchi, 'Nocchi desu.', messageDelay, function () {

        delayMessage(nocchi, 'Sannin awasete', messageDelay, function () {

          kashiyuka.sendMessage(textChannel, 'Perfume desu.');
          achan.sendMessage(textChannel, 'Perfume desu.');
          nocchi.sendMessage(textChannel, 'Perfume desu.');

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

  client.sendMessage(textChannel, message, {}, errorHandler);
  setTimeout(done, delay);

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
