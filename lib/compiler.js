/**
 *
 * @author: daxingplay<daxingplay@gmail.com>
 * @time: 13-1-23 16:22
 * @description:
 */

var UglifyJS = require('uglify-js'),
    fs = require('fs'),
    path = require('path'),
    os = require('os'),
    _ = require('lodash'),
    iconv = require('iconv-lite'),
    getAst = require('./get-ast'),
    utils = require('./utils'),
    dependencies = require('./dependencies');

function Compiler(config){
    this.modules = {};
//    this.dependencyTree = {};
    this.fileList = [];
    this.analyzedModules = [];
    this.combinedModules = [];
    this.buildComboModules = [];
    this.buildAnalyzedModules = [];
    this.config  = config;
    this.packages = config.packages;
}

Compiler.prototype._addModuleName = function(moduleContent, modName){
    //add module path
    var start = moduleContent.indexOf('KISSY.add(');
    if(start == -1) {
        start = moduleContent.indexOf('.add(');
        if(start != -1) {
            start = start + 5;
        }
    } else {
        start = start + 10;
    }

    var end = moduleContent.indexOf('function', start);

    //find it
    if(start > -1 && end > start) {
        //KISSY.add(/*xxx*/function(xxx)) or KISSY.add('xxx', function(xxx))
        //remove user comments but preserve user defined module name.
        var oldModuleName = moduleContent.substring(start, end),
            moduleNameRegResult = oldModuleName.match(/^(\s*)\/\*(.*)\*\/(\s*)$/);
        if(moduleNameRegResult !== null){
            // replace user comments with my module name.
            moduleContent = moduleContent.replace(oldModuleName, '\'' + modName + '\', ');
        }
    } else if(start > -1 && end == start) {
        //KISSY.add(function(xxx))
        moduleContent = [moduleContent.slice(0, start), '\'' + modName + '\',', moduleContent.slice(end)].join('');
    }

    return moduleContent;
};
// TODO
Compiler.prototype._isFileIgnored = function(filePath){};
Compiler.prototype._getModuleRealPathByParent = function(requiredModule, parentModule){
    var self = this;
    if(requiredModule.match(/^\./) && _.isObject(parentModule)){
        return path.resolve(path.dirname(parentModule.path), requiredModule.replace(/\.js$/, '') + '.js');
    }else if(!requiredModule.match(/\//)){
        // may be kissy module.
        return requiredModule;
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
Compiler.prototype._getModuleRealPathByPkg = function(filePath, pkg){
    return path.resolve(pkg.path, pkg.name, filePath.replace(/\.js$/, '') + '.js');
};
/**
 * get module's package by its full path.
 * @param filePath this is file full path.
 * @return {*}
 * @private
 */
Compiler.prototype._getPackage = function(filePath){
    var self = this,
        pkgPath = '',
        modPkg = null;
    if(path.extname(filePath) == '.css'){
        return 'css';
    }
    if(filePath.match(/^[a-zA-Z]+$/)){
        return 'kissy';
    }
    if(!fs.existsSync(filePath)){
        return null;
    }
    // TODO optimize.
    for(var i = 0; i < self.packages.length; i++){
        var pkg = self.packages[i];
        if(filePath.match(new RegExp(pkg.name))){
            var curRelativePath = path.relative(path.resolve(pkg.path, pkg.name), filePath);
            if(pkgPath == '' || pkgPath.length > curRelativePath.length){
                pkgPath = curRelativePath;
                modPkg = pkg;
            }
        }
    }
    return modPkg;
};

Compiler.prototype._getModuleNameFromRequire = function(requirePath){
    var matches = /^([^\/]+?)\/\S+/.exec(requirePath);
    return matches && matches[1] ? matches[1] : '';
};
Compiler.prototype._moduleName = function(filePath, pkg){
    var relativePkgPath = path.relative(pkg.path, filePath).replace(/\\/g, '/'),
        moduleName = relativePkgPath.replace(/^\.\//, '');
    if(!utils.startWith(relativePkgPath, pkg.name + '/') && pkg.name !== 'kissy'){
        moduleName = pkg.name + '/' + moduleName;
    }
    return moduleName.replace(/\.js$/i, '');
};
Compiler.prototype._buildCombo = function(mod){
    var self = this,
        result = {};
    _.forEach(mod.dependencies, function(subMod){
        if((subMod.pkg == 'kissy' || subMod.status != 'ok') && _.indexOf(self.buildAnalyzedModules, subMod.name) === -1){
            self.buildComboModules.push(subMod.name);
            !_.isEmpty(subMod.dependencies) && self._buildCombo(subMod);
        }
        self.buildAnalyzedModules.push(subMod.name);
    });
    result[mod.name] = self.buildComboModules;
    return result;
};

Compiler.prototype._mapModuleName = function(modName){
    var self = this,
        rules = self.config.map;
    if(modName && !_.isEmpty(rules)){
        _.forEach(rules, function(rule){
            modName = modName.replace(new RegExp(rule[0]), rule[1]);
        });
    }
    return modName;
};
// TODO
Compiler.prototype._mapContent = function(content, mod){
    var self = this,
        rules = self.config.map;
    if(content && !_.isEmpty(content)){
        _.forEach(mod.requires, function(requirePath){
            if(!/^\.{1,2}/.test(requirePath)){
                var mappedRequirePath = requirePath;
                _.forEach(rules, function(rule){
                    mappedRequirePath = requirePath.replace(new RegExp(rule[0]), rule[1]);
                });
                if(mappedRequirePath != requirePath){
                    // TODO require reg is toooooooooooo complex. So I chose the simple one.
                    content = content.replace(new RegExp("(['\"])" + requirePath + "(['\"])"), '$1' + mappedRequirePath + '$2');
                }
            }
        });
    }
    return content;
};

Compiler.prototype.getAst = getAst;

/**
 * analyze a file's dependencies.
 * @param inputFilePath please use absolute file path.
 * @return {*}
 */
Compiler.prototype.analyze = function(inputFilePath){
    var self = this,
        mod = null,
        modRequires,
        modName,
        modPkg,
        modRealPath;
    if(!inputFilePath) return null;
    // analyze module package
    modPkg = self._getPackage(inputFilePath);
    switch (modPkg){
        case null:
            console.log('cannot get package for %s, use the first path in require path instead.', inputFilePath);
            mod = {
                name: inputFilePath,
                pkg: self._getModuleNameFromRequire(inputFilePath),
                status: 'missing'
            };
            self.modules[mod.name] = mod;
            break;
        case 'kissy':
            mod = {
                name: inputFilePath,
                pkg: 'kissy',
                status: 'ok'
            };
            self.modules[mod.name] = mod;
            break;
        case 'css':
            // TODO
            mod = {
                name: inputFilePath,
                pkg: null,
                type: 'css',
                status: ''
            };
            self.modules[mod.name] = mod;
            break;
        default :
            // get module real path based on package path.
            modRealPath = self._getModuleRealPathByPkg(inputFilePath, modPkg);
            modName = self._moduleName(modRealPath, modPkg);
            if(_.indexOf(self.fileList, modRealPath) === -1){
                // to avoid recursive analyze.
                self.fileList.push(modRealPath);
                // get this file's dependencies.
                modRequires = dependencies(modRealPath);
                // if user named module himself, use his name.
                if(_.isPlainObject(modRequires) && modRequires.name){
                    modName = modRequires.name;
                    modRequires = modRequires.deps;
                }
                // add this module to list.
                mod = {
                    name: self._mapModuleName(modName),
                    pkg: modPkg,
                    status: 'ok',
                    path: modRealPath,
                    requires: modRequires,
                    dependencies: [],
                    dependencyTree: {},
                    charset: modPkg.charset
                };
                self.modules[modName] = mod;

                // analyze sub modules' dependencies recursively.
                _.forEach(modRequires, function(subModPath){
                    var subMod = self.analyze(self._getModuleRealPathByParent(subModPath, mod));
                    if(subMod){
                        mod.dependencies.push(subMod);
                        mod.dependencyTree[subMod.name] = subMod.dependencyTree;
                    }
                });

                self.analyzedModules.push(modName);
            }else{
                mod = self.modules[modName];
            }
            break;
    }
    return mod;
};

Compiler.prototype.build = function(inputFilePath, outputFilePath, outputCharset){
    var self = this,
        result = self.analyze(inputFilePath),
        combinedComment = [
            '/*',
            'combined files : ',
            '',
            self.analyzedModules.join(os.EOL),
            '',
            '*/',
            ''
        ].join(os.EOL);

    // deal with output charset. if not specified, use charset in config.
    outputCharset = (typeof outputCharset === 'undefined' || outputCharset === null) ? self.config.charset : outputCharset;

    var combineFile = self.config.suffix ? outputFilePath.replace(/\.js$/i, self.config.suffix + '.js') : outputFilePath;

    //prepare output dir
    utils.mkdirsSync(path.dirname(combineFile));

    // if exists, unlink first, otherwise, there may be some problems with the file encoding.
    if(fs.existsSync(combineFile)){
        fs.unlinkSync(combineFile);
    }

    var fd = fs.openSync(combineFile, 'w');
    var combinedCommentBuffer = iconv.encode(combinedComment, outputCharset);
    fs.writeSync(fd, combinedCommentBuffer, 0, combinedCommentBuffer.length);
    fs.closeSync(fd);

    fd = fs.openSync(combineFile, 'a');

    _.forEach(self.analyzedModules, function(modName){
        var mod = self.modules[modName],
            modContent = iconv.decode(fs.readFileSync(mod.path), mod.charset);

        modContent = self._mapContent(modContent, mod);
        modContent = self._addModuleName(modContent, mod.name) + os.EOL;
        var buffer = iconv.encode(modContent, outputCharset);
        fs.writeSync(fd, buffer, 0, buffer.length);
        self.combinedModules.push(modName);
    });

    fs.closeSync(fd);

    !self.config.silent && console.info('[ok]'.bold.green+' %s ===> %s', inputFilePath, outputFilePath);

    result.autoCombo = self._buildCombo(result);

    result.combined = self.combinedModules;

    return result;
};
Compiler.prototype.combo = function(){
    var self = this,
        content = [];
    if(_.isObject(self.modules)){
        _.forEach(self.modules, function(mod, modName){
            if(_.indexOf(self.combinedModules, modName) === -1 && !_.isEmpty(mod.dependencies)){
                var requires = [];
                _.forEach(mod.dependencies, function(subMod){
                    requires.push("'" + subMod.name + "'");
                });
                content.push("'" + modName + "': { requires: [" + requires.join(', ') + "]}");
            }
        });
    }
    return content.length ? "KISSY.config('modules', {" + os.EOL + " " + content.join("," + os.EOL + " ") + " " + os.EOL + "});" : "";
};


module.exports = Compiler;