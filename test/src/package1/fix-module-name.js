/**
 * fix-module-name
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 11/24/13
 * @requires: kissy 1.2+
 */
KISSY.add(function (S, Node) {
    var $ = Node.all;
    var LOG_PRE = '[fix-module-name] ';

    return {
        init: function () {
        }
    }
}, {
    requires: [
        'node',
        './mods/mod2'
    ]
});