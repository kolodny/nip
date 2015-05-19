var assert = require('assert');
var fs = require('fs');
var stream = require('stream');
var nip = require('rek')('');

var stream2buffer = function() {
  var writable = new stream.Writable();
  writable.data = '';
  writable._write = function(buf, chunk, cb) {
    writable.data += buf;
    cb();
  }
  return writable;
};

var fileLocation = __dirname + '/file.txt'

var fileContents = fs.readFileSync(fileLocation).toString();

describe('simple manipulation', function() {
  describe('when working on a file', function() {
    it('works when passed `return line` format', function(done) {
      var fn = function(line) { return line.toUpperCase(); };
      var outStream = stream2buffer();
      nip({
        files: [fileLocation],
        callback: fn,
        lineSeparatorRegex: /\n/,
        lineSeparator: '\n',
        colSeparatorRegex: /\s+/g,
        outStream: outStream,
        doneCallback: function() {
          assert.equal(outStream.data, fileContents.toUpperCase());
          done();
        }
      });
    });

    describe('when using the buffer technique', function() {
      it('works when passed `return line` format', function(done) {
        var fn = function(line, index, cols, lines) {
          return lines.map(function(line) {
            return line.toUpperCase();
          }).join('\n');
        };
        var outStream = stream2buffer();
        nip({
          files: [fileLocation],
          callback: fn,
          lineSeparatorRegex: /\n/,
          lineSeparator: '\n',
          colSeparatorRegex: /\s+/g,
          firstLineOnly: true,
          outStream: outStream,
          doneCallback: function() {
            assert.equal(outStream.data, fileContents.toUpperCase());
            done();
          }
        });
      });
    });
  });
});
