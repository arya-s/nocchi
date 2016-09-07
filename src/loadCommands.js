/**
 * Loads all commands in the commands directory and stores them by
 * filename (minus extension) into an object that is exported.
 */

import path from 'path';
import fs from 'fs';
import config from '../config';

const cwd = path.join(__dirname, 'commands');
const files = fs.readdirSync(cwd);
const { botname } = config;
const commands = {}

files.forEach(file => {

  const command = require(`${cwd}/${file}`);

  command.aliases.forEach(alias => {

    // Commands that do not follow the <botname> <command> pattern are stored directly via their alias
    if (file.charAt(0) === '_') {
      commands[alias] = command;
    } else {
      commands[`${botname} ${alias}`] = command;
    }
    
  });

});

export default commands;
