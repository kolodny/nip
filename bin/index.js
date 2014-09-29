#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var nip = require('../lib');

program.name = 'nip';

program
  .version('0.0.1')
  .usage('[js-function] [options] [files]')
  .option('-1, --first-line-only', 'only execute once per file, not for each line')
  .option('-f, --file [js-file]', 'use the js-file as the executer on the input')
  .option('-n, --line-splitter [regex]', 'the line separator, gets sent to RegExp', '\\r?\\n')

program.on('--help', function() {
  console.log([
  	"",
  	"  Here are some {} clones of well known cli tools",
  	"",
  	"  cat : {} 'return line' file.txt",
  	"  cat : {} 'return true' file.txt",
  	"  head: {} 'return index <= 10' file.txt",
  	"  head: {} 'function(line, index) { return index <= 10; }' file.txt",
  	"  tail: {} --buffer 'return lines.slice(-10).join(\"\\n\")' file.txt",
  	"  grep: {} 'return /node/.test(line)' file.txt",
  	"  sed : {} 'return line.replace(/hello/g, \"goodbye\")' file.txt",
  	"",
  	"  this tool takes a list of files like other cli tools to work on",
  	"  you can pass in - for stdin so you can do something like this",
  	"  `echo appended | nip 'return true' file.txt - > newfile.txt`",
  	"",
  ].join('\n').replace(/\{\}/g, program.name));
});

program.parse(process.argv);

if (!program.file && !/[^a-z0-9$_]/i.test(program.args[0])) {
	program.help();
}

if (program.file && /[^a-z0-9$_]/i.test(program.args[0])) {
	console.log("You can use either the --file option or the [js-function], not both");
	process.exit()
}

var js;
if (program.file) {
	js = fs.readFileSync(program.file)
} else {
	js = program.args[0];
	program.args.splice(0, 1);
}

if (program.args.length === 0) {
	program.args.push('-');
}

nip(program);