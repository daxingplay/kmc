/**
 *
 * @author: daxingplay<daxingplay@gmail.com>
 * @time: 13-1-23 16:22
 * @description:
 */

var UglifyJS = require('uglify-js'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    getAst = require('./get-ast'),
    utils = require('./utils'),
    dependencies = require('./dependencies');

function Compiler(config){
    this.dependencies = {};
//    this.dependencyTree = {};
    this.fileList = [];
    this.config  = config;
    this.packages = config.packages;
}

Compiler.prototype.getAst = getAst;
/**
 * analyze a file's dependencies.
 * @param inputFilePath pleas use absolute file path.
 * @return {*}
 */
Compiler.prototype.analyze = function(inputFilePath){
    var self = this,
        mod,
        modDeps,
        modName,
        modPkg,
        modRealPath;
    // analyze module package
    modPkg = self.getPackage(inputFilePath);
    if(modPkg === null){
        console.log('cannot get package for ' + inputFilePath);
        return null;
    }
    // get module real path based on package path.
    modRealPath = self.getModuleRealPathByPkg(inputFilePath, modPkg);
    if(_.indexOf(self.fileList, modRealPath) === -1){
        // to avoid recursive analyze.
        self.fileList.push(modRealPath);
        // get this file's dependencies.
        modDeps = dependencies(modRealPath);
        // generate module name for this file.
        if(_.isArray(modDeps)){
            console.log(modDeps);
            modName = self.moduleName(modRealPath, modPkg);
        }else if(_.isPlainObject(modDeps)){
            modName = modDeps.name;
            modDeps = modDeps.deps;
        }
        // add this module to list.
        mod = {
            name: modName,
            pkg: modPkg,
            path: modRealPath,
            deps: modDeps
        };
        self.dependencies[modName] = mod;

        // analyze sub modules' dependencies recursively.
        _.forEach(modDeps, function(submod){
            self.analyze(self.getModuleRealPathByParent(submod, mod));
        });
    }
    return self.dependencies[modName];
};
Compiler.prototype.build = function(){};

Compiler.prototype.getModuleRealPathByParent = function(requiredModule, parentModule){
    var self = this;
    if(requiredModule.match(/^\./)){
        return path.resolve(path.dirname(parentModule.path), requiredModule.replace(/\.js$/, '') + '.js');
    }else{
        for(var i = 0; i < self.packages.length; i++){
            var pkg = self.packages[i],
                mod = requiredModule.match(new RegExp(pkg.name + '\/(.*)'));
            if(mod && mod[1]){
                var modulePath = path.resolve(pkg.path, pkg.name, mod[1].replace(/\.js/, '') + '.js');
                if(fs.existsSync(modulePath)){
                    return modulePath;
                }
            }
        }
    }
    return false;
};
Compiler.prototype.getModuleRealPathByPkg = function(filePath, pkg){
    return path.resolve(pkg.path, pkg.name, filePath.replace(/\.js$/, '') + '.js');
};
Compiler.prototype.getPackage = function(filePath){
    var self = this;
    if(path.extname(filePath) == '.css'){
        return null;
    }
    for(var i = 0; i < self.packages.length; i++){
        var pkg = self.packages[i];
        var fullPath = self.getModuleRealPathByPkg(filePath, pkg);
        if(fs.existsSync(fullPath)){
            return pkg;
        }
    }
    return null;
};
Compiler.prototype.moduleName = function(filePath, pkg){
    var relativePkgPath = path.relative(pkg.path, filePath).replace(/\\/g, '/'),
        moduleName = relativePkgPath.replace(/^\.\//, '');
    if(!utils.startWith(relativePkgPath, pkg.name + '/') && pkg.name !== 'kissy'){
        moduleName = pkg.name + '/' + moduleName;
    }
    return moduleName.replace(/\.js$/i, '');
};

module.exports = Compiler;