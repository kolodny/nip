var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var split = require('split');

module.exports = nip;
nip.STDIN = {};

function nip(options) {
  if (!options || !options.files || !options.callback) {
    throw new Error('You need to specify the files and callback');
  }

  if (!options.lineSeparatorRegex) {
    if (options.lineSeparator) {
      options.lineSeparatorRegex = RegExp(options.lineSeparator)
    } else {
      options.lineSeparator = '\n';
      options.lineSeparatorRegex = /\r?\n/;
    }
  }

  options.outStream = options.outStream || process.stdout;

  var ContextConstructor = function NipContext() {
    EventEmitter.call(this);
  };

  util.inherits(ContextConstructor, EventEmitter);

  var context = new ContextConstructor();

  Object.defineProperty(context, 'filename', {
    get: function() {
      return currentFilename;
    }
  });

  var fileIndex = 0;
  var currentFilename;

  processNextFile();

  function processNextFile() {
    var filename = currentFilename = options.files[fileIndex];
    if (!filename) {
      context.emit('end');

      // fileIndex will end up being the total files processed
      return options.doneCallback && options.doneCallback(fileIndex);
    }
    if (fileIndex === 0) { context.emit('start'); }
    context.emit('fileStart');
    var fileReader;
    var lineNumber = 0;
    var shouldWriteNewline = false;
    if (filename === nip.STDIN) {
      fileReader = process.stdin;
    } else {
      fileReader = fs.createReadStream(filename);
    }
    fileReader
      .pipe(
        split(options.lineSeparatorRegex)
      )
      .on('data', function (line) {
        if (shouldWriteNewline) {
          options.outStream.write(options.lineSeparator);
        }
        var result = options.callback.call(context, line || '', lineNumber++);
        if (result !== false) {
          if (typeof result !== 'string' && typeof result !== 'number') {
            result = line;
          }
          options.outStream.write(result.toString());
          shouldWriteNewline = true;
        } else {
          shouldWriteNewline = false;
        }
      })
      .on('end', function() {
        context.emit('fileEnd');
        fileIndex++;
        processNextFile();
      });
  }

}
















// #!/usr/bin/env node

// // closure 1
// (function() {


// var print, echo;

// print = echo = function(l) {
// 	process.stdout.write(l);
// };


// // closure 2
// (function() {

// var
// 	ccolors = require("ccolors"),
// 	fs,
// 	stdin = {}; // placeholder so we know we're dealing with stdin and not a file named stdin

// if (process.argv.length < 3) {
// 	usage();
// }

// if (!process.stdout.isTTY) {
// 	ccolors.disabled = true;
// }

// var
// 	args = parseArgv(),
// 	inFiles = args.inFiles,
// 	js;

// if (args.js) {
// 	js = args.js;
// } else if(args.jsFile) {
// 	try {
// 		getFs();
// 		js = fs.readFileSync(args.jsFile, 'utf8');
// 	} catch(e) {
// 		process.stderr.write(selfName() + ': there was an error opening the javascript function file "' + args.jsFile + '"\n');
// 		process.exit();
// 	}
// } else {
// 	usage();
// }

// var lineSplitter;
// if (args.lineSplitter[0] === '/') {
// 	lineSplitter = eval(args.lineSplitter); // too complicated; don't care
// } else {
// 	lineSplitter = args.lineSplitter;
// }

// if (args.cols) {
// 	var colSplitter;
// 	if (args.colSplitter[0] === '/') {
// 		colSplitter = eval(args.colSplitter); // too complicated; don't care
// 	} else {
// 		colSplitter = args.colSplitter;
// 	}
// }

// var
// 	ContextConstructor = function() {
// 		var that = this,
// 			events = {};

// 		this.on = function(name, fn) {
// 			if (!events[name]) {
// 				events[name] = [];
// 			}
// 			events[name].push(fn);
// 			return that;
// 		};
// 		this.off = function(name) {
// 			events[name] = null;
// 			return that;
// 		};
// 		this.trigger = function(name) {
// 			if (events[name]) {
// 				for (var i = 0; i < events[name].length; i++) {
// 					events[name][i].call(that);
// 				}
// 			}
// 			if (context['on' + name]) {
// 				context['on' + name].call(that);
// 			}
// 			return that;
// 		};
// 	},
// 	context = new ContextConstructor(),
// 	fn = compileJs.call(context, js, args.cols),
// 	firstFile = true;

// function processNextFile(recursive) {
// 	if (firstFile) {
// 		context.trigger('start');
// 		firstFile = false;
// 	} else {
// 		context.trigger('fileEnd');
// 	}

// 	if (inFiles.length) {
// 		var input = inFiles.shift();

// 		context.trigger('fileStart');

// 		if (input === stdin) {
// 			context.filename = '(standard input)';
// 			process.stdin.resume();
// 			process.stdin.setEncoding('utf8');
// 			process.stdin.on('data', processLines);
// 			process.stdin.on('end', processNextFile);
// 		} else {
// 			getFs();
// 			try {
// 				var noErr = true,
// 					data = fs.readFileSync(input, 'utf8');

// 			} catch(e) {
// 				noErr = false;
// 				if (fs.lstatSync(input).isDirectory()) {
// 					process.stderr.write(selfName() + ': ' + input + ': Is a directory\n');
// 				} else {
// 					process.stderr.write(selfName() + ': there was an error opening the file "' + input + '"\n');
// 				}
// 			}
// 			if (noErr) {
// 				context.filename = input
// 				processLines(data, input);
// 			}
// 			processNextFile();
// 		}
// 	} else {
// 		context.trigger('end');
// 	}
// }
// processNextFile();

// function processLines(lines) {
// 	var result, cols;

// 	lines = lines.replace(/\n$/, '').split(lineSplitter);
// 	for (var i = 0; i < lines.length; i++) {
// 		if (args.cols) {
// 			cols = lines[i].split(colSplitter);
// 			result = fn.call(context, lines[i], i, lines, cols);
// 		} else {
// 			result = fn.call(context, lines[i], i, lines);
// 		}

// 		if (result !== undefined && result !== false) {
// 			process.stdout.write((typeof result === 'boolean' ? lines[i] : result) + '\n');
// 		}
// 		if (args.one) {
// 			break;
// 		}
// 	}
// }

// function parseArgv() {
// 	var args = process.argv.slice(process.argv[2][0] === '-' ? 2 : 3),
// 		ret = {},
// 		i = 0,
// 		dashdashed = false,
// 		arg;

// 	//default args
// 	ret.colSplitter = '/\\s+/';
// 	ret.lineSplitter = '\n';

// 	if (process.argv[2][0] !== '-') {
// 		ret.js = process.argv[2];
// 	}

// 	for (; i < args.length; i++) {
// 		arg = args[i];
// 		if (arg === '-') {
// 			if (!ret.inFiles) {
// 				ret.inFiles = [];
// 			}
// 			ret.inFiles.push(stdin);
// 		} else if (arg === '--') {
// 			dashdashed = true;
// 		} else if (arg[0] === '-' && !dashdashed) {
// 			if (arg[1] === '-') {
// 				// long options
// 				if (/^--file=/.test(arg)) {
// 					ret.jsFile = arg.replace(/^--file=/, '');
// 				} else if (arg === '--first-line-only') {
// 					ret.one = true;
// 				} else if (arg === '--cols') {
// 					ret.cols = true;
// 				} else if (/^--col-splitter=/.test(arg)) {
// 					ret.colSplitter = arg.replace(/^--col-splitter=/, '');
// 				} else if (/^--line-splitter=/.test(arg)) {
// 					ret.lineSplitter = arg.replace(/^--line-splitter=/, '');
// 				} else if (arg === '--help') {
// 					help();
// 				} else {
// 					process.stderr.write(selfName() + ":  unrecognized option '" + arg + "'\nTry `" + selfName() + " --help' for more information\n");
// 					process.exit();
// 				}
// 			} else {
// 				// short options
// 				for (var j = 1; j < arg.length; j++) {
// 					if (arg[j] === 'f') {
// 						ret.jsFile = args[++i];
// 					} else if (arg[j] === '1') {
// 						ret.one = true;
// 					} else if (arg[j] === 'c') {
// 						ret.cols = true;
// 					} else if (arg[j] === 's') {
// 						ret.colSplitter = args[++i];
// 					} else if (arg[j] === 'n') {
// 						ret.lineSplitter = args[++i];
// 					} else {
// 						process.stderr.write(selfName() + ":  invalid option -- '" + arg[j] + "'\nTry `" + selfName() + " --help' for more information\n");
// 						process.exit();
// 					}
// 				}
// 			}
// 		} else {
// 			if (!ret.inFiles) {
// 				ret.inFiles = [];
// 			}
// 			ret.inFiles.push(arg);
// 		}
// 	}
// 	if (!ret.inFiles || !ret.inFiles.length) {
// 		ret.inFiles = [stdin];
// 	}
// 	return ret;
// }

// function getFs() {
// 	fs = fs || require('fs');
// }



// function selfName() {
// 	return process.argv[1].replace(/^.*[\/\\](.*)$/, '$1');
// }

// function usage() {
// 	process.stderr.write("Usage: " + selfName() + " [ js-function ] [ files ] file\nTry " + selfName() + " --help for more info\n");
// 	process.exit();
// }

// function help() {

// 	var lines = ([
// 		"Usage: " + selfName() + " [ js-function ] [OPTION] [ files ]",
// 		"Node Input/output Piper",
// 		"  -1, --first-line-only",
// 		"                 only execute once per file, not for each line",
// 		"  -f js-file, --file=js-file",
// 		"                 use the js-file as the function to execute on the input",
// 		"  -c, --cols",
// 		"                 an array of cols is passed as the fourth argument",
// 		"  -s string-or-regex, --col-splitter=string-or-regex",
// 		"                 the splitter for --cols, can be regex or string format (/\\s+/)",
// 		"  -n string-or-regex, --line-splitter=string-or-regex",
// 		"                 the line separator, can be regex or string format (\\n)",
// 		"",
// 		"You can use any of these formats for the javascript function body:",
// 		"  'function(line, index, lines, cols) { /* ... */ return value; }'",
// 		"  'return line.substr(0, 10) + index'",
// 		"  'var global; return function(line, i, lines) { /* ... */ return value; }'",
// 		"",
// 		"  In the first and third type of format, the variables",
// 		"    'line', 'index', 'lines', and 'cols' can be changed and even omitted",
// 		"",
// 		"  If the return value is not false and not undefined it will be outputted",
// 		"",
// 		"In the function, the context has an `.on()`, `.off()`, and `.trigger()` method",
// 		"  there are start, end, fileStart, and fileEnd callbacks triggered by default",
// 		"",
// 		"Examples:",
// 		"",
// 		"$ " + selfName() + " 'function(l) { return /^var/.test(l); }' lines-that-start-with-var.txt",
// 		"$ " + selfName() + " 'function(line, i) { return i % 2 ? line : false; }' every-2nd-line.txt",
// 		"$ " + selfName() + " 'return index % 2 ? line : line.toUpperCase()' upper-every-2nd-line.txt",
// 		"$ " + selfName() + " 'return line.replace(/^\s*|\s*$/g, \"\");' trim-lines.txt",
// 		"$ " + selfName() + " 'var a=\"\"; return function() { return (a += \"*\") + \"\\\\\\\\\"; }' slope.txt",
// 		"$ " + selfName() + " -f jsfile.js file.txt",
// 		"$ " + selfName() + " --file=jsfile.js file.txt",
// 		"",
// 		"Like most unix commands, you can pipe the input and/or output:",
// 		"",
// 		"$ find . | grep '\./' | " + selfName() + " 'return \"mv \" + line + \" \" + index ;' > script",
// 		"$ find . | grep '\./' | " + selfName() + " 'return \"mv \" + line + \" \" + index ;' | sh",
// 		"$ " + selfName() + " 'return \"mv \" + line + \" \" + index ;' filelisting.txt | sh",
// 		"$ " + selfName() + " 'return \"mv \" + line + \" \" + index ;' << filelisting.txt",
// 		"",
// 		"https://github.com/kolodny/nip",
// 	]).join('\n');

// 	process.stdout.write(lines + '\n');
// 	process.exit();
// }

// // end of closure 2
// })();


// function compileJs(js) {
// 	if (/^function\s*\(/.test(js)) {
// 		return eval( '(' + js + ')' );
// 	} else if (/^return\b/.test(js)) {
// 		return eval( '(function(line, index, lines' + (arguments[1] ? ', cols' : '') + ') { ' + js + ' })' );
// 	} else {
// 		return eval( '(function() { ' + js + ' })' ).call(this);
// 	}
// }

// // end of closure 1
// })();

