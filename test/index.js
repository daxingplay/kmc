/**
 * kmc test file.
 * @author: 橘子<daxingplay@gmail.com>
 * @time: 13-3-13 10:46
 * @description:
 */

var ModuleCompiler = require('../index'),
    should = require('should'),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    iconv = require('iconv-lite'),
    utils = require('../lib/utils'),
    srcPath = path.resolve(__dirname, './src'),
    distPath = path.resolve(__dirname, './dist');

function removeDistDir(){
    if(fs.existsSync(distPath)){
        utils.rmdirsSync(distPath);
    }
}

before(function(){
    removeDistDir();
});

after(function(){
    removeDistDir();
});

afterEach(function(){
    ModuleCompiler.clean();
});


describe('When clean', function(){
    it('should get an empty options', function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            exclude: ['dom','base','event','anim'],
            charset: 'gbk',
            silent: true
        });
        ModuleCompiler.clean();
        var config = ModuleCompiler.config();
        config.should.have.property('packages').with.lengthOf(0);
        config.should.have.property('exclude').with.lengthOf(0);
        config.should.have.property('charset', 'utf8');
        config.should.have.property('silent', false);
    });
});

describe('When config', function(){

    var config;

    before(function(){
        var param = {
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }, {
                name: 'package2',
                path: srcPath,
                charset: 'utf-8'
            }, {
                name: 'kissy',
                path: srcPath,
                charset: 'utf-8'
            }, {
                name: 'not-found',
                path: '/home/xxx/lost-found',
                charset: 'gbk'
            }],
            exclude: ['mod2'],
            ignoreFiles: ['.*combo.js'],
            silent: true,
            charset: 'utf-8'
        };
        config = ModuleCompiler.config(param);
    });

    it('should have 3 packages since the last package path cannot be found.', function(){
        config.should.have.property('packages').with.lengthOf(3);
    });
    it('should have exclude, silent and charset', function(){
        config.should.have.property('exclude').with.lengthOf(1);
        config.should.have.property('ignoreFiles').with.lengthOf(1);
        config.should.have.property('silent', true);
        config.should.have.property('charset', 'utf-8');
    });
});

describe('When build with only one package', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/one-package-simple.js'),
        outputFile = path.resolve(distPath, 'package1/one-package-simple.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have file generated.', function(){
        var exists = false;
        if(fs.existsSync(outputFile)){
            exists = true;
        }
        exists.should.equal(true);
    });

    it('should build succesfull without any errors.', function(){
        result.should.have.property('success', true);
    });

    it('should contain a file list.', function(){
        result.should.have.property('files').with.lengthOf('1');
    });

    it('should have proper main module.', function(){
        var file = result.files[0];
        file.name.should.equal('package1/one-package-simple');
        file.should.have.property('requires').with.lengthOf('1');
    });

    it('should have some modules in combo file', function(){
        var submods = result.files[0].dependencies;
        submods.length.should.equal(1);
        submods[0].requires.length.should.equal(1);
        submods[0].name.should.equal('package1/mods/mod1');
        submods[0].dependencies[0].name.should.equal('package1/mods/mod2');
    });

});

describe('When build with a list of files', function(){

    var result;

    var inputFiles = [
            path.resolve(srcPath, 'package1/one-package-simple.js'),
            path.resolve(srcPath, 'package1/charset-gbk.js')
        ],
        outputFiles = [
            path.resolve(distPath, 'package1/one-package-simple.js'),
            path.resolve(distPath, 'package1/charset-gbk.js')
        ];

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFiles, outputFiles);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have file generated.', function(){
        result.should.have.property('success', true);
        result.should.have.property('files').with.lengthOf('2');
    });

});

describe('When build with module name', function(){

    var result;

    var inputFile = 'package1/one-package-simple.js',
        outputFile = path.resolve(distPath, 'package1/one-package-simple.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have file generated.', function(){
        result.should.have.property('success', true);
        result.should.have.property('files').with.lengthOf('1');
    });

});

describe('When build with two package', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/two-package-simple.js'),
        outputFile = path.resolve(distPath, 'package1/two-package-simple.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }, {
                name: 'package2',
                path: srcPath,
                charset: 'utf-8'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have file generated.', function(){
        var exists = false;
        if(fs.existsSync(outputFile)){
            exists = true;
        }
        exists.should.equal(true);
        result.should.have.property('success', true);
        result.should.have.property('files').with.lengthOf('1');
    });

    it('should have proper main module.', function(){
        var file = result.files[0];
        file.name.should.equal('package1/two-package-simple');
    });

    it('should have some modules in combo file', function(){
        var file = result.files[0];
        file.should.have.property('requires').with.lengthOf('2');
        file.should.have.property('dependencies').with.lengthOf('2');
        file.dependencies[0].name.should.equal('package1/mods/mod1');
        file.dependencies[1].name.should.equal('package2/mods/mod1');
    });

});

describe('When build with kissy', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/build-with-kissy.js'),
        outputFile = path.resolve(distPath, 'package1/build-with-kissy.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }, {
                name: 'kissy',
                path: srcPath,
                charset: 'utf-8'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have file generated.', function(){
        var exists = false;
        if(fs.existsSync(outputFile)){
            exists = true;
        }
        exists.should.equal(true);
        result.should.have.property('success', true);
        result.should.have.property('files').with.lengthOf('1');
    });

    it('should have proper main module.', function(){
        var file = result.files[0];
        file.should.have.property('name', 'package1/build-with-kissy');
        file.should.have.property('requires').with.lengthOf('3');
        file.should.have.property('dependencies').with.lengthOf('3');
        file.modules.should.have.property('package1/build-with-kissy');
    });

    it('should not have package prefix in kissy modules.', function(){
        var submods = result.files[0].modules;
        submods.should.have.property('dom');
        submods.should.have.property('event');
        submods['dom'].pkg.should.equal('kissy');
        submods['event'].pkg.should.equal('kissy');
    });

});


describe('When exclude', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/two-package-simple.js'),
        outputFile = path.resolve(distPath, 'package1/two-package-with-exclude.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }, {
                name: 'package2',
                path: srcPath,
                charset: 'utf-8'
            }],
            exclude: ['mod2'],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have file generated.', function(){
        var exists = false;
        if(fs.existsSync(outputFile)){
            exists = true;
        }
        exists.should.equal(true);
        result.should.have.property('success', true);
        result.should.have.property('files').with.lengthOf('1');
    });

    it('should have proper main module.', function(){
        var file = result.files[0];
        file.should.have.property('name', 'package1/two-package-simple');
    });

    it('should have some excluded modules in submods', function(){
        var file = result.files[0];
        file.modules['package2/mods/mod2'].should.have.property('status', 'excluded');
    });

});

describe('When specify a charset in config', function(){

    var result1,
        result2,
        result3;

    var inputFile = path.resolve(srcPath, 'package1/charset-gbk.js'),
        outputFile1 = path.resolve(distPath, 'package1/charset-test-gbk-1.js'),
        outputFile2 = path.resolve(distPath, 'package1/charset-test-gbk-2.js'),
        outputFile3 = path.resolve(distPath, 'package1/charset-test-utf8-1.js');

    function testCharset(file, charset){
        var fileContent = fs.readFileSync(file);
        fileContent = iconv.decode(fileContent, charset);
        return fileContent.match(/模块/g);
    }

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }, {
                name: 'package2',
                path: srcPath,
                charset: 'utf-8'
            }],
            silent: true,
            charset: 'gbk'
        });
        result1 = ModuleCompiler.build(inputFile, outputFile1);
        result2 = ModuleCompiler.build(inputFile, outputFile2, 'gbk');
        result3 = ModuleCompiler.build(inputFile, outputFile3, 'utf-8');
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should be gbk in result1', function(){
        var match = testCharset(outputFile1, 'gbk');
        match.length.should.equal(2);
    });

    it('should be gbk in result2', function(){
        var match = testCharset(outputFile2, 'gbk');
        match.length.should.equal(2);
    });

    it('should be utf-8 in result3', function(){
        var match = testCharset(outputFile3, 'utf-8');
        match.length.should.equal(2);
    });

});

describe('When two modules depend on each other', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/circular-requires.js'),
        outputFile = path.resolve(distPath, 'package1/circular-requires.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have 4 modules', function(){
        var submods = result.files[0].modules;
        submods.should.have.property('package1/mods/mod3');
        submods.should.have.property('package1/mods/mod4');
        submods.should.have.property('package1/mods/mod5');
        submods.should.have.property('package1/circular-requires');
    });

    it('should have 4 combined modules', function(){
        var combined = result.files[0].combined;
        combined.length.should.equal(4);
    });
});

describe('When build and combo, ', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/build-with-kissy.js'),
        outputFile = path.resolve(distPath, 'package1/build-with-kissy.js'),
        depFile = path.resolve(distPath, 'package1/dep.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile, 'gbk', 'dep.js');
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have dep file called dep.js', function(){
        var isExists = fs.existsSync(depFile);
        isExists.should.equal(true);
    });

    it('should have proper config.', function(){
        var depContent = iconv.decode(fs.readFileSync(depFile), 'gbk');
        depContent.should.equal("KISSY.config('modules', {" + os.EOL + " 'package1/build-with-kissy': { requires: ['dom', 'event']} " + os.EOL + "});");
    });

});

describe('When only combo without build, ', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/one-package-simple.js'),
        depFile = path.resolve(distPath, 'package1/one-package-simple-dep.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.combo(inputFile, depFile, 'gbk', false);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have dep', function(){
        var isExists = fs.existsSync(depFile);
        isExists.should.be.true;
    });

});

describe('When using map, ', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/map.js'),
        outputFile = path.resolve(distPath, 'package1/map.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            map: [
                ['package1/', 'app/pkg/']
            ],
            silent: true
        });
        result = ModuleCompiler.build(inputFile, outputFile, 'utf-8');
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should build without error.', function(){
        var isExists = fs.existsSync(outputFile);
        isExists.should.be.true;
    });

    it('should have app prefix in module name.', function(){
        var main = result.files[0];
        main.should.have.property('name', 'app/pkg/map');
    });

    it('should replace content as well.', function(){
        var content = fs.readFileSync(outputFile).toString();
        // only match those in content, not in comments.
        var matches = content.match(/['"]app\/pkg\//g);
        matches.length.should.equal(7);
    });

});

describe('When require with dir', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/require-dir.js'),
        outputFile = path.resolve(distPath, 'package1/require-dir.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'utf-8'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have `package1/mods/index` module', function(){
        var submods = result.files[0].dependencies;
        submods.length.should.equal(1);
        submods[0].should.have.property('name', 'package1/mods/index');
    });

});

describe('When require with relative path', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/require-relative.js'),
        outputFile = path.resolve(distPath, 'package1/require-relative.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'utf-8'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have `package1/mods/mod2` module', function(){
        var submods = result.files[0].dependencies;
        submods.length.should.equal(2);
        submods[1].should.have.property('name', 'package1/mods/mod2');
    });

});

describe('When build with kissy gallery', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/build-with-gallery.js'),
        outputFile = path.resolve(distPath, 'package1/build-with-gallery.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'utf-8'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have `gallery/calendar/1.1/index` module', function(){
        var submods = result.files[0].dependencies;
        submods.length.should.equal(1);
        submods[0].should.have.property('name', 'gallery/calendar/1.1/index');
    });

});

describe('When build with files which have BOM', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/build-with-bom-file.js'),
        outputFile = path.resolve(distPath, 'package1/build-with-bom-file.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'utf-8'
            }],
            silent: true,
            charset: 'utf-8'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should not have BOM header any more', function(){
        var fileContent = fs.readFileSync(outputFile);
        /^\uFEFF/.test(fileContent).should.equal(false);
    });

});

describe('Support ignorePackageNameInUri for package config', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'a/aa.js'),
        outputFile = path.resolve(distPath, 'a/a-build.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'page',
                path: srcPath,
                charset: 'utf-8',
                ignorePackageNameInUri: true
            }],
            silent: true,
            charset: 'utf-8'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('file should not have package name in file path', function(){
      var mod1 = result.files[0];
      var filePath = mod1.path;
      var depFile = mod1.dependencies[0].path;
      /page/.test(depFile).should.equal(false);
      /page/.test(filePath).should.equal(false);
      /page/.test(outputFile).should.equal(false);
    });

    it('module name should have package name', function(){
      var mod = result.files[0];
      var depModName = mod.dependencies[0].name;
      /page/.test(mod.name).should.equal(true);
      /page/.test(depModName).should.equal(true);
    });

});

describe('When build all files in a dir recursively', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package3/'),
        outputFile = path.resolve(distPath, 'package3/');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package3',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile, undefined, undefined, true);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should build succesfull without any errors.', function(){
        result.should.have.property('success', true);
    });

    it('should contain a file list.', function(){
        result.should.have.property('files').with.lengthOf('3');
    });

});

describe('When parsing process has an error', function(){

    var result;
    var hasError = false;

    var inputFile = path.resolve(srcPath, 'package1/error.js'),
        outputFile = path.resolve(distPath, 'package1/error.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath
            }],
            silent: true
        });
        try{
            result = ModuleCompiler.build(inputFile, outputFile);
        }catch(e){
            hasError = true;
        }
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should throw error.', function(){
        hasError.should.equal(true);
    });

});

describe('When modules have css files', function(){

    var result;
    var hasError = false;

    var inputFile = path.resolve(srcPath, 'package1/require-css.js'),
        outputFile = path.resolve(distPath, 'package1/require-css.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath
            }],
            silent: true
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should resolve css files.', function(){
        var mod = result.files[0];
        var dep = mod.dependencies[0];
        var depModName = dep.name;
        /package1/.test(mod.name).should.equal(true);
        /package1/.test(depModName).should.equal(true);
        dep.type.should.equal('css');
    });

});

describe('When use KISSY 1.3+ package format', function(){

    var config;

    before(function(){
        config = ModuleCompiler.config({
            packages: {
                'package1': {
                    base: srcPath
                }
            },
            silent: true
        });
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper config.', function(){
        config.pkgs.should.have.property('package1');
    });

});

describe('When alias was configured', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package1/alias.js'),
        outputFile = path.resolve(distPath, 'package1/alias.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath
            }],
            modules: {
                'package1/mods/mod2': {
                    alias: 'package1/mods/mod3'
                }
            },
            silent: true
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should use the name of mod3.', function(){
        var mod = result.files[0];
        var dep = mod.dependencies[0];
        var depModName = dep.name;
        depModName.should.equal('package1/mods/mod3');
    });

    it('should contain mod3 contents.', function(){
        var outputContent = fs.readFileSync(outputFile);
        /\[mod3/.test(outputContent).should.equal(true);
    });

    it('should not contain mod2 contents', function(){
        var outputContent = fs.readFileSync(outputFile);
        /\[mod2/.test(outputContent).should.equal(false);
    });
});

describe('When fix module name', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/fix-module-name.js'),
        depFile = path.resolve(distPath, 'package1/fix-module-name-dep.js'),
        outputDir = path.resolve(distPath, './fix-module-name');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true
        });
        result = ModuleCompiler.combo(inputFile, depFile, '', true, true, outputDir);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have dep file', function(){
        fs.existsSync(depFile).should.equal(true);
    });

    it('should have new module files', function(){
        fs.existsSync(path.resolve(outputDir, './package1/fix-module-name.js')).should.equal(true);
        fs.existsSync(path.resolve(outputDir, './package1/mods/mod2.js')).should.equal(true);
    });

    it('should have added module names to files', function(){
        /package1\/fix\-module\-name/.test(fs.readFileSync(path.resolve(outputDir, './package1/fix-module-name.js'))).should.equal(true);
        /package1\/mods\/mod2/.test(fs.readFileSync(path.resolve(outputDir, './package1/mods/mod2.js'))).should.equal(true);
    });
});

describe('When fix module name which package name is ignored', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/fix-module-name2.js'),
        depFile = path.resolve(distPath, 'package1/fix-module-name2-dep.js'),
        outputDir = path.resolve(distPath, './fix-module-name2');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'pkg1',
                path: path.resolve(srcPath, './package1'),
                ignorePackageNameInUri: true
            }],
            silent: true
        });
        result = ModuleCompiler.combo(inputFile, depFile, '', true, true, outputDir);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have dep file', function(){
        fs.existsSync(depFile).should.equal(true);
    });

    it('should have new module files', function(){
        fs.existsSync(path.resolve(outputDir, './fix-module-name2.js')).should.equal(true);
        fs.existsSync(path.resolve(outputDir, './mods/mod2.js')).should.equal(true);
    });

    it('should have proper module names', function(){
        result.modules.should.have.property('pkg1/fix-module-name2');
    });

    it('should have added module names to files', function(){
        /pkg1\/fix\-module\-name2/.test(fs.readFileSync(path.resolve(outputDir, './fix-module-name2.js'))).should.equal(true);
        /pkg1\/mods\/mod2/.test(fs.readFileSync(path.resolve(outputDir, './mods/mod2.js'))).should.equal(true);
    });
});

describe('When pass an object as arguments for build', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/one-package-simple.js'),
        outputFile = path.resolve(distPath, 'package1/one-package-simple.js'),
        depPath = path.resolve(distPath, 'dep/package1/one-package-simple.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build({
            src: inputFile,
            dest: outputFile,
            depPath: depPath,
            outputCharset: 'utf8'
        });
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper file generated', function(){
        fs.existsSync(outputFile).should.equal(true);
        fs.existsSync(depPath).should.equal(true);
    });
});

describe('When pass an object as arguments for combo', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/fix-module-name.js'),
        depFile = path.resolve(distPath, 'package1/fix-module-name-dep.js'),
        outputDir = path.resolve(distPath, './fix-module-name3');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'package1',
                path: srcPath,
                charset: 'gbk'
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.combo({
            src: inputFile,
            dest: outputDir,
            depPath: depFile,
            depCharset: 'utf8',
            fixModuleName: true,
            showFullResult: true
        });
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper file generated', function(){
        fs.existsSync(depFile).should.equal(true);
        fs.existsSync(path.resolve(outputDir, './package1/fix-module-name.js')).should.equal(true);
        fs.existsSync(path.resolve(outputDir, './package1/mods/mod2.js')).should.equal(true);
    });

});

describe('When use require in add function', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/in-function-require.js'),
        outputFile = path.resolve(distPath, 'package1/in-function-require.js');

    before(function(){
        ModuleCompiler.config({
            packages: {
                package1: {
                    base: srcPath,
                    charset: 'gbk'
                }
            },
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build({
            src: inputFile,
            dest: outputFile
        });
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper file generated', function(){
        fs.existsSync(outputFile).should.equal(true);
    });

    it('should have proper modules', function(){
        var file = result.files[0];
        file.name.should.equal('package1/in-function-require');
        file.should.have.property('requires').with.lengthOf('2');
    });

    it('should have requires array in outputfile', function(){
        var content = fs.readFileSync(outputFile);
        /'package1\/in\-function\-require',\s*\['node', '.\/mods\/mod2'\]/.test(content).should.equal(true);
    });

});

describe('When use require not properly in add function', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/in-function-require2.js'),
        outputFile = path.resolve(distPath, 'package1/in-function-require2.js');

    before(function(){
        ModuleCompiler.config({
            packages: {
                package1: {
                    base: srcPath,
                    charset: 'gbk'
                }
            },
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build({
            src: inputFile,
            dest: outputFile
        });
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper file generated', function(){
        fs.existsSync(outputFile).should.equal(true);
    });

    it('should have proper modules', function(){
        var file = result.files[0];
        file.name.should.equal('package1/in-function-require2');
        file.should.have.property('requires').with.lengthOf('1');
    });

    it('should have requires array in outputfile', function(){
        var content = fs.readFileSync(outputFile);
        /'package1\/in\-function\-require2',\s*\['node']/.test(content).should.equal(true);
    });

});

describe('When kissy was hacked', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/kissy-extend.js'),
        outputFile = path.resolve(distPath, 'package1/kissy-extend.js');

    before(function(){
        ModuleCompiler.config({
            packages: {
                package1: {
                    base: srcPath,
                    charset: 'gbk'
                }
            },
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build({
            src: inputFile,
            dest: outputFile
        });
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper modules', function(){
        var file = result.files[0];
        file.name.should.equal('package1/kissy-extend');
        file.should.have.property('requires').with.lengthOf('2');
    });
});

describe('When use kissy sub modules', function(){
    var result;
    var inputFile = path.resolve(srcPath, 'package1/kissy-sub-module.js'),
        outputFile = path.resolve(distPath, 'package1/kissy-sub-module.js');

    before(function(){
        ModuleCompiler.config({
            packages: {
                package1: {
                    base: srcPath,
                    charset: 'gbk'
                }
            },
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build({
            src: inputFile,
            dest: outputFile,
            depPath: path.resolve(distPath, 'package1/kissy-sub-module.map.js'),
        });
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper modules', function(){
        var file = result.files[0];
//        console.log(file);
        file.autoCombo['package1/kissy-sub-module'].length.should.equal(4);
    });
});

describe('When build package file(eg: packageName + .js)', function(){

    var result;

    var inputFile = path.resolve(srcPath, 'package5/menu.js'),
        outputFile = path.resolve(distPath, 'package5/menu.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'menu',
                path: path.resolve(srcPath, './package5/menu'),
                charset: 'gbk',
                ignorePackageNameInUri: true
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper main module.', function(){
        var file = result.files[0];
        file.name.should.equal('menu');
        file.should.have.property('requires').with.lengthOf('1');
    });

    it('should have some modules in combo file', function(){
        var submods = result.files[0].dependencies;
        submods.length.should.equal(1);
        submods[0].name.should.equal('menu/control');
    });

});

describe('When package name has slash and package name ignored', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/pkgNameWithSlash.js'),
        outputFile = path.resolve(distPath, 'package1/pkgNameWithSlash.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'test/abc',
                path: path.resolve(srcPath, './package1'),
                charset: 'gbk',
                ignorePackageNameInUri: true
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper main module.', function(){
        var file = result.files[0];
        file.name.should.equal('test/abc/pkgNameWithSlash');
        file.should.have.property('requires').with.lengthOf('0');
    });

});

describe('When package name has slash and package name not ignored', function(){
    var result;

    var inputFile = path.resolve(srcPath, 'package1/pkgNameWithSlash.js'),
        outputFile = path.resolve(distPath, 'package1/pkgNameWithSlash.js');

    before(function(){
        ModuleCompiler.config({
            packages: [{
                name: 'src/package1',
                path: path.resolve(srcPath, '../'),
                charset: 'gbk',
                ignorePackageNameInUri: false
            }],
            silent: true,
            charset: 'gbk'
        });
        result = ModuleCompiler.build(inputFile, outputFile);
    });

    after(function(){
        ModuleCompiler.clean();
    });

    it('should have proper main module.', function(){
        var file = result.files[0];
        file.name.should.equal('src/package1/pkgNameWithSlash');
        file.should.have.property('requires').with.lengthOf('0');
    });

});