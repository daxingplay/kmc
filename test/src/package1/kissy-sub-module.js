/**
 * xtemplate
 * @author: 橘子（daxingplay）<daxingplay@gmail.com>
 * @date: 2/20/14
 * @requires: kissy 1.4+
 */
KISSY.add(function(S,require){
    require('./mods/mod1.css');
    var Event = require('event');
    var adder = require('./mods/mod1');
    var XTemplate = require('xtemplate/runtime');
    var Dom = require('dom');
    return {
        init:function(a,b,el,btn){
            S.log('hehe');
        }
    };
});