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