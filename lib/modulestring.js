module.exports = (function modulestring() {
  
  var log = require('npmlog');
  
  var retrievePackageJson = function(basePath) {
    var fs = require('fs');
    try {
      fs.statSync(basePath + '/package.json');
      var json = require(basePath + '/package.json');
      log.info('Use package.json from ' + basePath + '/package.json');
      return json;
    } catch(err) {
      // no package.json found
      log.warn('No package.json found.');
      return;
    }
  };
  
  var loadModuleStringFromPackageJson = function(basePath, module, isDev) {
    isDev = isDev || false;
    var packageJson = retrievePackageJson(basePath);
    if (!packageJson) {
      return module;
    }
    var namespace = isDev ? packageJson.devDependencies : packageJson.dependencies;
    
    if (namespace && namespace.hasOwnProperty(module)) {
      var version = packageJson.devDependencies[module];
      if (version) {
        version = fixVersion(version);
        return module+'@'+version;
      }
      return module;
    }
    
    log.info('Loading ' + module + ' module which is not mentioned in package.json of module ' + packageJson.name);
    return module;
  }
  
  var fixVersion = function(version) {
    if (version) {
      return version.replace(/[^\d.]/g, '');
    }
    return false;
  };
  
  return {
    load: function load(basePath, module, isDev){
      return loadModuleStringFromPackageJson(basePath, module, isDev);
    }
  }
})();