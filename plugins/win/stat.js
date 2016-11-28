
/**
 * statistics of /proc/stat
 */
var _  = require("underscore");
var os = require("os"); 
var old = _.map(os.cpus(),function(cpu){ return cpu.times;});
// cpu usage
function stat() {
  this.data = initrow();
}

// init stat row
function initrow() {
  return {
    cpu: {},
    system: {
      interrupt: 0,
      contextsw: 0
    },
    process: {
      running: 0,
      blocked: 0
    }
  };
}

// init cpu row
function initcpurow() {
  return {
    user: 0,
    nice: 0,
    system: 0,
    iowait: 0,
    idle: 0,
    irq: 0,
    softirq: 0,
    steal: 0,
    guest: 0, 
    guest_nice: 0
  };
}

stat.prototype.get = function (nstat, callback) {
  var self = this;
  var data = this.data;
  var result = [];
  var total  = 0;
  //only interested at Total CPU
  var getCpu = _.map(os.cpus(),function(cpu){ return cpu.times; });
  _.each(getCpu, function(item,cpuKey){
    var oldVal = old[cpuKey];
    _.each(_.keys(item),function(timeKey){
      var name = timeKey;
      if(timeKey == "sys"){
        name = "system";
      }
      if( ! result[name] ) {
        result[name]=0;
      }
      var diff = ( parseFloat(item[timeKey]) - parseFloat(oldVal[timeKey]) );
      result[name] += diff;
      total += diff;
    });
  });

  this.data.cpu['total'] = initcpurow();

  for (var k in result){
    if (result.hasOwnProperty(k)) {
      if (total > 0) {
        var value = result[k];
        value = (value > 0) ? parseFloat( (value/total) * 100 ).toFixed(2) : 0;
        self.data.cpu.total[k] = value;
      }
    }
  }

  callback(null, this.data);
};

module.exports = new stat;
