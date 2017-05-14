/**
 * Helper function to parse an emote from a message
 * @param  {String} message
 * @return {String} The first emote that has been found.
 */
export const getEmote = function (message) {

  return message.toLowerCase().split(' ').find(e => {

      return (
        e.indexOf('http') === -1 &&
        e.indexOf('www.') === -1 &&
        (e.indexOf('/') > -1 || e.indexOf('^') > -1)
      );

  });

};

/**
 * Extracts an image from a message. The image must come directly after the keyword 'add'
 * @param  {String} message
 * @return {String} The url of an image.
 */
export const getImage = function (message) {

  const splitted = message.split(' ');
  const splittedLower = message.toLowerCase().split(' ');
  const image = splitted[splittedLower.indexOf('add') + 1];

  if (image.indexOf('http') === -1) {
    return;
  }

  return image;

};

/**
 * Get a random number bounded by min and max, rounded down to a whole number.
 * @param  {number} min - Minimum number(inclusive)
 * @param  {number} max - Maximum number(exclusive)
 * @return {number} A randomly generated number rounded down to a whole number.
 */
export const getRandom = function (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

export const errorResponses = ['I couldn\'t find anything.\n http://i.imgur.com/NhvwGie.jpg',
'Yuka-chan is smarter than me, she would know.\n http://i.imgur.com/rvGJGsR.jpg',
'Only the Fox God knows.\n http://i.imgur.com/txepANw.jpg'];

/**
 * Send a message containing one of the error responses.
 * @param  {object} messageObj - The discordjs message object for use in replying.
 */
export const replyWithError = function(messageObj) {
    messageObj.reply(errorResponses[getRandom(0,errorResponses.length)]);
}


export const userPerms = {
    'remove': {
        'users': [
            '102392013529296896', //Arya
            '147213333173501953', //WhyNotDB
            '191298747735474177', //adthrawn
            '188865887606931465'  //sawwashere
        ]
    }
};

/**
 * Checks if the user has permission to use the command
 * @param  {string} command - The name of the command
 * @param  {string} userID - The user's ID
 */
export const checkIfPerms = function(command, userID) {
    let commandInPerms = userPerms[command];
    if (commandInPerms) {
        if (commandInPerms['users'].includes(userID)) { 
          return true; 
        } else { 
          return false; 
        }
    } else {
        return true;
    }
}
