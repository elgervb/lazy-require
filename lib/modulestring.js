module.exports = (function modulestring() {
  
  var log = require('npmlog');
  
  var retrievePackageJson = function(basePath) {
    var fs = require('fs');
    try {
      fs.statSync(basePath + '/package.json');
      var json = require(basePath + '/package.json');
      log.verbose('Use package.json from ' + basePath + '/package.json');
      return json;
    } catch(err) {
      if (err.code === 'ENOENT' && err.path === basePath){
        // no package.json found
        log.warn('No package.json found. path:', basePath, err);
        return;
      }
      throw err;
    }
  };
  
  var loadModuleStringFromPackageJson = function(basePath, module) {
    var packageJson = retrievePackageJson(basePath);
    if (!packageJson) {
      return module;
    }
    var dependencies = mergeDependencies(packageJson.devDependencies, packageJson.dependencies);
    
    if (dependencies && dependencies.hasOwnProperty(module)) {
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
  
  var mergeDependencies = function(depts1, depts2) {
   if (typeof depts1 === 'object' && typeof depts2 !== 'object') {
     return depts1;
   } else  if (typeof depts1 !== 'object' && typeof depts2 === 'object') {
     return depts2;
   }
   
   for (var key in depts2) {
     if (depts2.hasOwnProperty(key)) {
       depts1[key] = depts2[key];
     }
   }
  }
  
  
  return function load(basePath, module){
    return loadModuleStringFromPackageJson(basePath, module);
  };
})();