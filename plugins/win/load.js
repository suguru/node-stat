
/*
 * statistics of load averages
 */
var os = require('os');

function load() {
}

load.prototype.get = function(nstat, callback) {
  callback(null, os.loadavg());
};

module.exports = new load();

