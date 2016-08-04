/*
 * statistics for disk devices
 */
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

function isDisk(label) {
  return (/^(xvda\d+|dm-\d+|md\d+|x?[hsv]d[a-z]+\d*)$/).test(label);
}
//Added the '-' character to the regular expresion listed below, If It doesn't exists dm- devices are not recognized.
var diskPattern = /([a-z]+-?[0-9]*) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+)/;

function getDisk(row, name) {
  var data = row[name];
  if (data) {
    return data;
  }
  return row[name] = initdisk();
}

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

  nstat.lines(
    '/proc/diskstats',
    function (line) {

      var match = diskPattern.exec(line);
      if (!match) {
        return;
      }
      var devname = match[1];

      if (isDisk(devname)) {
        var currdisk = getDisk(curr, devname);
        var prevdisk = getDisk(prev, devname);
        var datadisk = getDisk(data, devname);

        
        // set current value
        currdisk.read.count = Number(match[2]);
        currdisk.read.sector = Number(match[4]);
        currdisk.read.time = Number(match[5]);
        currdisk.write.count = Number(match[5]);
        currdisk.write.sector = Number(match[8]);
        currdisk.write.time = Number(match[9]);
        
        // get difference
        datadisk.read.count = diff(prevdisk.read.count, currdisk.read.count);
        datadisk.read.sector = diff(prevdisk.read.sector, currdisk.read.sector);
        datadisk.read.time = diff(prevdisk.read.time, currdisk.read.time);
        datadisk.write.count = diff(prevdisk.write.count, currdisk.write.count);
        datadisk.write.sector = diff(prevdisk.write.sector, currdisk.write.sector);
        datadisk.write.time = diff(prevdisk.write.time, currdisk.write.time);
        
        total.read.count += datadisk.read.count;
        total.read.sector += datadisk.read.sector;
        total.read.time += datadisk.read.time;
        total.write.count += datadisk.write.count;
        total.write.sector += datadisk.write.sector;
        total.write.time += datadisk.write.time;
      }
    },
    function (err) {
      self.prev = self.curr;
      self.curr = initrow();

      if (err) {

        callback(err);

      } else {

        self.data.total = total;
        total.usage = {
          total: 0,
          used: 0,
          available: 0
        };

        nstat.exec('df',['-klP'], function(err, data) {
          if (err) {
            callback(err);
          } else {
            var lines = data.split('\n');
            for (var i = 1; i < lines.length; i++) {
              var line = lines[i].split(/\s+/);
              var devname = line[0];
              if (devname.indexOf('/dev/') === 0) {
                devname = devname.substring(5); 
              }
              var disk = '';
              //mapper, There is an issue with mappers, It would be better to find out their proper drive by using something like
              //lsblk which doesn't requires sudo, I really don't take care abot read/write so:
              var matchMapper = devname.match(/mapper\/(.*)$/);
              if (matchMapper) {
                devname=matchMapper[1];
                diskTemp= {
                  "read":{"count":0,"sector":0,"time":0},
                  "write":{"count":0,"sector":0,"time":null}
                };
                // and now work with user space:
                self.data[devname]=diskTemp;
              }
              disk =self.data[devname];
              if (disk) {
                disk.usage = {
                  total: parseInt(line[1]),
                  used: parseInt(line[2]),
                  available: parseInt(line[3]),
                  mountedOn: line[5]
                };
                total.usage.total += disk.usage.total;
                total.usage.used += disk.usage.used;
                total.usage.available += disk.usage.available;
              }
            }

            // remove disks which has no usage
            for (var name in self.data) {
              if (!('usage' in self.data[name])) {
                delete self.data[name];
              }
            }

            callback(null, self.data);
          }
        });

      }
    }
  );
};

module.exports = new disk();

