/**
 *
 * @author: 橘子<daxingplay@gmail.com>
 * @time: 13-3-12 11:41
 * @description:
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    _ = require('lodash'),
    iconv = require('iconv-lite'),
    Compiler = require('./lib/compiler'),
    parseConfig = require('./lib/parse-config');

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
        console.log(c.modules);
        return c.analyze(inputFile);
    },
    build: function(inputFilePath, outputFilePath, outputCharset, autoComboFile){
        var self = this,
            c,
            config,
            target = path.resolve(inputFilePath),
            result = {
                'success': true,
                'files': []
            },
            combo = [];
        self._config = parseConfig.check(self._config, inputFilePath);
        config = _.cloneDeep(self._config);
        if(fs.existsSync(target)){
            if(fs.statSync(target).isDirectory()) {
                var targets = fs.readdirSync(target);
                for (var i in targets) {
                    if(!self._isFileIgnored(targets[i])){
                        var inputFile = path.resolve(target, targets[i]),
                            outputFile = path.join(outputFilePath, targets[i]);
                        if(path.extname(inputFile)==='.js') {
                            c = new Compiler(config);
                            var re = c.build(inputFile, outputFile, outputCharset);
                            re.modules = c.modules;
                            autoComboFile && combo.push(c.combo());
                            result.files.push(re);
                        }
                    }
                }
            } else {
                c = new Compiler(config);
                var re = c.build(target, outputFilePath, outputCharset);
                re.modules = c.modules;
                autoComboFile && combo.push(c.combo());
                result.files.push(re);
            }
        }else{
            // MC.build('pkgName/abc');
            var modulePath = self.getModulePath(inputFilePath);
            if(modulePath){
                c = new Compiler(config);
                var re = c.build(modulePath, outputFilePath, outputCharset);
                autoComboFile && combo.push(c.combo());
                result.files.push(re.dependencies);
            }else{
                result.success = false;
                !config.silent && console.info('[err]'.bold.red + ' cannot find target: %s', target);
            }
        }
        if(autoComboFile){
            var fd = fs.openSync(path.resolve(path.dirname(outputFilePath), autoComboFile), 'w');
            var comboBuffer = iconv.encode(combo.join("\n\n"), outputCharset);
            fs.writeSync(fd, comboBuffer, 0, comboBuffer.length);
            fs.closeSync(fd);
        }
        return result;
    },
    combo: function(inputFile, depFileName){
        var self = this,
            result = self.analyze(inputFile),
            content;

    },
    clean: function(){
        this._config = {
            packages: [],
            exclude: [],
            charset: '',
            silent: false
        };
        return true;
    }
};