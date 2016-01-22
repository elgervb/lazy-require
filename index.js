'use strict';

module.exports = (function lazyRequire() {
  var npm = require('npm');
  var log = require('npmlog'); 
  var deasync = require('deasync');
  var path = require('path');
  var options = {
    basepath: path.normalize(__dirname + '/../..')
  };
  
  var loadDev = function(module) {
    return requireNpm(module, true);
  };
  
  var load = function(module) {
     return requireNpm(module, false);
  };
  var requireNpm = function(module, isDev) {
    
    var result;
    var moduleString = require('./lib/modulestring').load(options.basepath, module, isDev);
    
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
  
  return {
    loadDev: loadDev,
    load: load,
    options: function(additions) {
      if (typeof additions === 'object') {
        for (var key in additions) {
          if (additions.hasOwnProperty(key)) {
            var value = additions[key];
            if (key === 'basepath') {
              if (path.isAbsolute(value)) {
                value = path.normalize(value)
              } else {
                value = path.normalize(__dirname + '/' + value)
              }
            }
            options[key] = value;
          }
        }
      }
    }
  }
})();