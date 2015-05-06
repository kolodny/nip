var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = createContext;

function ContextConstructor() {
  EventEmitter.call(this);
}
util.inherits(ContextConstructor, EventEmitter);

function createContext(filenameGetter) {
  var context = new ContextConstructor();

  Object.defineProperty(context, 'filename', {
    get: filenameGetter
  });
  return context;
}
