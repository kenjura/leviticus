module.exports = {
	template: function(str,args) {
		if (!args) throw new Error('template > args is not defined.');
		return str.replace( /\$(\w+)/g, function(em,g1){ 
			if (!args.hasOwnProperty(g1)) console.log('Utils.template > ERROR: args['+g1+'] not present in args.');
			else return args[g1].toString().replace(/'/g,'\\\'') 
		} );
	},
	validate: function(args,required,forbidden) {
		// console.log('Valid > begin.');
		// console.log('args=',args);
		// console.log('required=',required);
		// console.log('forbidden=',forbidden);
		// if (required.split) required = required.split(',');
		// for (var i = 0; i < required.length; i++) {
		// 	console.log(required[i],args.hasOwnProperty(required[i])); 
		// 	var foo = args.hasOwnProperty(required[i]) ? 'AAA' : 'BBB';
		// 	console.log(foo);
		// 	if (foo=='BBB') { console.log('FUCK ME'); throw new Error('FUCK'); }
		// 	else console.log('fuck you '+foo);
		// };

		// if (!forbidden) return;
		// if (forbidden.split) forbidden = forbidden.split(',');
		// for (var i = 0; i < forbidden.length; i++) { if (args.hasOwnProperty(forbidden[i])) throw new Error('FUCK') };

		// console.log('args',args,'required',required);
		iterate(required,function(a){
			if (!args.hasOwnProperty(a)) throw new Error('Missing required input: '+a);
			if (args[a]==null) throw new Error('Required input "'+a+'" is null.');
		});
		iterate(forbidden,function(a){ if (args[a]) throw new Error('Forbidden input was present: '+a) });
		
		function iterate(which,callback) {
			if (!which) return;
			if (typeof(which)=='string') which = which.split(',');
			for (var i = 0; arg = which[i]; i++) {
				callback(arg);
			}
		}
	},
	guid: function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4();
	},
	getMatches: function(string, regex, index) {
	    index || (index = 1); // default to the first capturing group
	    var matches = [];
	    var match;
	    while (match = regex.exec(string)) {
	        matches.push(match[index]);
	    }
	    return matches;
	}
};