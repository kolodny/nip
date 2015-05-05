module.exports = extend;

function extend(target, extender) {
  for (var i in extender) {
    if (!(i in target)) {
      target[i] = extender[i];
    }
  }
}
