/* global __dirname */
'use strict';
module.exports = (function(options) {
  var npm = require('npm');
  var log = require('npmlog');
  
  var packageJson = require(__dirname + '/package.json');
  
  var loadDev = function(module) {
    return requireNpm(module, true);
  };
  var load = function(module) {
     return requireNpm(module, false);
  };
  var requireNpm = function(module, isDev) {
    
    var moduleString = loadModuleStringFromPackageJson(module, isDev);
    
    return (function(moduleString, moduleName) {
      
      return npm.load({}, function error(err){
        if (err) throw err;
        
        var modulePath = __dirname + '/node_modules/' + moduleName
        try {
            return require(modulePath);
        } catch (loadError) {
          if (loadError.code && loadError.code === 'MODULE_NOT_FOUND') {
            log.info('Loading ' + moduleString +'...');
            npm.commands.install([moduleString], function (er, data) {
              if (er) throw er
              log.info('Installed module ' + module + ' with ' + data.length + ' dependencies');
              return require(modulePath);
            })
          };
        }
      });
    })(moduleString, module);
  };
  
  var fixVersion = function(version) {
    if (version) {
      return version.replace(/[^\d.]/g, '');
    }
    return false;
  };
  var loadModuleStringFromPackageJson = function(module, isDev) {
    isDev = isDev || false;
    var namespace = isDev ? packageJson.devDependencies : packageJson.dependencies;
    
    if (namespace && namespace.hasOwnProperty(module)) {
      var version = packageJson.devDependencies[module];
      if (version) {
        version = fixVersion(version);
        return module+'@'+version;
      }
      return module;
    }
    
    log.info('Loading ' + module + ' module which is not mentioned in package.json');
    return module;
  }
  
  return {
    loadDev: loadDev,
    load: load
  }
})();