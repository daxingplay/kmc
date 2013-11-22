/**
 *
 * @author: daxingplay<daxingplay@gmail.com>
 * @time: 13-3-12 11:43
 * @description:
 */

var kmc = require('../index'),
    fs = require('fs'),
    path = require('path'),
    utils = require('../lib/utils'),
    srcPath = path.resolve(__dirname, '../test/src/'),
    distPath = path.resolve(__dirname, './dist');

var result;

// build with only one package.
kmc.config({
    packages: [{
        name: 'package1',
        path: srcPath,
        charset: 'gbk'
    }],
    modules: {
        'package1/mods/mod2': {
            alias: 'package1/mods/mod3'
        }
    },
    silent: true,
    charset: 'gbk'
});
result = kmc.analyze(path.resolve(srcPath, 'package1/alias.js'));
console.log(result);

// clean output.
if(fs.existsSync(distPath)){
    utils.rmdirsSync(distPath);
}