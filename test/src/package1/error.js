/**
 * init.js for package 1. This package has errors.
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-26
 * @requires: kissy 1.2+
 */
KISSY.add(function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[init.js] ';

    return {
        init:function () {
            S.('hello, throw me out!');
            S.log('');
        }
    }
}, {
    requires: [
        './mods/mod7'
    ]
});