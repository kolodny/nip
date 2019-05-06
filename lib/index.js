var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var createContext = require('./create-context');
var requireProps = require('./require-props');

var processAsStream = require('./process-as-stream');
var processAsBuffer = require('./process-as-buffer');

module.exports = nip;
nip.STDIN = {};

function nip(options) {
  requireProps(options, [
    'files',
    'callback',
    'lineSeparatorRegex',
    'lineSeparator',
    'colSeparatorRegex',
  ]);

  options.outStream = options.outStream || process.stdout;

  var currentFilename;
  var context = createContext(function() {
    return currentFilename;
  });

  var fileIndex = 0;

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
    var processer = options.firstLineOnly ? processAsBuffer : processAsStream;

    if (options.inPlace && filename != "-") {
      var fs = require('fs');
      options.outStream = fs.createWriteStream(filename+".nip");
    }

    processer({
      filename: filename,
      context: context,
      lineSeparator: options.lineSeparator,
      lineSeparatorRegex: options.lineSeparatorRegex,
      colSeparatorRegex: options.colSeparatorRegex,
      outStream: options.outStream,
      firstLineOnly: options.firstLineOnly,
      callback: options.callback
    }, function() {
      context.emit('fileEnd');
      fileIndex++;

      if (options.inPlace && filename != "-") {
        options.outStream.end();
        var fs = require('fs');
        fs.renameSync(filename +".nip", filename);
      }

      processNextFile();
    });
  }

}
