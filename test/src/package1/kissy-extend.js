/**
 * kissy-extend
 * @author: 紫英（daxingplay）<daxingplay@gmail.com>
 * @date: 1/13/14
 * @requires: kissy 1.2+
 */
KISSY.add(function (S, Node) {
    var $ = Node.all;
    var LOG_PRE = '[kissy-extend] ';

    return {
        init: function () {
        }
    }
}, {
    requires: [
        'node',
        './mods/mod1'
    ],
    cssRequires: [
        './mods/mod1.css'
    ]
});