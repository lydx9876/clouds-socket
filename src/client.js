/**
 * clouds-socket
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var assert = require('assert');
var net = require('net');
var common = require('./common');
var Transfer = require('./transfer');
var debug = common.debug('client');

//------------------------------------------------------------------------------

/**
 * create client
 * @param  {Object} options
 *   - {String} host
 *   - {Number} port
 * @return {Socket}
 */
function Client (options) {
  assert(options.host, 'missing parameter `host`');
  assert(options.port, 'missing parameter `port`');

  this._options = common.merge(options);
  Client._counter++;
  this._debug = common.debug('client:#' + Client._counter);

  this._connect();
}

common.inheritsEventEmitter(Client);

Client._counter = 0;


Client.prototype._connect = function () {
  var self = this;
  self._debug('connecting: host=%s, port=%s', self._options.host, self._options.port);

  self._pendingList = [];
  self._connected = false;
  self._exited = false;

  self._socket = new net.Socket();
  self._transfer = Transfer.create(self._socket, self._debug);
  self._socket.connect(self._options.port, self._options.host);

  self._socket.once('connect', function () {
    self._connected = true;
    self._debug('connected: host=%s, port=%s', self._options.host, self._options.port);
    if (self._pendingList.length > 0) {
      self._debug('processing pending list: length=%s', self._pendingList.length);
      self._pendingList.forEach(function (buf) {
        self._transfer.sendData(buf);
      });
      self._pendingList = [];
    }
    self.emit('connect');
  });

  self._socket.on('error', function (err) {
    self._debug('connection error: host=%s, port=%s, error=%s', self._options.host, self._options.port, err);
    self.emit('error', err);
  });

  self._socket.once('close', function () {
    self._debug('connection closed');
    if (self._exited) {
      self.emit('exit');
    } else {
      setTimeout(function () {
        self._connect();
      }, common.reconnectWaiting());
    }
  });

  self._transfer.process = function (buf) {
    self.emit('data', buf);
  };
};

Client.prototype.send = function (buf, callback) {
  this._debug('send: buffer=%s', buf.length);
  if (!this._connected) {
    this._debug('write pending: buffer=%s', buf.length);
    this._pendingList.push(buf);
    return;
  }
  this._transfer.sendData(buf, callback);
};

Client.prototype.exit = function (callback) {
  this._debug('exit');
  this._exited = true;
  this._socket.once('close', common.callback(callback));
  this._socket.destroy();
};


Client.create = function (options) {
  return new Client(options);
};

module.exports = Client;
