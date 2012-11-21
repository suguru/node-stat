
/*
 * statistics for
 * network traffic
 */

function net() {
	this.curr = initrow();
	this.prev = initrow();
	this.data = initrow();
}

function initrow() {
	return {};
}

function initdevrow() {
	return {
		receive: 0,
		send: 0
	};
};

function getdev(row, name) {
	var dev = row[name];
	if (dev) {
		return dev;
	} else {
		return row[name] = initdevrow();
	}
}

var totalfilter = /^(lo|bond\d+|face|.+\.\d+)$/

net.prototype.get = function(nstat, callback) {
	var self = this;
	var curr = this.curr;
	var prev = this.prev;
	var data = this.data;
	var skip = 2;
	nstat.lines(
		'/proc/net/dev',
		function(line) {
			if (--skip >= 0) {
				return;
			}
			line = nstat.trim(line);
			if (line.length === 0) {
				return;
			}
			var columns = nstat.split(line);
			var dev = columns.shift();
			var recv = columns[0];
			var send = columns[Math.floor(columns.length/2)];
			
			var devcurr = getdev(curr, dev);
			var devprev = getdev(prev, dev);
			var devdata = getdev(data, dev);
			
			devcurr.receive = recv;
			devcurr.send = send;
			
			devdata.receive = devprev.receive === 0 ? 0 : recv - devprev.receive;
			devdata.send = devprev.send === 0 ? 0 : send - devprev.send;
			
		}, function(err) {
			self.prev = self.curr;
			self.curr = initrow();
			if (err) {
				callback(err);
			} else {
				callback(null, self.data);
			}
		}
	);
};

module.exports = new net;

