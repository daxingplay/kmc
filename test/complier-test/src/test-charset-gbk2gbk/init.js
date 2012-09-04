/**
 * init
 * @author: daxingplay<daxingplay@gmail.com>
 * @date: 12-8-28
 * @requires: kissy 1.2+
 */
KISSY.add(function (S) {

    S.ready(function(){
        for(var i=1; i<args.length; i++){
            try{
                args[i].init && args[i].init();
            }catch(e){
                S.log(e, 'dir');
            }
        }
        S.log('我用两种语言say hello，你看到了吗？这是GBK的文件哦～');
    });

}, {
    requires: [
        './mods/mod1',
        './mods/mod2'
    ]
});