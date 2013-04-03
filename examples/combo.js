/**
 *
 * @author: daxingplay<daxingplay@gmail.com>
 * @time: 13-3-12 11:43
 * @description:
 */

var kmc = require('../index'),
    fs = require('fs'),
    path = require('path'),
    srcPath = path.resolve(__dirname, '../test/src/'),
    distPath = path.resolve(__dirname, '../test/dist');

var result;

// build with only one package.
kmc.config({
    packages: [{
        name: 'package1',
        path: srcPath,
        charset: 'gbk'
    }],
    silent: true,
    charset: 'gbk'
});
result = kmc.analyze(path.resolve(srcPath, 'package1/build-with-kissy.js'));
console.log(result);

var file1 = path.resolve(srcPath, 'package1/build-with-kissy.js'),
    file1output = path.resolve(distPath, 'package1/build-with-kissy.js');
kmc.config({
    packages: [{
        name: 'package1',
        path: srcPath,
        charset: 'gbk'
    }],
    silent: true,
    charset: 'gbk'
});
result = kmc.build(file1, file1output, 'gbk', 'dep.js');

//kmc.config({
//    packages: [{
//        name: 'package2',
//        path: srcPath,
//        charset: 'utf-8'
//    }],
//    silent: true,
//    charset: 'gbk'
//});
//kmc.analyze(testFile);
//
//kmc.clean();
//
//kmc.config({
//    packages: [{
//        name: 'package1',
//        path: srcPath,
//        charset: 'gbk'
//    }, {
//        name: 'package2',
//        path: srcPath,
//        charset: 'utf-8'
//    }],
//    silent: true,
//    charset: 'gbk'
//});
//result = kmc.analyze(path.resolve(srcPath, 'package1/two-package-simple.js'));
//kmc.build(path.resolve(srcPath, 'package1/two-package-simple.js'), path.resolve(distPath, 'test.js'), 'gbk', 'dep.js');

console.log(result);