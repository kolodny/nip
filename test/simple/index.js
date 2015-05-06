var assert = require('assert');
var fs = require('fs');
var exec = require('child_process').exec
var rek = require('rek');

var nipLocation = 'node ' + rek.root + 'bin/nip';
var fileLocation = __dirname + '/file.txt'

var fileContents = fs.readFileSync(fileLocation).toString();

describe('simple manipulation', function() {
  describe('when working on a file', function() {
    it('works when passed `return line` format', function(done) {
      var functionString = "'return line.toUpperCase()'";
      exec(nipLocation + ' '+ functionString + ' ' + fileLocation, function(err, stdout) {
        assert.equal(stdout, fileContents.toUpperCase());
        done();
      })
    });
    it('works when passed `function() { return line; }` format', function(done) {
      var functionString = "'function(l) { return l.toUpperCase(); }'";
      exec(nipLocation + ' '+ functionString + ' ' + fileLocation, function(err, stdout) {
        assert.equal(stdout, fileContents.toUpperCase());
        done();
      })
    });
    it('works when passed `var a; return function` format', function(done) {
      var functionString = "'var a; return function(l) { return l.toUpperCase(); }'";
      exec(nipLocation + ' '+ functionString + ' ' + fileLocation, function(err, stdout) {
        assert.equal(stdout, fileContents.toUpperCase());
        done();
      })
    });
  });

  describe('when working on stdin', function() {
    var nipString = 'echo "test\ning" | ' + nipLocation;
    var expected = 'TEST\nING\n';
    it('works when passed `return line` format', function(done) {
      var functionString = "'return line.toUpperCase()'";
      exec(nipString + ' '+ functionString, function(err, stdout) {
        assert.equal(stdout, expected);
        done();
      })
    });
    it('works when passed `function() { return line; }` format', function(done) {
      var functionString = "'function(l) { return l.toUpperCase(); }'";
      exec(nipString + ' '+ functionString, function(err, stdout) {
        assert.equal(stdout, expected);
        done();
      })
    });
    it('works when passed `var a; return function` format', function(done) {
      var functionString = "'var a; return function(l) { return l.toUpperCase(); }'";
      exec(nipString + ' '+ functionString, function(err, stdout) {
        assert.equal(stdout, expected);
        done();
      })
    });
  });
});
