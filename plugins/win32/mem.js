/*
 * plugin for memory statistics
 */

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
  nstat.lines(
    '/proc/meminfo', 
    function (line) {
      line = nstat.trim(line);
      var columns = nstat.split(line);
      var label = columns[0];
      if (label) {
        label = label.replace(/:$/,'');
        if (label in labels) {
          var name = labels[label];
          memory[name] = Number(columns[1]);
        }
      }
    },
    function (err) {
      memory.used = memory.total - memory.free - memory.buffer - memory.cached;
      if (err) {
        callback(err);
      } else {
        callback(null, memory);
      }
    }
  );

};

module.exports = new mem();

