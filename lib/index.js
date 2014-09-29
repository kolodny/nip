function compileJs(js, ctx) {
  if (/^return\b/.test(js)) {
    return js = 'return function(line, index, lines) {\n' + js + '\n}'
  }
  return new Function(js)().bind(ctx);
}
