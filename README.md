# nip - Node Input/output Piper

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

`nip` is a command line utility for performing any type of processing to and from files and pipes

# Install

    npm install nip -g
    
If you omit the `-g` then make sure to add the local npm module path to your default path

You should now be able to call `nip` from the command line.

### Usage: `nip js-function [options] [files]`

The js-function can be one of three syntaxes:

1. `return line.substr(0, 10) + index`
2. `function(line, index, cols, lines) { /* code here */ return value; }`
3. `/* code */ return function(line, i, cols, lines) { /* ... */ return value; }`

The names `line`, `index`, `lines`, and `cols` can be changed in the second and third style syntaxes

If the return value is `false` nothing is sent to output stream  
If the return value is not a string or number then the line will be sent to the output stream  
else the return value will be sent to the output stream (including an empty string)

### options

`-f js-file` or  `--file=js-file`
>use the js-file as the function to execute on the input instead of the `js-function` argument
you must supply either this option or the `js-function` argument

----

`-1` or `--first-line-only`
>only execute once per file, not for each line  
this is useful if you plan on proccessing the file as a whole, namely through the `lines` variable  
for examaple (not a useful one): `nip 'return lines.length' -1 file.txt`


----

`-s string-or-regex`, `--col-splitter=string-or-regex`
>the splitter for --cols, can be regex or string format, by default it's `/\s+/`

----

`-n string-or-regex`, `--line-splitter=string-or-regex`
>the line separator, can be regex or string format, by default we're splitting on lines so it's `\n`

---

## Examples

Only output lines that begin with the word `var`:
```    
nip 'function(l) { return /^var/.test(l); }' lines-that-start-with-var.txt
```

Output every second line only in uppercase in a file:

```
nip 'function(line, i) { return i % 2 ? line.toUpperCase() : false; }' every-2nd-line.txt
```

Trim whitesplace from a file:

```
nip 'return line.replace(/^s*|s*$/g, "");' trim-lines.txt
```

Run the contents of `jsfile.js` on `file.txt`:

```
nip -f jsfile.js file.txt
```

Like most unix commands, you can pipe the input and/or output:

generate a script file to rename files recursively and sequentiality  
`find . -type f |  nip 'return "mv " + line + " " + line.replace(/\/[^/]*$/, "") + "/" + index;' > rename-script`

rename files recursively and sequentiality  
`find . -type f |  nip 'return "mv " + line + " " + line.replace(/\/[^/]*$/, "") + "/" + index;' | sh`

find the biggest number from all files in a directory:

    nip '
      var biggest = 0;
      this.on("end", function() { print(biggest); });
      return function(_,i,lines) {
        biggest = Math.max(biggest,
          Math.max.apply(Math, lines.match(/(?:\s|^)[\d]+(?:\.\d*)?(?:\s|$)/g))
        )
      }' -1 *

---

By default there are `start`, `end`, `fileStart`, and `fileEnd` events you can register by doing `this.on('end', function() {})`

The context inside the main function can be used as a global store, and has a `filename` property

---

### Why
This is for people who aren't "devops" and who can't crank out a fancy piped shell script using `awk` and `sed`. Also most programmers who have node installed can write a quick javascript one+ liner to do what the oldschoolers would make a shell script out of.

https://github.com/kolodny/nip


[npm-image]: https://img.shields.io/npm/v/nip.svg?style=flat-square
[npm-url]: https://npmjs.org/package/nip
[travis-image]: https://img.shields.io/travis/kolodny/nip.svg?style=flat-square
[travis-url]: https://travis-ci.org/kolodny/nip
[coveralls-image]: https://img.shields.io/coveralls/kolodny/nip.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/kolodny/nip
[downloads-image]: http://img.shields.io/npm/dm/nip.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/nip
