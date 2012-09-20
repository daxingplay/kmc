/**
 *
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

describe('Analyze Test', function(){

    afterEach(function(){
        ModuleCompiler.clean();
    });

    describe('A simple project with only one package analyze:', function(){
        ModuleCompiler.config({
            packages: [{
                name: 'sample',
                path: srcPath,
                charset: 'gbk'
            }]
        });
        var result = ModuleCompiler.analyze(path.resolve(srcPath, './sample/init.js'));
        it('result should be right', function(){
            result.should.have.property('name', 'sample/init');
            result.should.have.property('path', path.resolve(srcPath, './sample/init.js'));
            result.should.have.property('submods').with.lengthOf(2);
        });
    });

    describe('exclude mod2 test', function(){
        ModuleCompiler.config({
            packages: [{
                name: 'sample',
                path: srcPath,
                charset: 'gbk'
            }],
            exclude: ['mod2']
        });
        var result = ModuleCompiler.analyze(path.resolve(srcPath, './sample/init.js'));
        it('dependencies should only have one module.', function(){
            result.should.have.property('submods').with.lengthOf(1);
        });
    });
});