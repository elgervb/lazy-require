'use strict';

module.exports = (function lazyRequire(options) {
  var npm = require('npm');
  var log = require('npmlog');
  var deasync = require('deasync');
  
  var basePath = __dirname + '/../..';
  
  var loadPackageJson = function() {
    var fs = require('fs');
    try {
      fs.statSync(basePath + '/package.json');
      log.info('Use package.json from ' + basePath + '/package.json');
      return require(basePath + '/package.json');
    } catch(err) {
      try {
        basePath = __dirname + '/.';
        log.info('Use package.json from ' + basePath + '/package.json');
        return require(basePath + '/package.json');
      } catch (err2) {
        // no package.json
      }
    }
  };
  var packageJson = loadPackageJson();
  
  var loadDev = function(module) {
    return requireNpm(module, true);
  };
  
  var load = function(module) {
     return requireNpm(module, false);
  };
  var requireNpm = function(module, isDev) {
    
    var result;
    var moduleString = loadModuleStringFromPackageJson(module, isDev);
    
    (function syncLoad(moduleString, moduleName) {
      npm.load({}, function error(err){
        if (err) throw err;
        
        var modulePath = basePath + '/node_modules/' + moduleName
        try {
            result = require(modulePath);
        } catch (loadError) {
          if (loadError.code && loadError.code === 'MODULE_NOT_FOUND') {
            log.info('Loading ' + moduleString +'...');
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
    
    log.info('Loading ' + module + ' module which is not mentioned in package.json ' + packageJson.name);
    return module;
  }
  
  return {
    loadDev: loadDev,
    load: load
  }
})();