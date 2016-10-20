
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
}

function getdev(row, name) {
  var dev = row[name];
  if (dev) {
    return dev;
  } else {
    return row[name] = initdevrow();
  }
}

var totalfilter = /^(lo|bond\d+|face|.+\.\d+)$/;

net.prototype.get = function(nstat, callback) {
  var self = this;
  var curr = this.curr;
  var prev = this.prev;
  var data = this.data;
  var skip = 2;
  var total = initdevrow();
      self.data.total = total;
      self.prev = self.curr;
      self.curr = initrow();
      callback(null, self.data);
};

module.exports = new net;

