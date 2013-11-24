
var clc = require('cli-color');
var _ = require('lodash');

var clabel = clc.xterm(69);
var cgray = clc.xterm(8);

function pad(text, num) {
  while (text.length < num) {
    text = ' ' + text;
  }
  return text;
}

function fix(num, color) {
  return function(value) {

    var str = String(value);
    if (str.length > num) {
      str = String(Math.round(value));
    }

    return color(pad(str, num));
  };
}

var kmg = 'BKMGTP';
function fixKMG(color, useB) {
  return function(value) {
    var t = 0;
    while (value > 1024) {
      t++;
      value /= 1024;
    }
    var str = String(Math.round(value));
    return color(pad(str, 4)) + cgray(kmg[t]);
  };
}

function fixDiskSector(color) {
  var fix = fixKMG(color, true);
  return function(value) {
    return fix(value.sector * 512);
  };
}

var labels = {
  'stat.cpu.total': {
    user: {
      label: 'usr',
      fix: fix(3, clc.xterm(160))
    },
    nice: {
      label: 'nic',
      fix: fix(3, clc.xterm(160))
    },
    system: {
      label: 'sys',
      fix: fix(3, clc.xterm(160))
    },
    idle: {
      label: 'idl',
      fix: fix(3, clc.xterm(40))
    },
    iowait: {
      label: 'wai',
      fix: fix(3, clc.xterm(160))
    },
    steal: {
      label: 'stl',
      fix: fix(3, clc.xterm(160))
    }
  },
  'disk.total': {
    read: {
      label: 'read',
      fix: fixDiskSector(clc.xterm(220))
    },
    write: {
      label: 'write',
      fix: fixDiskSector(clc.xterm(220))
    }
  },
  'net.total': {
    receive: {
      label: 'recv',
      fix: fixKMG(clc.xterm(147), true)
    },
    send: {
      label: 'send',
      fix: fixKMG(clc.xterm(147), true)
    },
  },
  'stat.system': {
    interrupt: {
      label: 'int',
      fix: fixKMG(clc.xterm(160), false)
    },
    contextsw: {
      label: 'csw',
      fix: fixKMG(clc.xterm(160), false)
    }
  }
};
var csize = {
  'stat.cpu.total': 3,
  'disk.total': 5,
  'net.total': 5,
  'stat.system': 5
};

var hyphen = function(count) {
  var str = '';
  for (var i = 0; i < count; i++) {
    str += '-';
  }
  return str;
};

var find = function(data, label) {
  var ll = label.split('.');
  for (var i = 0; i < ll.length; i++) {
    data = data[ll[i]];
  }
  return data;
};

exports.header = function(data) {

  var head1 = '';
  var head2 = '';

  _.each(labels, function(set, name) {

    if (head1.length > 0) {
      head1 += clc.blue('|');
    }
    if (head2.length > 0) {
      head2 += clc.blue('|');
    }

    var size = _.size(set);
    var clen = csize[name];
    var llen = (clen+1) * size;
    var hlen = llen - name.length - 1;

    if (hlen > 0) {
      head1 += clabel(
        hyphen(Math.ceil(hlen/2)) + name + hyphen(Math.floor(hlen/2))
      );
    } else {
      head1 += clabel(name.substr(0, llen));
    }

    var flag = false;
    _.each(set, function(def, key) {
      if (flag) {
        head2 += ' ';
      } else {
        flag = true;
      }
      head2 += clabel(pad(def.label, clen));
    });

  });

  return head1 + '\n' + head2;

};

exports.format = function(data) {

  var line = '';

  _.each(labels, function(set, name) {
    
    var values = find(data, name);
    var vlen = csize[name];
    var flag = false;

    if (line.length > 0) {
      line += clc.blue('|');
    }

    _.each(set, function(value, key) {

      if (flag) {
        line += ' ';
      } else {
        flag = true;
      }

      line += value.fix(values[key]);

    });

  });

  return line;
};

