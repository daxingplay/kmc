/*
combined files : 

circular-requires/mods/mod1
circular-requires/init
circular-requires/init

*/
/**
 * mod1.js
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-19
 * @requires: kissy 1.2+
 */
KISSY.add('circular-requires/mods/mod1',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[mod1.js] ';

    return {
        init:function () {

        }
    }
}, {
    requires: [
        '../init'
    ]
});
/**
 * init
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-9-19
 * @requires: kissy 1.2+
 */
KISSY.add('circular-requires/init',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[init] ';

    return {
        init:function () {

        }
    }
}, {
    requires: [
        './mods/mod1'
    ]
});
