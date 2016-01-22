/* global __dirname */
'use strict';
var lazyRequire = require(__dirname);


function rmdirSync(dir){
  var fs = require('fs');
  var s;
  try {
    s = fs.lstatSync(dir);
  } catch(err) {
    return;
  }
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
var mod = lazyRequire('yargs', {basepath:'./'});

console.assert(mod, 'Module not loaded');

console.log('done!');