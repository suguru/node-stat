/*
 * plugin for memory statistics
 */
//TODO get it working properly using windows.
var os = require('os');

var labels = {
  MemTotal: 'total',
  MemFree: 'free',
  Buffers: 'buffer',
  Cached: 'cached',
  SwapTotal: 'swaptotal',
  SwapFree: 'swapfree'
};
var path = require('path');

function mem() {
}

mem.prototype.get = function(nstat, callback) {

  var memory = {};
  memory["MemTotal"]=os.totalmem();
  memory["MemFree"]=os.freemem();
  memory["Buffers"]=0;
  memory["Cached"]=0;
  memory["SwapTotal"]=0;
  memory["SwapFree"]=0;
  callback(null, memory);
};

module.exports = new mem();
