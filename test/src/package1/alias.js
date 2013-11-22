/**
 * init.js for package 1. This tests alias configuration.
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-26
 * @requires: kissy 1.2+
 */
KISSY.add(function (S) {
    var LOG_PRE = '[init.js] ';

    return {
        init:function () {
            S.log('Alias test');
        }
    }
}, {
    requires: [
        './mods/mod2'
    ]
});