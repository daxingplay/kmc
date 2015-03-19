KISSY.use(['tb/abc/1.3.9/robot', 'node', 'dom', 'ua', 'event'],function(S, RRQ, Node, DOM, UA, Event) {
    var $ = Node.all;

    var Fix = function () {
    };

    S.augment(Fix, Event.Target, {
        show: function(){
        },
        setPosition: function (offerX, offerY) {

        }
    });

    RRQ.init({
        onSuccess: function(){
            var fix = new Fix();

            fix.on('hello', function(){
            });

            fix.show();
        }
    });
});
