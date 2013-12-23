/**
 *
 * @author: 橘子<daxingplay@gmail.com>
 * @time: 12/23/13 21:14
 * @description:
 */

var path = require('path');
var kmc = require('../index');

var pkgBase = path.resolve(__dirname, '../test/src');

kmc.config({
    packages: {
        package4: {
            base: pkgBase
        }
    }
});

kmc.build({
    src: path.resolve(pkgBase, './package4/index.js'),
    dest: path.resolve(__dirname, '../test/dest/package4/'),
    depPath: path.resolve(__dirname, '../test/dest/package4/map.js')
});