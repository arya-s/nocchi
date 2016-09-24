import config from '../../config';


export const parseTweet = function (tweet) {

  if (tweet.user.screen_name !== config.twitter.user) {
    return;
  }

  if (tweet.entities.urls.length === 0) {
    return;
  }

  const url = tweet.entities.urls[0].expanded_url;

  if (url.indexOf('vine.co') > -1) {
    textChannel.sendMessage(`${config.owner} uploaded a new vine: ${url}`);
  } else if (url.indexOf('periscope.tv') > -1) {
    textChannel.sendMessage(`${config.owner} started streaming: ${url}`);
  }

};
