KISSY.add(function(S,require){
	require('./index.css');
	var Event = require('event');
	var adder = require('./adder');
	return {
		init:function(a,b,el,btn){
			Event.on(btn,'click',function(){
				adder.add(parseInt(a.value),parseInt(b.value),el);
			});
		}
	};
});