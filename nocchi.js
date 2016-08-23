var Discord = require('discord.js');
var emotes  = require('./emotes');
var nocchi  = new Discord.Client();
var token   = process.env.DISCORD_TOKEN;
var NAME    = 'nocchi';

nocchi.loginWithToken(token, function output(error, token) {

  if (error) {

    console.log('Error', error);
    return;

  }

});

nocchi.on('message', function (data) {

  var message = data.content;
  var user    = data.author.username;

  // Don't react to ourselves
  if (user === NAME) {
    return;
  }

  if (message.indexOf('/') > -1) { 

    // Check emotes
    var splitted = message.split(' ');
    var emote    = splitted.find(function (e) { return e.indexOf('/') > -1; });

    if (emotes.hasOwnProperty(emote)) {
      data.channel.sendMessage(emotes[emote]);
    }

  } else if (message.toLowerCase().indexOf('nocchi') > -1) {

    data.channel.sendMessage('Hai, Nocchi desu.');

  } 

});
