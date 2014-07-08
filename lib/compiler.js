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

// modified by bachi@taobao.com 2013-12-12
// op:解析后文件（要输出的）路径
function Compiler(config, op){
	this.outputFilePath = op;
    this.modules = {};
    this.fileList = [];
    this.analyzedModules = [];
    this.combinedModules = [];
    this.buildComboModules = [];
    this.buildAnalyzedModules = [];
    this.config  = config;
    this.packages = config.packages;
}

Compiler.prototype._addModuleName = function(moduleContent, mod){
    var modName = mod.name;
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
        if(moduleNameRegResult !== null || oldModuleName.replace(/[\r\n\s]/g, '') === ''){
            // replace user comments or white spaces with my module name.
            moduleContent = moduleContent.replace(oldModuleName, '\'' + modName + '\', ');
        }
    } else if(start > -1 && end == start) {
        //KISSY.add(function(xxx))
        var addedContentArr = [moduleContent.slice(0, start), '\'' + modName + '\','];
        if(mod.version === '1.4+' && mod.requires){
            var requires = [];
            mod.requires.forEach(function(requirePath){
                requires.push("'" + requirePath + "'");
            });
            addedContentArr.push("[" + requires.join(", ") + "], ");
        }
        addedContentArr.push(moduleContent.slice(end));
        moduleContent = addedContentArr.join('');
    }

    return moduleContent;
};
Compiler.prototype._isFileIgnored = function(filePath){
    return utils.isExcluded(filePath, this.config.ignoreFiles);
};
Compiler.prototype._isModuleExcluded = function(modName){
    return utils.isExcluded(modName, this.config.exclude);
};
Compiler.prototype._getModuleRealPathByParent = function(requiredModule, parentModule){
    var self = this;
    if(requiredModule.match(/^\./) && _.isObject(parentModule)){
        return path.resolve(path.dirname(parentModule.path), utils.addPathSuffix(requiredModule));
    }else if(!requiredModule.match(/\//) || requiredModule.match(/^gallery\//)){
        // may be kissy module.
        return requiredModule;
    }else{
        for(var i = 0; i < self.packages.length; i++){
            var pkg = self.packages[i],
                mod = requiredModule.match(new RegExp(pkg.name + '\/(.*)'));
            if(mod && mod[1]){
                var modulePath = path.resolve(pkg.path, pkg.ignorePackageNameInUri ? './' : pkg.name, utils.addPathSuffix(mod[1]));
//                console.log('%s ==> %s, package path is %s, mod1 is %s ', requiredModule, modulePath, pkg.path, utils.addPathSuffix(mod[1]));
                if(fs.existsSync(modulePath)){
                    return modulePath;
                }
            }
        }
    }
    var lastPath = path.resolve(path.dirname(parentModule.path), utils.addPathSuffix(requiredModule));
    return fs.existsSync(lastPath) ? lastPath : requiredModule;
};
Compiler.prototype._getModuleRealPathByPkg = function(filePath, pkg){
    return path.resolve(pkg.path, pkg.name, utils.addPathSuffix(filePath));
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
    if(filePath.match(/^[a-zA-Z]+$/)){
        return 'kissy';
    }
    if(filePath.match(/^gallery\//)){
        return 'gallery';
    }
    if(!fs.existsSync(filePath)){
        return null;
    }
    // TODO optimize.
    for(var i = 0; i < self.packages.length; i++){
        var pkg = self.packages[i];

        var dirname = path.dirname(filePath);
        //by hanwen 2013-08-16
        //是否属于当前包
        var isBelongPkg = false;

        if(filePath.match(new RegExp(pkg.name))){
            isBelongPkg = true;
        } else if (pkg.ignorePackageNameInUri && (dirname.indexOf(pkg.path) > -1 || path.resolve(filePath) === path.resolve(pkg.path + '.js'))) {
            //增加ignorePackageNameInUri支持，使用路径判断，如果pkg.path和
            //filePath的路径进行对比
            isBelongPkg = true;
        }

        if(isBelongPkg){

            //如果有配置ignorePackageNameInUri, 把pkg.name忽略
            var name = pkg.ignorePackageNameInUri ? '' : pkg.name;
            var curRelativePath = path.relative(path.resolve(pkg.path, name), filePath);

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
    return path.normalize(moduleName.replace(/\.js$/i, '')).replace( /\\/g, '/' );
};
Compiler.prototype._buildCombo = function(mod){
    var self = this,
        result = {};
    _.forEach(mod.dependencies, function(subMod){
        if(_.indexOf(self.buildAnalyzedModules, subMod.name) === -1){
            self.buildAnalyzedModules.push(subMod.name);
            if(subMod.pkg == 'kissy' || subMod.status != 'ok' || subMod.type === 'css'){
                self.buildComboModules.push(subMod.name);
            }
            !_.isEmpty(subMod.dependencies) && self._buildCombo(subMod);
        }
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
                    // TODO require regex is toooooooooooo complex. So I chose the simple one.
                    content = content.replace(new RegExp("(['\"])" + requirePath + "(['\"])"), '$1' + mappedRequirePath + '$2');
                }
            }
        });
    }
    return content;
};
Compiler.prototype._generateRealModuleContent = function(mod){
    var self = this;
    if(!mod || !mod.path) return '';
    var fileContent = fs.readFileSync(mod.path);
    var modContent = iconv.decode(fileContent, mod.charset);
    // fix issue 23: remove file BOM before combo.
    if(/^\uFEFF/.test(modContent)){
        modContent = modContent.toString().replace(/^\uFEFF/, '');
    }

    modContent = self._addModuleName(modContent, mod);
    return self._mapContent(modContent, mod);
};
Compiler.prototype._alias = function(modName){
    var self = this;
    if(self.config.modules && self.config.modules[modName]){
        var modConfig = self.config.modules[modName];
        if(modConfig.alias){
            var modNew = {
                name: modConfig.alias,
                path: '',
                pkg: self._getModuleNameFromRequire(modConfig.alias)
            };
            if(modNew.pkg && self.config.pkgs[modNew.pkg]){
                var modPkg = self.config.pkgs[modNew.pkg];
                var dir = modPkg.ignorePackageNameInUri ? path.resolve(modPkg.path, '../') : modPkg.path;
                modNew.path = path.resolve(dir, utils.addPathSuffix(modNew.name));
                if(fs.existsSync(modNew.path)){
                    modNew.pkg = modPkg;
                    return modNew;
                }
            }
        }
    }
    return null;
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
        modType,
        modVersion,
        modRealPath;
    if(!inputFilePath) return null;
    // analyze module package
    modPkg = self._getPackage(inputFilePath);
    switch (modPkg){
        case null:
            !self.config.silent && console.log('cannot get package for %s, guess it is kissy module.', inputFilePath);
            mod = {
                name: inputFilePath,
                pkg: 'unknown' || self._getModuleNameFromRequire(inputFilePath),
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
        case 'gallery':
            mod = {
                name: inputFilePath,
                pkg: 'gallery',
                status: 'ok'
            };
            self.modules[mod.name] = mod;
            break;
        default :
            // get module real path based on package path.
            modRealPath = self._getModuleRealPathByPkg(inputFilePath, modPkg);
            if(!self._isFileIgnored(modRealPath)){
                modName = self._moduleName(modRealPath, modPkg);
                // map module names if user configured map rules.
                modName = self._mapModuleName(modName);
                var modAlias = self._alias(modName);
                if(modAlias){
                    modName = modAlias.name;
                    modPkg = modAlias.pkg;
                    modRealPath = modAlias.path;
                }
                if(_.indexOf(self.fileList, modRealPath) === -1){
                    // to avoid recursive analyze.
                    self.fileList.push(modRealPath);
                    if(!modRealPath.match(/\.css$/)){
                        // get this file's dependencies.
                        modRequires = dependencies.getRequiresFromFn(modRealPath, !self.config.silent);
                        if(modRequires.length){
                            modVersion = '1.4+';
                        }else{
                            modRequires = dependencies.requires(modRealPath);
                        }
                        // if user named module himself, use his name. map rules will not work then.
                        if(_.isPlainObject(modRequires) && modRequires.name){
                            modName = modRequires.name;
                            modRequires = modRequires.deps;
                        }
                        modType = 'js';
                    }else{
                        modRequires = [];
                        modType = 'css';
                    }
                    var isModExcluded = self._isModuleExcluded(modName);
                    // add this module to list.
                    mod = {
                        name: modName,
                        pkg: modPkg,
                        status: isModExcluded ? 'excluded' : 'ok',
                        path: modRealPath,
                        requires: modRequires,
                        dependencies: [],
                        dependencyTree: {},
                        charset: modPkg.charset || 'utf8',
                        type: modType,
                        version: modVersion
                    };
                    self.modules[modName] = mod;

                    if(modType === 'js'){
                        // analyze sub modules' dependencies recursively.
                        _.forEach(modRequires, function(subModPath){
                            var subMod = self.analyze(self._getModuleRealPathByParent(subModPath, mod));
                            if(subMod){
                                mod.dependencies.push(subMod);
                                mod.dependencyTree[subMod.name] = subMod.dependencyTree;
                            }
                        });

                        !isModExcluded && self.analyzedModules.push(modName);
                    }
                }else{
                    mod = self.modules[modName];
                }
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
    outputCharset = ((typeof outputCharset === 'undefined' || outputCharset === null) ? self.config.charset : outputCharset) || 'utf8';

    var combineFile = self.config.suffix ? outputFilePath.replace(/\.js$/i, self.config.suffix + '.js') : outputFilePath;
    if(path.extname(combineFile) != '.js'){
        combineFile = path.resolve(combineFile, path.basename(inputFilePath, '.js') + self.config.suffix + '.js');
    }
    result.outputFile = combineFile;

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
        var mod = self.modules[modName];
        // add EOL to end of file.
        var modContent = self._generateRealModuleContent(mod) + os.EOL;
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
Compiler.prototype.combo = function(fixModuleName, outputDir ,comboOnly, isJson){
    var self = this;
    var content = [];
    if(outputDir){
        outputDir = path.resolve(outputDir);
        if(!fs.existsSync(path.resolve(outputDir))){
            utils.mkdirsSync(outputDir);
        }
    }
    if(_.isObject(self.modules)){
        _.forEach(self.modules, function(mod, modName){
            if(_.indexOf(self.combinedModules, modName) === -1 && !_.isEmpty(mod.dependencies)){
                var requires = [];
                _.forEach(mod.dependencies, function(subMod){
                    requires.push(subMod.name);
                });

                if(isJson){
                    content.push("\"" + modName + "\": [\"" + requires.join("\", \"") + "\"]");
                }else{
                    content.push("'" + modName + "': { requires: ['" + requires.join("', '") + "']}");
                }
            }
            if(fixModuleName === true && mod && mod.path){
                var modContent = self._generateRealModuleContent(mod);
                var buffer = iconv.encode(modContent, mod.charset);
                var outputPath = mod.path;
                if(outputDir){
                    var relativePath = mod.name;
                    if(mod.pkg && mod.pkg.ignorePackageNameInUri){
                        relativePath = mod.name.replace(mod.pkg.name + '/', '');
                    }
                    if(mod.type === 'js'){
                        relativePath = relativePath + '.js';
                    }
                    outputPath = path.resolve(outputDir, relativePath);
                    utils.mkdirsSync(path.dirname(outputPath));
                }
				// info by 拔赤
				// 建议增加开关，是否写到目标路径，这样会便于用户自定义copy规则
				// 2013-12-12
				// bugfix:grunt-kmc配置comboOnly时，文件写的位置出错的bugfix
				if(comboOnly && comboOnly === true){
					var tModName = mod.pkg ? modName.replace(mod.pkg.name, '') : modName;
					if(outputPath.indexOf(path.normalize(tModName)) >= 0){
						fs.writeFileSync(outputPath, buffer);
					}
				} else {
					fs.writeFileSync(outputPath, buffer);
				}
            }
        });
    }
    var json="{" + os.EOL + " " + content.join("," + os.EOL + " ") + " " + os.EOL + "}";
    return content.length ?
        (isJson?json:"KISSY.config('modules', "+json+");") :
        "";
};


module.exports = Compiler;
