#!/usr/bin/env node

var nstat = require('./');

// 3rd party modules
var program = require('commander');
program
.version('0.0.0')
.option('-i,--interval [interval]', 'interval time (sec)')
.option('-f,--format [format]', 'formatter. [json|color]')
;

program.parse(process.argv);

var interval = 1000;
if ('interval' in program) {
  interval = Number(program.interval*1000);
}

var format = require('./formats/' + (program.format || 'color'));
var count = 0;

function retrieve() {
  var next = Date.now() + interval;
  nstat.get(
    'stat',
    'net',
    'load',
    'mem',
    'disk',
    function(err, data) {
      if (err) {
        console.error('ERROR',err.message);
      } else {
        if (count === 0) {
          var header = format.header(data);
          if (header) {
            console.log(header);
            count++;
          }
        }
        console.log(format.format(data));
        // reset count
        if (++count === process.stdout.rows) {
          count = 0;
        }
      }
      var wait = Math.max(0, next - Date.now());
      setTimeout(retrieve, wait);
    });
}

retrieve();
