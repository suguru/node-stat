/*
 * statistics for disk devices
 */
var diskusage = require('diskusage');
function disk() {
  this.curr = initrow();
  this.prev = initrow();
  this.data = initrow();
}

function initrow() {
  return {
    total: initdisk()
  };
}

function initdisk() {
  return {
    read: {
      count: 0,
      sector: 0,
      time: 0
    },
    write: {
      count: 0,
      sector: 0,
      time: 0
    }
  };
}

var AlwaysZero = initdisk();


function diff(value1, value2) {
  if (value1 === 0 || value2 === 0) {
    return 0;
  } else if (value1 === value2) {
    return 0;
  } else {
    return Math.abs(value1 - value2);
  }
}

disk.prototype.get = function(nstat, callback) {

  var self = this;
  var curr = self.curr;
  var prev = self.prev;
  var data = self.data;
  var total = initdisk();
  self.data.total = total;
  total.usage = {
    total: 0,
    used: 0,
    available: 0
  };
  diskusage.check('c:', function(err, info) {
	  total.usage.total += info.total;
	  total.usage.used += (info.total-info.available);
	  total.usage.available += info.available;
  });
  console.log(self.data.total);
  callback(null, self.data);

};

module.exports = new disk();

