'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var emotesPath = _path2.default.join(__dirname, '../../assets/emotes.json');
var assetsPath = _path2.default.join(__dirname, '../../assets');
var emotes = require(emotesPath);
var exec = require('child_process').exec;

var Command = function () {
  function Command() {
    _classCallCheck(this, Command);

    this.aliases = ['add'];
  }

  _createClass(Command, [{
    key: 'run',
    value: function run(payload) {
      var bot = payload.bot;
      var message = payload.message;
      var content = message.content;

      var lower = content.toLowerCase();

      if (lower.indexOf('add') === -1 || lower.indexOf('to') === -1 || !(0, _util.getEmote)(content)) {
        return bot.sendMessage(message, 'I couldn\'t add that emote');
      }

      addEmote(content, function (error, response) {

        if (error) {

          console.log('Error adding emote.', error);
          return bot.sendMessage(message, 'Error adding emote. Please try again.');
        }

        bot.sendMessage(message, response);
      });
    }
  }]);

  return Command;
}();

var addEmote = function addEmote(message, done) {

  var emote = (0, _util.getEmote)(message);
  var image = (0, _util.getImage)(message);

  if (!image) {
    return done(null, 'That is not an image.');
  }

  // If the emote already exist we want to find the appropriate counter to append to the emote handle
  if (emotes.hasOwnProperty(emote)) {
    var _ret = function () {

      // Find all emotes that match our emote name
      var pattern = new RegExp(emote + '(\\d+)');
      var keys = Object.keys(emotes);
      var found = keys.reduce(function (prev, cur) {

        if (pattern.test(cur)) {
          prev.push(cur);
        }

        return prev;
      }, [emote]).sort(function (first, second) {

        // We need to sort by the ending numbers not by the entire string to catch /emote10 being placed before /emote2
        return first.replace(emote, '') - second.replace(emote, '');
      });

      // Reject the emote if the image already exists
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = found[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var e = _step.value;


          if (emotes[e] === image) {
            return {
              v: done(null, 'That image already exists under ' + e)
            };
          }
        }

        // Find the appropriate counter
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var last = found[found.length - 1];
      var counter = 2;
      var matched = last.match(pattern);

      if (matched) {
        counter = parseInt(matched[1], 10) + 1;
      }

      emote = '' + emote + counter;
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  emotes[emote] = image;
  _jsonfile2.default.writeFile(emotesPath, emotes, { spaces: 2 }, function (error) {

    if (error) {
      return console.log(error);
    }

    done(error, 'Added emote as ' + emote + '.');
    //change git push to the  <local branch>:<remote branch> for the branch you want to update
	if (process.env.NOCCHI_ENV === "production") {
    exec('git commit -m "emote update" ./assets/emotes.json;git push origin master');
	}
  });
};

module.exports = new Command();
