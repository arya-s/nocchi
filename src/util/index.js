/**
 * Helper function to parse an emote from a message
 * @param  {String} message
 * @return {String} The first emote that has been found.
 */
export const getEmote = function (message) {

  return message.split(' ').find(e => {

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

export const errorResponses = ['I couldn\'t find anything.',
'Yuka-chan is smarter than me, she would know.',
'Only the Fox God knows.'];

