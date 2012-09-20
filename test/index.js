var ModuleCompiler = require('../lib/index'),
    path = require('path');

// test charset setting. from utf-8 sources to gbk distribution.
var sourcePath = path.resolve(__dirname, './cases/src'),
    distPath = path.resolve(__dirname, './cases/dist');
ModuleCompiler.config({
    packages: [
        {
            name: 'test-charset',
            path: sourcePath,
            // this charset specifies source file charset.
            charset: 'utf-8'
        }
    ],
    suffix: '',
    // output to gbk distribution
    charset: 'gbk'
});

ModuleCompiler.build(path.resolve(sourcePath, './test-charset/init.js'), path.resolve(distPath, './test-charset/init.js'));

var app2 = 'test-charset-gbk2gbk';
ModuleCompiler.config({
    packages: [
        {
            name: app2,
            path: sourcePath,
            // this charset specifies source file charset.
            charset: 'gbk'
        }
    ],
    suffix: '',
    // output to gbk distribution
    charset: 'gbk'
});

ModuleCompiler.build(path.resolve(sourcePath, app2 + '/init.js'), path.resolve(distPath, app2 + '/init.js'));


var app3 = 'circular-requires';
ModuleCompiler.config({
    packages: [
        {
            name: app3,
            path: sourcePath,
            // this charset specifies source file charset.
            charset: 'gbk'
        }
    ],
    suffix: '',
    // output to gbk distribution
    charset: 'gbk'
});

ModuleCompiler.build(path.resolve(sourcePath, app3 + '/init.js'), path.resolve(distPath, app3 + '/init.js'));


