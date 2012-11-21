/*
 * nstat is statistical tools which works with node.js.
 * nstat is insipred by dstat (https://github.com/dagwieers/dstat)
 */

// node modules
var fs = require('fs');
var events = require('events');
var os = require('os');
var path = require('path');
var async = require('async');

function nstat() {
}

nstat.prototype = new events.EventEmitter();
nstat.prototype.plugins = {};

// read multiple files into single content
nstat.prototype.read = function() {
	var files = Array.prototype.slice.apply(arguments);
	var callback = files.pop();
	var funcs = [];
	files.forEach(function(file) {
		funcs.push(function(callback) {
			fs.readFile(file, 'utf8', callback);
		});
	});
	async.series(funcs, function(err, contents) {
		if (err) {
			console.error('ERROR',err.message);
		} else {
			callback(contents.join(''));
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
	files.forEach(function(file) {
		funcs.push(function(callback) {
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
		});
	});
	async.series(funcs, function(err, lineSet) {
		endHandler(err, lineSet);
	});
};

// get data from specific plugin
nstat.prototype.get = function get() {
	var args = Array.prototype.slice.apply(arguments);
	var callback = args.pop();
	var self = this;
	var funcs = {};
	for (var i = 0; i < args.length; i++) {
		(function() {
			var name = args[i];
			funcs[name] = function(callback) {
				var plugin = self.plugins[name];
				if (plugin) {
					plugin.get.call(plugin, self, callback);
				} else {
					callback(new Error('plugin ' + name + ' does not found'));
				}
			};
		})();
	}
	async.series(funcs, callback);
};

nstat.prototype.trim = function(string) {
	if (!string) return string;
	return string.replace(/^[\s\t]+/,'').replace(/[\s\t]+$/,'');
};

nstat.prototype.split = function(string) {
	if (!string) return [];
	return string.split(/[\s\t]+/);
}

// add plugin to nstat prototype
function addPlugins(obj) {
	for (name in obj) {
		nstat.prototype.plugins[name] = obj[name];
	}
}

(function() {
	var plugindir = path.resolve(__dirname, 'plugins');
	var plugins = {};
	fs.readdirSync(plugindir)
	.filter(function(item) {
		return /.+\.js$/.test(item);
	})
	.forEach(function(item) {
		var name = item.substring(0,item.lastIndexOf('.'));
		plugins[name] = require('./plugins/'+item);
	});
	addPlugins(plugins);
})();

exports = module.exports = new nstat;
exports.plugin = addPlugins;
