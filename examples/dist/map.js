/*
combined files : 

package1/mods/mod2
package1/mods/mod1
package1/map

*/
/**
 * mod2
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-26
 * @requires: kissy 1.2+
 */
KISSY.add('app/pkg/mods/mod2',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[mod2] ';

    return {
        init:function () {
            S.log('Mod2也是GBK编码');
        }
    }
});
/**
 * mod1
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-26
 * @requires: kissy 1.2+
 */
KISSY.add('app/pkg/mods/mod1',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[mod1] ';

    return {
        init:function () {
            S.log('Mod1也是GBK编码。');
        }
    }
}, {
    requires: [
        './mod2'
    ]
});
/**
 * map
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 13-4-11
 * @requires: kissy 1.2+
 */
KISSY.add('app/pkg/map',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[map] ';

    return {
        init: function () {
            S.log('test map.');
        }
    }
}, {
    requires: [
        'app/pkg/mods/mod1'
    ]
});
