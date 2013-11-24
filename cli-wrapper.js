#!/usr/bin/env node

var nstat = require('./');

// 3rd party modules
var program = require('commander');
program
.version('0.0.0')
.option('-i,--interval [interval]', 'interval time (sec)')
;

program.parse(process.argv);

var interval = 1000;
if ('interval' in program) {
  interval = Number(program.interval*1000);
}

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
        console.log(JSON.stringify(data));
      }
      var wait = Math.max(0, next - Date.now());
      setTimeout(retrieve, wait);
    });
}

retrieve();
