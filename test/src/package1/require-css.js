/**
 * init.js for package 1. This package is utf-8 encoded.
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 13-11-9
 * @requires: kissy 1.2+
 */
KISSY.add(function (S) {
    return {
        init:function () {
            S.log('该文件为UTF-8编码');
        }
    }
}, {
    requires: [
        './mods/mod1.css'
    ]
});