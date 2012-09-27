var ModuleCompiler = require('../lib/index'),
    should = require('should'),
    path = require('path'),
    fs = require('fs'),
    fileUtil = require('../lib/fileUtil'),
    srcPath = path.resolve(__dirname, './src'),
    distPath = path.resolve(__dirname, './dist');

function removeDistDir(){
    if(fs.existsSync(distPath)){
        fileUtil.rmdirsSync(distPath);
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
        config.should.have.property('charset', '');
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
        file.should.have.property('submods').with.lengthOf('2');
    });

    it('should have some modules in combo file', function(){
        var submods = result.files[0].submods;
        submods[0].name.should.equal('package1/mods/mod1');
        submods[0].status.should.equal('ok');
        submods[1].name.should.equal('package1/mods/mod2');
        submods[1].status.should.equal('ok');
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
        file.should.have.property('submods').with.lengthOf('4');
    });

    it('should have some modules in combo file', function(){
        var submods = result.files[0].submods;
        submods[0].name.should.equal('package1/mods/mod1');
        submods[0].status.should.equal('ok');
        submods[1].name.should.equal('package1/mods/mod2');
        submods[1].status.should.equal('ok');
        submods[2].name.should.equal('package2/mods/mod1');
        submods[2].status.should.equal('ok');
        submods[3].name.should.equal('package2/mods/mod2');
        submods[3].status.should.equal('ok');
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
        file.name.should.equal('package1/build-with-kissy');
        file.should.have.property('submods').with.lengthOf('6');
    });

    it('should not have package prefix in kissy modules.', function(){
        var submods = result.files[0].submods;
        submods[0].name.should.equal('dom');
        submods[0].status.should.equal('ok');
    });

    it('should have some modules in combo file', function(){
        var submods = result.files[0].submods,
            subModuleLength = submods.length;
        submods[subModuleLength - 2].name.should.equal('package1/mods/mod1');
        submods[subModuleLength - 2].status.should.equal('ok');
        submods[subModuleLength - 1].name.should.equal('package1/mods/mod2');
        submods[subModuleLength - 1].status.should.equal('ok');
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
        file.name.should.equal('package1/two-package-simple');
        file.should.have.property('submods').with.lengthOf('4');
        file.should.have.property('combined').with.lengthOf('3');
    });

    it('should have some excluded modules in submods', function(){
        var submods = result.files[0].submods;
        submods[0].name.should.equal('package1/mods/mod1');
        submods[0].status.should.equal('ok');
        submods[1].name.should.equal('package1/mods/mod2');
        submods[1].status.should.equal('excluded');
        submods[2].name.should.equal('package2/mods/mod1');
        submods[2].status.should.equal('ok');
        submods[3].name.should.equal('package2/mods/mod2');
        submods[3].status.should.equal('excluded');
    });

});