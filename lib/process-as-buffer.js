var fs = require('fs');

module.exports = processAsStream;

function processAsStream(options, callback) {
  fs.readFile(options.filename, function(err, buf) {
    var lines = buf.toString().split(options.lineSeparatorRegex);
    var lineIndex = 0;
    var shouldWriteNewline = false;
    processNextLine();

    function processNextLine() {
      var line = lines[lineIndex];
      if (line == null || (lineIndex !== 0 && options.firstLineOnly)) {
        return callback(lineIndex);
      }

      if (shouldWriteNewline) {
        options.outStream.write(options.lineSeparator);
      }
      var columns = line.split(options.colSeparatorRegex);
      var result = options.callback.call(options.context, line, lineIndex, columns, lines);
      if (result !== false) {
        if (typeof result !== 'string' && typeof result !== 'number') {
          result = line;
        }
        options.outStream.write(result.toString());
        shouldWriteNewline = true;
      } else {
        shouldWriteNewline = false;
      }

      lineIndex++;
      processNextLine();
    }
  });
}
