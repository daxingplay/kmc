/**
 * KISSY Module Compiler
 * @author: daxingplay<daxingplay@gmail.com>
 * @time: 13-3-12 11:41
 * @description:
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    _ = require('lodash'),
    iconv = require('iconv-lite'),
    Compiler = require('./lib/compiler'),
    utils = require('./lib/utils'),
    parseConfig = require('./lib/parse-config');

function getModulePath(moduleName, config){
    for(var i = 0; i < config.packages.length; i++){
        var pkg = config.packages[i],
            mod = moduleName.match(new RegExp(pkg.name + '\/(.*)'));
        if(mod && mod[1]){
            var modulePath = path.resolve(pkg.path, pkg.name, mod[1].replace(/\.js/, '') + '.js');
            if(fs.existsSync(modulePath)){
                return modulePath;
            }
        }
    }
    return false;
}

module.exports = {
    _config: {},
    config: function(cfg){
        var self = this;
        if(cfg){
            self._config = parseConfig.parse(cfg, self._config);
        }
        self._config.packages = [];
        for(var pkg in self._config.pkgs){
            self._config.packages.push(self._config.pkgs[pkg]);
        }
        return this._config;
    },
    analyze: function(inputFile){
        var self = this;
        // to make sure there is at least one package in config.
        self._config = parseConfig.check(self._config, inputFile);
        // start to analyze.
        var c = new Compiler(self._config);
        return c.analyze(inputFile);
    },
    build: function(inputFilePath, outputFilePath, outputCharset, depFile, traverse){
        var self = this,
            targets = [],
            result = {
                'success': true,
                'files': []
            },
            combo = [];
        // for object arguments.
        if(_.isPlainObject(inputFilePath) && inputFilePath.src){
            outputFilePath = inputFilePath.dest;
            outputCharset = inputFilePath.outputCharset;
            depFile = inputFilePath.depPath;
            traverse = inputFilePath.traverse;
            inputFilePath = inputFilePath.src;
        }

        if(_.isString(inputFilePath)){
            var target = path.resolve(inputFilePath);
            if(fs.existsSync(target)){
                if(fs.statSync(target).isDirectory()){
//                    var files = fs.readdirSync(target);
                    _.forEach(utils.traverseDirSync(target, traverse), function(file){
                        var inputFile = path.resolve(target, file),
                            outputFile = path.resolve(outputFilePath, path.relative(target, file));
                        if(path.extname(inputFile) === '.js'){
                            targets.push({
                                src: inputFile,
                                dest: outputFile
                            });
                        }
                    });
                }else{
                    targets.push({
                        src: target,
                        dest: outputFilePath
                    });
                }
            }else{
                // MC.build('pkgName/abc');
                // in this case, package must be configured.
                var modulePath = getModulePath(inputFilePath, self._config);
                if(modulePath){
                    targets.push({
                        src: modulePath,
                        dest: outputFilePath
                    });
                }else{
                    console.error('[err]'.bold.green+' cannot find input file %s ', inputFilePath);
                }
            }
        }else if(_.isPlainObject(inputFilePath)){
            _.forEach(inputFilePath, function(file){
                if(fs.src){
                    targets.push({
                        src: file.src,
                        dest: file.dest ? file.dest : path.dirname(file.src)
                    });
                }
            });
        }else if(_.isArray(inputFilePath)){
            var destIsArray = _.isArray(outputFilePath) ? outputFilePath : false;
            _.forEach(inputFilePath, function(file, index){
                targets.push({
                    src: file,
                    dest: destIsArray && outputFilePath[index] ? outputFilePath[index] : outputFilePath
                });
            });
        }

        _.forEach(targets, function(file, index){
            self._config = parseConfig.check(self._config, file.src);
            var config = _.cloneDeep(self._config);
            var kmc = new Compiler(config);
            var re = kmc.build(file.src, file.dest, outputCharset);
            re.modules = kmc.modules;
            depFile && combo.push(re.autoCombo);
            result.files.push(re);
        });
        result.success = result.files.length !== 0;

        if(depFile){
            utils.writeFileSync(path.resolve(path.dirname(outputFilePath), depFile),
                utils.joinCombo(combo,path.extname(depFile)==='.json'), outputCharset);
        }

        return result;
    },
    info: function(inputFile){
        var self = this;
        self._config = parseConfig.check(self._config, inputFile);
        var config = _.cloneDeep(self._config);
        var c = new Compiler(config);
        c.analyze(inputFile);
        return c.info();
    },
    combo: function(inputFile, depFileName, depFileCharset, fixModuleName, returnDependencies, outputDir,comboOnly){
        var self = this,
            content,
            config;
        if(_.isObject(inputFile)){
            depFileName = inputFile.depPath;
            depFileCharset = inputFile.depCharset;
            fixModuleName = inputFile.fixModuleName;
            returnDependencies = inputFile.showFullResult;
            outputDir = inputFile.dest;
            inputFile = inputFile.src;
            comboOnly = inputFile.comboOnly;
        }
        self._config = parseConfig.check(self._config, inputFile);
        config = _.cloneDeep(self._config);
        fixModuleName = fixModuleName !== false;
		var outputFile = outputDir ? path.resolve(outputDir,path.basename(inputFile)) : '';
        var c = new Compiler(config,outputFile);
        var result = c.analyze(inputFile);
        content = c.combo(fixModuleName, outputDir,comboOnly,path.extname(depFileName || '')==='.json');
        if(content && depFileName){
            utils.writeFileSync(depFileName, content, depFileCharset);
        }
        return returnDependencies === true ? { files: [result], success: true, modules: c.modules, content: content } : content;
    },
    clean: function(){
        this._config = {
            packages: [],
            exclude: [],
            charset: 'utf8',
            silent: false
        };
        return true;
    }
};
