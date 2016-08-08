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

function mem() {
}

mem.prototype.get = function(nstat, callback) {

  var memory = {};
  memory["total"]=os.totalmem();
  memory["free"]=os.freemem();
  memory["buffer"]=0;
  memory["cached"]=0;
  memory["swaptotal"]=0;
  memory["swapfree"]=0;
  memory["used"]=os.totalmem()-os.freemem();
  callback(null, memory);
};

module.exports = new mem();
