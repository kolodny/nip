#!/usr/bin/env node

var nip = require('..');
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

var jsFile = argv.f || argv.file

if (argv.h || argv.help) {
  console.log(fs.readFileSync(__dirname + '/usage.txt').toString());
  return;
}

if (!argv._.length && !jsFile) {
  console.error('You muse specify a js-exec or a --js-file\nsee nip --help for more info');
  return;
}



var callbackStr;
if (jsFile) {
  callbackStr = fs.readFileSync(jsFile).toString();
} else {
  callbackStr = argv._.shift();
}

var files = argv._;

var callback;
try {
  if (/^\s*return\b/.test(callbackStr)) {
    callback = Function('return function(line, index) {' + callbackStr + '}')();
  } else if (/\s*function\b/.test(callbackStr)) {
    callback = Function('return ' + callbackStr)();
  } else {
    callback = Function(callbackStr)();
  }
} catch (e) {
  console.error("coudn't build callback function", e);
  return;
}

files = files.map(function(file) {
  return (file === '-') ? nip.STDIN : file;
});

console.log(files)

nip({
  files: files,
  callback: callback
});

