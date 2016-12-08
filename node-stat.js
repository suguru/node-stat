/*
 * nstat is statistical tools which works with node.js.
 * nstat is insipred by dstat (https://github.com/dagwieers/dstat)
 */

var fs = require('fs');
var events = require('events');
var os = require('os');
var path = require('path');
var async = require('async');
var spawn = require('child_process').spawn;
var _ = require('lodash');
var path = require('path');

/**
 * include all the arquitecture dependecy modules
 * required to be compiled
 */
var Plugins = {
  win:{
    disk: require('./plugins/win/disk'),
    load: require('./plugins/win/load'),
    mem: require('./plugins/win/mem'),
    net: require('./plugins/win/net'),
    stat: require('./plugins/win/stat')
  },
  linux:{
    disk: require('./plugins/linux/disk'),
    load: require('./plugins/linux/load'),
    mem: require('./plugins/linux/mem'),
    net: require('./plugins/linux/net'),
    stat: require('./plugins/linux/stat')
  }
};

function nstat () {
  this._plugins = {};

  var platform = os.platform();

  if (/win/.test(platform)) { // win32 & win64
    this.plugin( Plugins.win );
  } else if (/linux/.test(platform)) {
    this.plugin( Plugins.linux );
  } else {
    throw new Error('NODE-STAT Platform ' + platform + ' Unsupported');
  }
}

module.exports = nstat;

nstat.prototype = new events.EventEmitter();

// read multiple files into single content
nstat.prototype.read = function() {
  var files = Array.prototype.slice.apply(arguments);
  var callback = files.pop();
  var funcs = [];
  var self = this;
  async.each(files, function(file, done) {
    fs.readFile(file, 'utf8', done);
  }, function(err, results) {
    if (err) {
      callback(err);
    } else {
      callback(null, results.join(''));
    }
  });
};

// read lines
nstat.prototype.lines = function() {
  var files = Array.prototype.slice.apply(arguments);
  var endHandler = files.pop();
  var lineHandler = files.pop();
  var funcs = [];
  var self = this;
  async.each(
    files,
    function(file, callback) {
      fs.readFile(file, 'utf8', function(err, content) {
        if (err) {
          callback(err);
        } else {
          var lines = content.split('\n');
          for (var i = 0; i < lines.length; i++) {
            lineHandler.call(self, lines[i]);
          }
          callback(null,lines);
        }
      });
    },
    endHandler
  );
};

// get data from specific plugin
nstat.prototype.get = function get() {
  var args = Array.prototype.slice.apply(arguments);
  var callback = args.pop();
  var self = this;
  var funcs = {};
  args.forEach(function(name) {
    funcs[name] = function(callback) {
      var plugin = self._plugins[name];
      if (plugin) {
        plugin.get.call(plugin, self, callback);
      } else {
        callback(new Error('plugin ' + name + ' does not found'));
      }
    };
  });
  async.series(funcs, callback);
};

// get data from child processes
nstat.prototype.exec = function exec(path, args, callback) {
  var worker = spawn(path, args);
  var text = '';
  worker.stdin.end();
  worker.stdout.setEncoding('utf8');
  worker.stdout.on('data', function(data) {
    text += data;
  });
  worker.on('error', function(err) {
    callback(err);
  });
  worker.on('close', function(code) {
    if (code === 0) {
      callback(null, text);
    } else {
      callback(new Error(path + ' exist abnormally. code:' + code));
    }
  });
};

nstat.prototype.trim = function(string) {
  if (!string) return string;
  return string.replace(/^[\s\t]+/,'').replace(/[\s\t]+$/,'');
};

nstat.prototype.split = function(string) {
  if (!string) return [];
  return string.split(/[\s\t]+/);
};

nstat.prototype.plugin = function(name, plugin) {
 var self = this;
  if (arguments.length === 1) {
    if (typeof name === 'object') {
      _.each(name, function(value, name) {
        self._plugins[name] = value;
      });
    } else if (typeof name === 'string') {
      return self._plugins[name];
    }
  } else {
    self._plugins[name] = plugin;
  }
};
