var fs = require('fs');
var split = require('split');


module.exports = processAsStream;

function processAsStream(options, callback) {
  var fileReader;
  var lineNumber = 0;
  var shouldWriteNewline = false;
  if (options.filename === '-') {
    fileReader = process.stdin;
  } else {
    fileReader = fs.createReadStream(options.filename);
  }
  fileReader
    .pipe(
      split(options.lineSeparatorRegex)
    )
    .on('data', function (line) {
      if (shouldWriteNewline) {
        options.outStream.write(options.lineSeparator);
      }
      var columns = line.split(options.colSeparatorRegex);
      var result = options.callback.call(options.context, line, lineNumber++, columns);
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
    .on('end', callback);
}
