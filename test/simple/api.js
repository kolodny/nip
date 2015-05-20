var assert = require('assert');
var fs = require('fs');
var stream = require('stream');
var EventEmitter = require('events').EventEmitter;
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

var fileLocation = __dirname + '/file.txt';
var file2Location = __dirname + '/file2.txt';

var fileContents = fs.readFileSync(fileLocation).toString();
var file2Contents = fs.readFileSync(file2Location).toString();

describe('simple manipulation', function() {

  it('has a options required props guard', function() {
    assert.throws(function() {
      nip({
        doneCallback: function() {
          console.log(arguments);
        }
      });
    });
  });

  describe('when working on a file', function() {
    describe('when passed `return line` format', function() {

      it('works', function(done) {
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

      it('can handle false', function(done) {
        var fn = function(line) { return false; };
        var outStream = stream2buffer();
        nip({
          files: [fileLocation],
          callback: fn,
          lineSeparatorRegex: /\n/,
          lineSeparator: '\n',
          colSeparatorRegex: /\s+/g,
          outStream: outStream,
          doneCallback: function() {
            assert.equal(outStream.data, '');
            done();
          }
        });
      });

      it('can handle numbers', function(done) {
        var fn = function(line) { return 1; };
        var outStream = stream2buffer();
        nip({
          files: [fileLocation],
          callback: fn,
          lineSeparatorRegex: /\n/,
          lineSeparator: '\n',
          colSeparatorRegex: /\s+/g,
          outStream: outStream,
          doneCallback: function() {
            assert.equal(outStream.data.split('\n')[0], 1);
            done();
          }
        });
      });

      it('can get the current filename', function(done) {
        var filename;
        var fn = function(line) { filename = this.filename };
        var outStream = stream2buffer();
        nip({
          files: [fileLocation],
          callback: fn,
          lineSeparatorRegex: /\n/,
          lineSeparator: '\n',
          colSeparatorRegex: /\s+/g,
          outStream: outStream,
          doneCallback: function() {
            assert.equal(filename, fileLocation);
            done();
          }
        });
      });

      it('can handle multiple file', function(done) {
        var filenames = {};
        var fn = function(line) { filenames[this.filename] = true; };
        var outStream = stream2buffer();
        nip({
          files: [fileLocation, file2Location],
          callback: fn,
          lineSeparatorRegex: /\n/,
          lineSeparator: '\n',
          colSeparatorRegex: /\s+/g,
          outStream: outStream,
          doneCallback: function() {
            assert.deepEqual(Object.keys(filenames), [fileLocation, file2Location]);
            done();
          }
        });
      });

      it('writes to stdout', function(done) {
        var fn = function(line) { return '!!!'; };
        var oldWrite = process.stdout.write;
        var called = false;
        process.stdout.write = function(buf) {
          if (/!!!/.test(buf.toString())) {
            return called = true;
          }
        };
        nip({
          files: [fileLocation],
          callback: fn,
          lineSeparatorRegex: /\n/,
          lineSeparator: '\n',
          colSeparatorRegex: /\s+/g,
          doneCallback: function() {
            process.stdout.write = oldWrite;
            assert(called);
            done();
          }
        });
      });

      it('can read from stdin', function(done) {
        var fn = function(line) {};
        var oldStdin = process.stdin;
        process.stdin = new EventEmitter();
        nip({
          files: ['-'],
          callback: fn,
          lineSeparatorRegex: /\n/,
          lineSeparator: '\n',
          colSeparatorRegex: /\s+/g,
          doneCallback: function() {
            process.stdin = oldStdin;
            done();
          }
        });
        process.stdin.emit('end');
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


      it('can handle false', function(done) {
        var fn = function(line) { return false; };
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
            assert.equal(outStream.data, '');
            done();
          }
        });
      });

      it('can handle numbers', function(done) {
        var fn = function(line) { return 1; };
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
            assert.equal(outStream.data.split('\n')[0], 1);
            done();
          }
        });
      });

      it('can handle truthy vals', function(done) {
        var fn = function(line) { };
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
            assert.equal(outStream.data, fileContents.split('\n')[0]);
            done();
          }
        });
      });


    });
  });
});
