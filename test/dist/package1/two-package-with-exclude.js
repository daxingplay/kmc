/*
combined files : 

package1/mods/mod1
package2/mods/mod1
package1/two-package-simple

*/
/**
 * mod1
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-26
 * @requires: kissy 1.2+
 */
KISSY.add('package1/mods/mod1',function (S) {
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
 * mod1
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-27
 * @requires: kissy 1.2+
 */
KISSY.add('package2/mods/mod1',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[mod1] ';

    return {
        init:function () {
            S.log('mod1 from package2.');
        }
    }
}, {
    requires: [
        './mod2'
    ]
});
/**
 * two-package-simple
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-27
 * @requires: kissy 1.2+
 */
KISSY.add('package1/two-package-simple',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[two-package-simple] ';

    return {
        init:function () {
            S.log('将两个包的文件打包在一起');
        }
    }
}, {
    requires: [
        './mods/mod1',
        'package2/mods/mod1'
    ]
});
