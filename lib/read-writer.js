var fs = require('fs');
var _ = require('lodash');

module.exports = function readWriter(filename, options) {
	options = _.extend(options || {}, {
		chunksize: 4096,
		splitter: '\\r?\\n',
	});

	var bytesRead;
	var readOffset = 0;
	var file = fs.openSync(filename, 'r+');
	var buffer = new Buffer(options.chunksize);
	var splitterRegex = new RegExp(options.splitter, 'g');
	var lines;

	while (true) {
		bytesRead = fs.readSync(file, buffer, 0, options.chunksize, readOffset);
		if (bytesRead === 0) break;
		lines = buffer
					.slice(readOffset, bytesRead)
					.toString('utf8')
					.split(splitterRegex);
		console.log(lines);
		readOffset += bytesRead;		
	}

	console.log(options);
}

module.exports( './lib/read-writer.js', {})