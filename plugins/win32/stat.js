
/**
 * statistics of /proc/stat
 */
var _  = require("underscore");
var os = require("os"); 
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
//function getcpu(row, name) {
//  var cpu = row.cpu[name];
//  if (cpu) {
//    return cpu;
//  } else {
//    return row.cpu[name] = initcpurow();
//  }
//}

stat.prototype.get = function get(nstat, callback) {
  var self = this;
  var data = this.data;
  var result = [];
  var total  = 0;
  //only interested at Total CPU
  var getCpu = _.map(os.cpus(),function(cpu){ return cpu.times; })
		_.each(getCpu, function(item,cpuKey){
			_.each(_.keys(item),function(timeKey){
				var name = timeKey;
				if(timeKey == "sys"){
					name = "system"        
				}
				if ( result[name] === null || result[name] === undefined)
					result[name]=0;
				result[name]+=parseFloat((item[timeKey]));
				total+=parseFloat((item[timeKey]));
			});
		});
  self.data.cpu['total']=initcpurow();
	result['idle'] = 100;
  for (var k in result){
		if (result.hasOwnProperty(k)) {
			if (total > 0) {
					var value = result[k];
					value = value > 0 ? (value / total * 100).toFixed(2) : 0;
					if (k !== 'idle')
			       self.data.cpu.total[k]=value;
					else
			       self.data.cpu.total.idle-=value;
			}
			console.log("total :" + total + " value% " + value + " key " + k + " value " + result[k]);
		}
  }
  callback(null, self.data);
};

module.exports = new stat;
