/**
 * clouds-socket test
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var support = require('./support');


describe('clouds-socket', function () {

  it('server.listen() & client.connect()', function (done) {
    var address = support.getListenAddress();
    var s, c1, c2;
    async.series([
      function (next) {
        // 创建服务器
        s = support.createServer(address);
        s.on('listening', next);
        s.on('error', function (err) {
          throw err;
        });
      },
      function (next) {
        // 客户端连接
        c1 = support.createClient(address);
        c1.on('connect', next);
      },
      function (next) {
        // 客户端连接
        c2 = support.createClient(address);
        c2.on('connect', next);
      },
      function (next) {
        // 断开连接
        c1.exit(next);
      },
      function (next) {
        // 断开连接
        c2.exit(next);
      },
      function (next) {
        // 关闭服务器
        s.exit(next);
      }
    ], done);
  });

  it('server.listen() & client.connect() - event `exit`', function (done) {
    var address = support.getListenAddress();
    var s, c1, c2;
    async.series([
      function (next) {
        // 创建服务器
        s = support.createServer(address);
        s.on('listening', next);
        s.on('error', function (err) {
          throw err;
        });
      },
      function (next) {
        // 客户端连接
        c1 = support.createClient(address);
        c1.on('connect', next);
      },
      function (next) {
        // 客户端连接
        c2 = support.createClient(address);
        c2.on('connect', next);
      },
      function (next) {
        // 断开连接
        c1.exit();
        c1.once('exit', next);
      },
      function (next) {
        // 断开连接
        c2.exit();
        c2.once('exit', next);
      },
      function (next) {
        // 关闭服务器
        s.exit();
        s.once('exit', next);
      }
    ], done);
  });

  it('server event `connection`', function (done) {
    var address = support.getListenAddress();
    var s, c1, c2;
    var counter = 0;
    async.series([
      function (next) {
        // 创建服务器
        s = support.createServer(address);
        s.on('listening', next);
        s.on('error', function (err) {
          throw err;
        });
        s.on('connection', function (client) {
          counter++;
        });
      },
      function (next) {
        // 客户端连接
        c1 = support.createClient(address);
        c1.on('connect', next);
      },
      function (next) {
        // 客户端连接
        c2 = support.createClient(address);
        c2.on('connect', next);
      },
      support.wait(200),
      function (next) {
        // 检查计数器
        assert.equal(counter, 2);
        next();
      },
      function (next) {
        // 关闭服务器所有连接
        support.exit(c1, c2, s, next);
      }
    ], done);
  });

  it('client auto reconnect', function (done) {
    var address = support.getListenAddress();
    var s, c;
    var counter = 0;
    var times = 10;
    var callNext = false;
    async.series([
      function (next) {
        // 创建服务器
        s = support.createServer(address);
        s.on('listening', next);
        s.on('error', function (err) {
          throw err;
        });
        s.on('connection', function (client) {
          counter++;
          setTimeout(function () {
            client.exit();
          }, 100);
        });
      },
      function (next) {
        // 客户端连接
        c = support.createClient(address);
        c.on('connect', function () {
          if (counter >= times) {
            c.exit(next);
          }
        });
      },
      support.wait(200),
      function (next) {
        // 检查计数器
        assert.ok(counter >= times);
        next();
      },
      function (next) {
        // 关闭服务器所有连接
        support.exit(s, next);
      }
    ], done);
  });

});
