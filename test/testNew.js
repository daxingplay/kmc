/**
 *
 * @author: 橘子<daxingplay@gmail.com>
 * @time: 13-3-12 11:43
 * @description:
 */

var kmc = require('../index'),
    fs = require('fs'),
    path = require('path');

var testFile = path.resolve(__dirname, './src/package2/init.js');

kmc.config({
    packages: [{
        name: 'package2',
        path: path.resolve(__dirname, './src/'),
        charset: 'utf-8'
    }],
    silent: true,
    charset: 'gbk'
});
kmc.analyze(testFile);