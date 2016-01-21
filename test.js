/* global __dirname */
var lazyRequire = require(__dirname + '/index.js');

var mod = lazyRequire.load('yargs');

console.assert(mod, 'Module not loaded');

