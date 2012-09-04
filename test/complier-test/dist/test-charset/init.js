/*
combined files : 

test-charset/mods/mod1
test-charset/mods/mod2
test-charset/init

*/
/**
 * mod1
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-8-28
 * @requires: kissy 1.2+
 */
KISSY.add('test-charset/mods/mod1',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[mod1] ';

    return {
        init:function () {
            S.log(LOG_PRE + ' hello world.');
        }
    }
});/**
 * mod2
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-8-28
 * @requires: kissy 1.2+
 */
KISSY.add('test-charset/mods/mod2',function (S) {
    var D = S.DOM,
        E = S.Event,
        LOG_PRE = '[mod2] ';

    return {
        init:function () {
            S.log(LOG_PRE + '你好，世界');
        }
    }
});/**
 * init
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-8-28
 * @requires: kissy 1.2+
 */
KISSY.add('test-charset/init',function (S) {

    S.ready(function(){
        for(var i=1; i<args.length; i++){
            try{
                args[i].init && args[i].init();
            }catch(e){
                S.log(e, 'dir');
            }
        }
        S.log('我用两种语言say hello，你看到了吗？');
    });

}, {
    requires: [
        './mods/mod1',
        './mods/mod2'
    ]
});