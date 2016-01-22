/* global __dirname */
'use strict';

module.exports = (function lazyRequire() {
  var npm = require('npm');
  var log = require('npmlog'); 
  var deasync = require('deasync');
  var path = require('path');
  var defaults = {
    basepath: path.normalize(__dirname + '/../..')
  };
  
  var mergeOptions = function(options) {
    if (typeof options === 'object') {
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          var value = options[key];
          if (key === 'basepath') {
            if (path.isAbsolute(value)) {
              value = path.normalize(value)
            } else {
              value = path.normalize(__dirname + '/' + value)
            }
          }
          defaults[key] = value;
        }
      }
    }
    return defaults
  }
 
  var requireNpm = function(module, options) {
    var result, moduleString;
    options = mergeOptions(options);
    moduleString = require('./lib/modulestring')(options.basepath, module);
    
    (function syncLoad(moduleString, moduleName) {
      npm.load({loglevel: 'silent'}, function error(err){
        if (err) throw err;
        
        var modulePath = options.basepath + '/node_modules/' + moduleName
        try {
            result = require(modulePath);
        } catch (loadError) {
          if (loadError.code && loadError.code === 'MODULE_NOT_FOUND') {
            log.info('Loading ' + moduleString +'...');
            
            // I would like to have the install summary disabled, but that is not yet possible
            // @see https://github.com/npm/npm/issues/10732
            npm.commands.install([moduleString], function (er, data) {
              if (er) throw er
              log.info('Installed module ' + module + ' with ' + data.length + ' dependencies');
              result = require(modulePath);
            })
          } else {
            throw loadError;
          }
        }
      });
    })(moduleString, module);
    
    while ( result === undefined) {
      deasync.sleep(100);
    }
    
    return result;
  };
  
  return function(module, options) {
      return requireNpm(module, options);
  }
})();