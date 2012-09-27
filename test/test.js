/**
 * mocha test.
 * @author: daxingplay<daxingplay@gmail.com>
 * @time: 12-9-20 10:26
 * @description:
 */

var ModuleCompiler = require('../lib/index'),
    should = require('should'),
    path = require('path'),
    casesPath = path.resolve(__dirname, './cases/'),
    srcPath = path.resolve(casesPath, './src'),
    distPath = path.resolve(casesPath, './dist');

describe('Module Compiler Test', function(){

//    beforeEach(function(){
//        ModuleCompiler.clean();
//    });

    afterEach(function(){
        ModuleCompiler.clean();
    });

    describe('test clean function.', function(){
        it('options should be empty', function(){
            ModuleCompiler.clean();
            var config = ModuleCompiler.config();
            config.should.have.property('packages').with.lengthOf(0);
            config.should.have.property('exclude').with.lengthOf(0);
            config.should.have.property('charset', '');
            config.should.have.property('silent', false);
        });
    });

    describe('test config.', function(){

        var param = {
            packages: [{
                name: 'sample',
                path: srcPath,
                charset: 'gbk'
            }, {
                name: 'test-charset',
                path: srcPath,
                charset: 'utf-8'
            }, {
                name: 'kissy',
                path: '/home/xxx/src/',
                charset: 'utf-8'
            }],
            exclude: ['mod2'],
            silent: true,
            charset: 'utf-8'
        };
        it('kissy path not found. Module Compiler should have 2 packages.', function(){
            var config = ModuleCompiler.config(param);
            config.should.have.property('packages').with.lengthOf(2);
        });
        it('other config all right.', function(){
            var config = ModuleCompiler.config(param);
            config.should.have.property('exclude').with.lengthOf(1);
            config.should.have.property('silent', true);
            config.should.have.property('charset', 'utf-8');
        });
    });

    describe('A simple project with only one package analyze:', function(){
        it('result should be right', function(){
            ModuleCompiler.config({
                packages: [{
                    name: 'sample',
                    path: srcPath,
                    charset: 'gbk'
                }]
            });
            var result = ModuleCompiler.analyze(path.resolve(srcPath, './sample/init.js'));

            result.should.have.property('name', 'sample/init');
            result.should.have.property('path', path.resolve(srcPath, './sample/init.js'));
            result.should.have.property('submods').with.lengthOf(2);
        });
    });

    describe('exclude mod2 test', function(){
        it('dependencies should only have one module.', function(){
            ModuleCompiler.config({
                packages: [{
                    name: 'sample',
                    path: srcPath,
                    charset: 'gbk'
                }],
                exclude: 'mod2'
            });
            var result = ModuleCompiler.analyze(path.resolve(srcPath, './sample/init.js'));

            result.should.have.property('submods').with.lengthOf(2);
            result.submods[0].should.have.property('name', 'sample/mods/mod1');
            result.submods[1].should.have.property('name', 'sample/mods/mod2');
            result.should.have.property('combined').with.lengthOf(2);
            result.combined.should.eql(['sample/mods/mod1', 'sample/init']);
            result._moduleCache.should.be.a('object').and.have.property('sample/mods/mod1');
            result._moduleCache.should.have.property('sample/init');
        });
    });

    describe('add kissy package test', function(){
        var param = {
            packages: [{
                name: 'compile-with-kissy',
                path: srcPath,
                charset: 'gbk'
            }, {
                name: 'kissy',
                path: srcPath,
                charset: 'gbk'
            }]
        };
        it('kissy modules should not have kissy/ prefix.', function(){
            ModuleCompiler.config(param);
            var result = ModuleCompiler.analyze(path.resolve(srcPath, './compile-with-kissy/init.js'));

            result.should.have.property('submods').with.lengthOf(6);
            result.should.have.property('combined').with.lengthOf(4);
            result.combined.should.eql(['compile-with-kissy/mods/mod1', 'compile-with-kissy/mods/mod2', 'dom', 'compile-with-kissy/init']);
            result._moduleCache.should.be.a('object').and.have.property('dom');
        });
    });

//    describe('test charset.', function(){
//        var param = {
//            packages: [{
//                name: 'test-charset',
//                path: srcPath,
//                charset: 'gbk'
//            }, {
//                name: 'kissy',
//                path: srcPath,
//                charset: 'gbk'
//            }]
//        };
//        it('kissy modules should not have kissy/ prefix.', function(){
//            ModuleCompiler.config(param);
//            var result = ModuleCompiler.analyze(path.resolve(srcPath, './compile-with-kissy/init.js'));
//
//            result.should.have.property('submods').with.lengthOf(3);
//            result.should.have.property('combined').with.lengthOf(4);
//            result.combined.should.eql(['compile-with-kissy/mods/mod1', 'compile-with-kissy/mods/mod2', 'dom', 'compile-with-kissy/init']);
//            result._moduleCache.should.be.a('object').and.have.property('dom');
//        });
//    });
});