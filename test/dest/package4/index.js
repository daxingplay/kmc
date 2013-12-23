/*
combined files : 

package4/adder
package4/index

*/
KISSY.add('package4/adder',['dom'], function(S,require){
	var Dom = require('dom');
	return {
		add: function(a,b,el){
			return Dom.html(el,a + b);
		}
	};
});
KISSY.add('package4/index',['./index.css', 'event', './adder'], function(S,require){
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
