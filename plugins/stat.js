
/**
 * statistics of /proc/stat
 */
var nick = {
  cpu: ['user','nice','system','idle','iowait','irq','softirq','steal','guest','guest_nice']
};

// cpu usage
function stat() {
  this.data = initrow();
  this.curr = initrow();
  this.prev = initrow();
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

function getcpu(row, name) {
  var cpu = row.cpu[name];
  if (cpu) {
    return cpu;
  } else {
    return row.cpu[name] = initcpurow();
  }
}

// make object values to percent value
stat.prototype.percentize = function(obj) {
  var total = 0, name;
  for (name in obj) {
    total += obj[name];
  }
  obj.idle = 100;
  if (total > 0) {
    for (name in obj) {
      if (name === 'idle') {
        continue;
      }
      var value = obj[name];
      value = value > 0 ? Math.round(value / total * 100) : 0;
      obj[name] = value;
      obj.idle -= value;
    }
  }
};
stat.prototype.get = function get(nstat, callback) {
  var self = this;
  var curr = this.curr;
  var prev = this.prev;
  var data = this.data;
  nstat.lines(
    '/proc/stat',
    function(line) {
      var columns = line.split(/\s+/);
      var type = columns[0], value;
      if (/^cpu+/.test(type)) {
        // cpu
        var cpuname = type;
        if (cpuname === 'cpu') {
          cpuname = 'total';
        }
        for (var i = 1; i < columns.length; i++) {
          var cname = nick.cpu[i-1];
          value = Number(columns[i]);
          var cpucurr = getcpu(curr, cpuname);
          var cpuprev = getcpu(prev, cpuname);
          var cpudata = getcpu(data, cpuname);
          
          cpucurr[cname] = value;
          cpudata[cname] = cpuprev[cname] === 0 ? 0 : value - cpuprev[cname];
        }
        self.percentize(data.cpu[cpuname]);
      } else if (type === 'intr') {
        // interrupts
        value = Number(columns[1]);
        curr.system.interrupt = value;
        data.system.interrupt =  (prev.system.interrupt === 0) ? 0 : value - prev.system.interrupt;
      } else if (type === 'ctxt') {
        // context switch
        value = Number(columns[1]);
        curr.system.contextsw = value;
        data.system.contextsw = (prev.system.contextsw === 0) ? 0 : value - prev.system.contextsw;
      } else if (type === 'procs_running') {
        // running processes
        data.process.running = Number(columns[1]);
      } else if (type === 'procs_blocked') {
        // blocked processes
        data.process.blocked = Number(columns[1]);
      }
    },
    function(err) {
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

module.exports = new stat;
