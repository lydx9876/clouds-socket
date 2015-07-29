/**
 * clouds-controller
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var createDebug = require('debug');
var common = module.exports = exports = require('lei-utils').extend(exports);


exports.debug = function (name) {
  return createDebug('clouds:socket:' + name);
};

var debug = exports.debug('common');


exports.default = {};
exports.default.reconnectWaiting = 500;


exports.reconnectWaiting = function () {
  return Math.random() * exports.default.reconnectWaiting;
};

exports.callback = function (fn) {
  if (fn) return fn;
  return function (err) {
    debug('unhandle callback: error=%s, results=%j', err, arguments);
  };
};

exports.packBuffer = function (buf) {
  if (!Buffer.isBuffer(buf)) {
    buf = new Buffer(buf.toString());
  }
  var len = buf.length;
  var newBuf = new Buffer(len + 4);
  newBuf.writeUInt32BE(len, 0);
  buf.copy(newBuf, 4);
  return newBuf;
};

exports.unpackBuffer = function (buf) {
  var len = buf.readUInt32BE(0);
  return {
    length: len,
    needLength: len - (buf.length - 4),
    buffer: buf.slice(4, len + 4),
    restBuffer: buf.slice(len + 4)
  };
};
