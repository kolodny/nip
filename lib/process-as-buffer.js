var fs = require('fs');

module.exports = processAsStream;

function processAsStream(options, callback) {
  fs.readFile(options.filename, function(err, buf) {
    var lines = buf.toString().split(options.lineSeparatorRegex);
    var line = lines[0];
    var columns = line.split(options.colSeparatorRegex);
    var result = options.callback.call(options.context, line, 0, columns, lines);
    if (result !== false) {
      if (typeof result !== 'string' && typeof result !== 'number') {
        result = line;
      }
      options.outStream.write(result.toString());
    }
    callback();

  });
}
