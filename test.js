/* global __dirname */
var lazyRequire = require(__dirname);
lazyRequire.options({basepath:'./'});


function rmdirSync(dir){
  var fs = require('fs');
  var s = fs.lstatSync(dir);
  if(s.isFile()){
    fs.unlinkSync(dir);
    return;
  }
  if(!s.isDirectory()){
    return;
  }

  var fileArr = fs.readdirSync(dir);
  for(var f in fileArr){
    rmdirSync(dir+'/'+fileArr[f]);
  }
  console.log('deleting dir ' + dir);
  fs.rmdirSync(dir);
}

rmdirSync('./node_modules/yargs');
var mod = lazyRequire.load('yargs');

console.assert(mod, 'Module not loaded');

console.log('done!');