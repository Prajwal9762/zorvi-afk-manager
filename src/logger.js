'use strict';

const PREFIX = '[ZORVI]';

module.exports = Object.freeze({
  info(message) {
    console.log(PREFIX + ' ' + message);
  },
  error(message) {
    console.error(PREFIX + ' ' + message);
  },
});
