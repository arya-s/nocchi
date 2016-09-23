import path from 'path';
import { getEmote } from '../util';
import Discord from 'discord.js';

const assetsPath = path.join(__dirname, '../../assets');
const audioPath = path.join(__dirname, '../../assets/audio/');
const emotes = require(`${assetsPath}/emotes`);
const audioEmotes = require(`${assetsPath}/audiomotes`);
const jsonfile = require('jsonfile');
const fs = require('fs');
const pageHead = "<DOCTYPE html>\n<head>\n<title>nocchibot emotes</title>\n<script src=\"https://dl.dropboxusercontent.com/s/qwvnaeigartecp2/sorttable.js\" type=\"text/javascript\"></script>\n<style>\ntr:nth-of-type(odd) {\nbackground-color:#ccc;\n}\ntr:nth-of-type(even) {\nbackground-color:#aaa;\n}\n</style>\n</head>\n<h1>Nocchibot emotes</h1>\n<br>If this page looks sloppy, it is because it is. I've paid no attention to any standards whatsoever.\n<br>Click the heading of a column to sort alphabetically.\n<table border='1px' cellspacing='0px' class=\"sortable\" style=\"table-layout: fixed; width: 100%\">\n<thead><tr>\n    <td><b>Name</b></td>\n    <td><b>Link</td>\n    <td><b>Image<b></td>\n</tr></thead>\n";
const pageFoot = "</table>\nBOOTIFUL!";
var emotesListed = "";

class Command {

  constructor() {
    this.aliases = ['makeemotelist'];
  }

  run(payload) {
    const { bot, message } = payload;
    const { content } = message;
    
    const emote = getEmote(content);
    const isPM = message.channel.isPrivate;
    jsonfile.readFile(assetsPath + "\\emotes.json", function(err, obj) {
        for (var prop in obj) {
            emotesListed += "<tr>\n    <td>" + prop + "</td>\n    <td>" + emotes[prop] + "</td>\n    <td><img src=\"" + emotes[prop] + "\" alt=\""+prop+"\"></td>\n</tr>";
        }
        var stream = fs.createWriteStream("output.html");
        stream.once('open', function(fd) {
            stream.write(pageHead);
            stream.write(emotesListed);
            stream.write(pageFoot);
            stream.end();
            console.log("file write stream ended");
        });
    })

  }

}

module.exports = new Command();
