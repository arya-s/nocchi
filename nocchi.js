var Discord      = require('discord.js');
var emotes       = require('./emotes');
var audiomotes   = require('./audiomotes');
var nocchi       = new Discord.Client();

var NAME         = 'nocchi';
var TOKEN        = process.env.DISCORD_TOKEN;
var AUDIO_DIR    = 'assets/audio/';
var VOLUME_DELTA = 0.1;
var VOLUME_MAX   = 1.0;
var VOLUME_MIN   = 0.0;

var audioVolume = 0.3;

nocchi.loginWithToken(TOKEN, function output(error) {

  if (error) {

    console.log('Error loging in with token', error);
    return;

  }

});

nocchi.on('ready', function () {

  // Play the game
  nocchi.setPlayingGame('GAME', function (error) {

    if (error) {
      console.log('Error setting playing game', error);
    }

  });

  var channels = nocchi.channels;

  for (var c in channels) {
    if (channels.hasOwnProperty(c)) {

      if (channels[c] instanceof Discord.VoiceChannel) {

        nocchi.joinVoiceChannel(channels[c], voiceErrorHandler);
        break;

      }

    }
  }

  function voiceErrorHandler (error) {

    if (error) {
      console.log('Error joining voice channel', error);
    } else {
      console.log('Joined voice channel.');
    }

  }

});

nocchi.on('message', function (data) {

  var message      = data.content;
  var user         = data.author.username;
  var voice        = nocchi.voiceConnection;
  var audioOptions = {volume: audioVolume};

  // Don't react to ourselves
  if (user === NAME) {
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

  } else if (message.toLowerCase() === NAME) {

    data.channel.sendMessage('Nocchi desu.');
    playAudio(voice, audioOptions, 'nocchi');

  } else if (message.toLowerCase() === NAME + ' be louder') {

    audioVolume = clamp(audioVolume + VOLUME_DELTA, VOLUME_MIN, VOLUME_MAX);
    data.channel.sendMessage('OKAY');

  } else if (message.toLowerCase() === NAME + ' be quieter') {

    audioVolume = clamp(audioVolume - VOLUME_DELTA, VOLUME_MIN, VOLUME_MAX);
    data.channel.sendMessage('okay');

  }

});

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
