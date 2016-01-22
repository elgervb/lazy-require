/* global __dirname */
var lazyRequire = require(__dirname);
lazyRequire.options({basepath:'./'});


var mod = lazyRequire.load('yargs');

console.assert(mod, 'Module not loaded');

console.log('done!');