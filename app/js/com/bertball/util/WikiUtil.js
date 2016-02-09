(function(){

com.bertball.util.WikiUtil = function(config,WikiImage) {
	var instance = ww.util.WikiUtil = this;

	this.wikiToHtml = function(wiki,article,noH1,allArticles) {
		if (!wiki) {
			console.warn('WikiUtil > nothing to render');
			return '';
		}

		console.info('WikiUtil > wikiToHtml > go');

		var loc = config.getLocation();
		instance.linkBase = window.location.origin + '/' + loc.db + '/';

		var html = wiki;
		instance.article = article;

		// convenience features
		// 1 - add title if none present
		if ( !noH1 && !article.articleName.match(/Special:/) && !html.match( /^=([^=\n]+)=/ ) && !html.match( /^__NOH1__/ ) ) html = '='+article.articleName+'=\n' + html;
		html = html.replace( /__NOH1__/g , '' );
		
		// basic formatting ------------------------------------------
		// nowiki
		html = html.replace( /<nowiki>([\d\D]*?)<\/nowiki>/g , instance.processNoWiki );
		html = html.replace( /^ ([^\n]*)$/mg , instance.processCodeBlock );
		html = html.replace( /<\/?[A-Za-z][^>]*>/g , instance.processHTML );
		//html = html.replace( /{(?!\|)([^\|]+\|)?([^}]*)}/g , instance.processJSON );
		// headers
		html = html.replace( /^===([^=\n]+)===/mg , '<h3>$1</h3>' );
		html = html.replace( /^==([^=\n]+)==/mg , '<h2>$1</h2>' );
		html = html.replace( /^=([^=\n]+)=/mg , '<h1>$1</h1>' );

		// bullets
		html = html.replace( /(\n|^)#([\d\D]*?)(\n(?!#)|$)/g , instance.processNumberedLists );
		html = html.replace( /(\n|^)\*([\d\D]*?)(\n(?!\*)|$)/g , instance.processBullets );
		/*
		html = html.replace( /^\*(.*)/g , '§B§$1§/B§' );
		html = html.replace( /\n\*\*\*(.*)/g , '§B§$1§/B§' );
		html = html.replace( /\n\*\*(.*)/g , '§B§$1§/B§' );
		html = html.replace( /\n\*(.*)/g , '§B§$1§/B§' );
		html = html.replace( /§B§/g , "<ul>\n\t<li>" );
		html = html.replace( /§\/B§/g , "\t</li>\n</ul>" );
		var re = new RegExp( '</ul>'+String.fromCharCode(13)+'*<ul>' , 'g' );
		re.global = true;
		html = html.replace( re, '' );
		//html = html.replace( /<\/ul>\n*<ul>/g , '' );
		*/
		
		// dd/dt
		html = html.replace( /^;([^:\n]*)\n?(?::(.*))?/gm , '<dl><dt>$1</dt><dd>$2</dd></dl>' );
		html = html.replace( /^:(.*)/m, '<dd>$1</dd>\n' );
		// hr
		html = html.replace( /---/g , '<hr>' );
		// inline
		html = html.replace( /'''''([^']+)'''''/g , '<b><i>$1</i></b>' );
		html = html.replace( /'''([^']+)'''/g , '<b>$1</b>' );
		html = html.replace( /''([^']+)''/g , '<i>$1</i>' );
		// html = html.replace( /''(.*?)''/g , '<i>$1</i>' );
		// strikethrough
		// html = html.replace( /--(.*?)--/g , '<strike>$1</strike>' );
		// embiggen
		html = html.replace( /\+\+\+([^\+]+)\+\+\+/g , '<span style="font-size: 200%;">$1</span>' );
		html = html.replace( /\+\+([^\+]+)\+\+/g , '<span style="font-size: 150%;">$1</span>' );
		// tables
		html = html.replace( /\{\|([\d\D]*?)\|\}/g , instance.processTable );
		// div/indent
		html = html.replace( /^\.\.\.(.*)$/mg , '<div class="indent2">$1</div>' );
		html = html.replace( /^\.\.(.*)$/mg , '<div class="indent1">$1</div>' );
		html = html.replace( /^\.(.*)$/mg , '<div>$1</div>' );
		// links
		html = html.replace( /\[\[([^\[\]\|#]*)(?:(\|[^\]\|#]*)+)?(?:#([^\]\|#]*))?\]\]/g , processLink );
		html = html.replace( /\[\[([^\[\]\|#\n]*)((\|[^\]\|#\n]*)+)?(?:#([^\]\|#\n]*))?\]\]/g , processLink );
		html = html.replace( /\[([^\]\n ]*)(?: ([^\]\n]+))?\]/g , instance.processExternalLink );

		// code
		// html = html.replace( /^ (.*)$/mg , '<code>$1</code>' );
		// paragraphs
		html = html.trim();
		// html = html.replace( /^.*$/gm , instance.processParagraphs );
		html = html.replace( /^[^\$\n].*$/gm , instance.processParagraphs );
		html = html.replace( /<p><\/p>/g , '' );
		// beautify HTML
		//html = beautifyHTML(html);
		
		// superscript
		html = html.replace( /\^([^\^]*)\^/g , '<sup>$1</sup>' );
		
		// restore nowiki blocks
		html = html.replace( /\$NOWIKI_(\d*)\$/g , instance.processNoWikiRestore );
		html = html.replace( /\$CODE_(\d*)\$/g , instance.processCodeBlockRestore );
		html = html.replace( /<\/code>\s*<code>/g , '\n' );
		html = html.replace( /\$HTML_(\d*)\$/g , instance.processHTMLRestore );
		//html = html.replace( /\$JSON_(\d*)\$/g , instance.processJSONRestore );
		
		// WORKING CODE for sectioning h1 and h2
		var find = /(?:<h1>)([^\|<]*)(?:\|([^<\|]*))?(?:\|([^<]*))?(?:<\/h1>)([\d\D]*?)(?=<h1|$)/g;
		var replace = '\
			<div class="sectionOuter sectionOuter1 $2" style="$3">\
				<h1>$1</h1>\
				<a name="$1"></a>\
				<div class="section section1">\
					$4\
					<!--SECTION-END-->\
					<!--<div style="clear: both;"></div>-->\
				</div>\
			</div>';
		var sidebarHtml = '';
		// html = html.replace( find , replace );
		html = html.replace( find , function(em,title,args,style,body){ 
			if (args=='right') {				
				sidebarHtml += em.replace(find,replace); 
				return '';
			}
			return em.replace(find,replace);
		});

		var find = /(?:<h2>)([^\|<]*)(?:\|([^<\|]*))?(?:\|([^<]*))?(?:<\/h2>)([\d\D]*?)(?=<h2|<\!--SECTION-END|$)/g;
	    	var replace = '\
	    		<div class="sectionOuter2 $2">\
	    			<h2>$1</h2>\
					<a id="$1" name="$1"></a>\
	    			<div class="section2">\
	    				$4\
						<!--<div style="clear: both;"></div>-->\
	    			</div>\
	    		</div>';
		html = html.replace( find , replace );

		// adding IDs to headers for TOC seeks
		var find = /(?:<h(\d)>)([^<]*)(?:<\/h\1>)/g;
		var replace = '<h$1 id="$2">$2</h$1>';
		html = html.replace( find, function(em,g1,g2){
			var id = g2.replace( /\s/g, '_' );
			return '<h'+g1+' id="'+id+'">'+g2+'</h'+g1+'>';
		});

		
		// EXPERIMENTAL SECTIONING
		/*
		var find = /(?:<h(\d)>)([^\|<]*)(?:\|([^<\|]*))?(?:\|([^<]*))?(?:<\/h\1>)([\d\D]*?)(?=<h\d|$)/g;
		var replace = '\
	    		<div class="sectionOuter level$1 $3" style="width: $4;">\
	    			<h$1>$2</h$1>\
	    			<div class="section">\
	    				$5\
					<div style="clear: both;"></div>\
	    			</div>\
	    		</div>';
		html = html.replace( find , replace );
		*/
		
		// wtf is this?
		// html = html.replace( />/g , '>\n' );
		
		// return html;
		return { html:html, sidebarHtml:sidebarHtml };

		function processLink(entireMatch,articleName,displayName,anchor) {
			var namespace = [].concat(articleName.match( /([^:]+)(?=:)/g )).pop();
			if (namespace) var res = instance.processSpecialLink(entireMatch,namespace,articleName,displayName);
			if (res) return res;
				
			// if (isNullOrEmpty(articleName)) return '<a href="#'+anchor+'" onclick="instance.findHeader(\''+anchor+'\')">'+anchor+'</a>';
			if (!articleName) return '<a ng-click="tocNav(\''+anchor.replace( /\s/g, '_' )+'\')">'+anchor+'</a>';
			
			if (!displayName) displayName = anchor || articleName;
			else if (displayName.substr(0,1)=='|') displayName = displayName.substr(1);
			
			if (!anchor) anchor = ''; else anchor = '#'+anchor;
			
			var active = true;
			// var la = article && article.linkedArticles;
			// if (la&&la.length) {
			// 	active = false;
			// 	for (var i = 0; i < la.length; i++) {
			// 		if (la[i]&&la[i].toLowerCase()==articleName.toLowerCase()) {
			// 			active = true;
			// 			break;
			// 		}
			// 	}
			// }
			active = _.some(allArticles,function(a){ return a.name==articleName });
			
			return '<a class="wikiLink '+(active?'active':'inactive')+'" data-articleName="'+articleName+'" href="'+instance.linkBase+articleName+anchor+'">'+displayName+'</a>';
		};
	};

	this.processNumberedLists = function(entireMatch) {	
		var lines = entireMatch.match( /^(.*)$/gm );
		var level = 1;
		var html = '\n<ol>';
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line.substr(0,1)!='#') continue;
			var lineLevel = line.match( /#+/ )[0].length;
			if (lineLevel > level) html += _.stringRepeat('<ol>',lineLevel-level);
			if (lineLevel < level) html += _.stringRepeat('</li></ol>',level-lineLevel);
			if (lineLevel == level && html != '\n<ol>') html += '</li>';
			level = lineLevel;
			//html += '\n'+_.stringRepeat('\t',lineLevel);
			html += '<li>'+line.replace( /#+/ , '');
		}
		
		if (level > 1) html += _.stringRepeat('</li></ol>',level);
		html += '</li></ol>\n';
		return html;
	};

	this.processBullets = function(entireMatch) {	
		var lines = entireMatch.match( /^(.*)$/gm );
		var level = 1;
		var html = '\n<ul>';
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line.substr(0,1)!='*') continue;
			var lineLevel = line.match( /\*+/ )[0].length;
			if (lineLevel > level) html += _.stringRepeat('<ul>',lineLevel-level);
			if (lineLevel < level) html += _.stringRepeat('</li></ul>',level-lineLevel);
			if (lineLevel == level && html != '\n<ul>') html += '</li>';
			level = lineLevel;
			//html += '\n'+_.stringRepeat('\t',lineLevel);
			html += '<li>'+line.replace( /\*+/ , '');
		}
		
		if (level > 1) html += _.stringRepeat('</li></ul>',level);
		html += '</li></ul>\n';
		return html;
	};
	this.processExternalLink = function(entireMatch,url,displayName) {
		if (!(displayName)) displayName = url;
		return '<a href="'+url+'">'+displayName+'</a>';	
	};
	this.processSpecialLink = function(entireMatch,namespace,articleName,displayName) {
		var args = [];
		if (!(displayName)) displayName = '';
		else {
			args = _.getMatches( entireMatch, /\|([^\|\]]+)/g, 0 );
			// var str = [].concat(entireMatch.match( /\[\[([^\]]+)\]\]/ )).pop();
			// if (str) args = str.split('|');
		}
		
		articleName = articleName.replace( namespace+':' , '' );
		
		function getArg(index) {
			if (args.length >= index) return args[index];
			else return '';
		}
		
		switch (namespace.toUpperCase()) {
			case 'IFRAME': return '<iframe src="'+articleName+'"'+getArg(0)+'></iframe>';
			case 'IMAGE': return WikiImage.getImageTag({name:articleName,args:args,article:instance.article});
			default:
				return null;
		}
	};

	this.processJSON = function(entireMatch,options,tag) {
		if (!instance._JSONTags) instance._JSONTags = [];
		instance._JSONTags.push( new JSONTag({options:options,body:'{'+tag+'}'}) );
		return '$JSON_'+(instance._JSONTags.length-1)+'$';		
	};
	this.processJSONRestore = function(entireMatch,arrayIndex) {
		var tag = instance._JSONTags[parseInt(arrayIndex)];
		return 'JSON tag: '+tag.render();
	};
	this.processHTML = function(entireMatch) {
		if (!instance._htmlTags) instance._htmlTags = [];
		instance._htmlTags.push(entireMatch);
		return '$HTML_'+(instance._htmlTags.length-1)+'$';		
	};
	this.processHTMLRestore = function(entireMatch,arrayIndex) {
		return instance._htmlTags[parseInt(arrayIndex)];
	};
	this.processNoWiki = function(entireMatch,wikiText) {
		if (!instance._noWiki) instance._noWiki = [];
		instance._noWiki.push(wikiText);
		return '$NOWIKI_'+(instance._noWiki.length-1)+'$';
	};
	this.processNoWikiRestore = function(entireMatch,arrayIndex) {
		return instance._noWiki[parseInt(arrayIndex)];
	};
	this.processCodeBlock = function(entireMatch,wikiText) {
		if (!instance._CodeBlock) instance._CodeBlock = [];
		instance._CodeBlock.push(wikiText);
		return '$CODE_'+(instance._CodeBlock.length-1)+'$';
	};
	this.processCodeBlockRestore = function(entireMatch,arrayIndex) {
		return '<code>'+instance._CodeBlock[parseInt(arrayIndex)]+'</code>';
	};
	this.processParagraphs = function(entireMatch) {
		if (entireMatch.substr(0,1)=='<') return entireMatch; // html? looks like it's already been converted, let's leave it alone
		if (entireMatch.indexOf('$HTML')>-1) return entireMatch;
		
		return '<p>'+entireMatch+'</p>';
	};

	this.processTable = function(entireMatch,tableBody) {	

		// ***************** LEX ***************
		// protect pipe characters inside a table that have nothing to do with cell boundaries
		entireMatch = entireMatch.replace( /\[\[[^\]\n]+\]\]/g , function(em) {
			return em.replace( /\|/g , '$BAR$' );
		});

		// table boundaries
		entireMatch = entireMatch.replace( /\{\|(?:([^>\n]*)>)?/g , '¦TABLE¦$1¦' );
		entireMatch = entireMatch.replace( /\|\}/g , '¦END TABLE¦' );

		// table rows
		entireMatch = entireMatch.replace( /^\|-/mg , '¦ROW BOUNDARY¦' );	
		
		// table headers
		
		// note 2013-04-02: tweaked TH regex to allow ! characters inside TD cells. Basically, a single ! is only a "start TH" if it is preceded by a newline.
		// note 2014-06-19: swapped out $ for \n inside the TH/TD optional HTML attributes section. In a character class, $ doesn't mean "end of line", it's always literal. For some reason.

		//entireMatch = entireMatch.replace( /!{1,2}(?:([^$>\|!]+)>|([0-9]+)\|)?([^!\|¦]+)(?=\n!|!!|\n\||\|\||¦)/gm , function(wholeMatch,m0,m1,m2,m3,m4,m5) {
		entireMatch = entireMatch.replace( /(?:^!|!!)(?:([^\n>\|!]+)>|([0-9]+)\|)?([^!\|¦]+)(?=\n!|!!|\n\||\|\||¦)/gm , function(wholeMatch,m0,m1,m2,m3,m4,m5) {
			m0 = m0 || '';
			m2 = m2 || '';
			if (m1!=''&&typeof(m1)!='undefined') return '¦TH¦colspan="'+m1+'" '+m0+'¦'+m2+'¦END TH¦';
			else return '¦TH¦'+m0+'¦'+m2+'¦END TH¦';			
			// m0 = !m0>
			// m1 = !m1| aka colspan
			// m2 = actual cell content
		} );	
		//return entireMatch;
		entireMatch = entireMatch.replace( /\|{1,2}(?:([^\n>\|!]+)>|([0-9]+)\|)?([^\|¦]+)(?=\n!|!!|\n\||\|\||¦)/gm , function(wholeMatch,m0,m1,m2,m3) {
			m0 = m0 || '';
			m2 = m2 || '';
			if (m1!=''&&typeof(m1)!='undefined') return '¦TD¦colspan="'+m1+'" '+m0+'¦'+m2+'¦END TD¦';
			else return '¦TD¦'+m0+'¦'+m2+'¦END TD¦';			
		} );	
		
		
		// ***************** FINAL ******************
		entireMatch = entireMatch.replace( /¦TABLE¦([^¦]*)¦/g , "<table $1><tr>" );
		entireMatch = entireMatch.replace( /¦END TABLE¦/g , "</tr></table>" );
		
		entireMatch = entireMatch.replace( /¦ROW BOUNDARY¦/g , "</tr><tr>" );
		
		entireMatch = entireMatch.replace( /¦TH¦([^¦]*)¦([^¦]*)¦END TH¦/g , "<th $1>$2</th>" );
		entireMatch = entireMatch.replace( /¦TD¦([^¦]*)¦([^¦]*)¦END TD¦/g , function(wholeMatch,m0,m1,m2) {
			return '<td '+(m0||'')+'>\n'+(m1||'')+'\n</td>';
		});

		entireMatch = entireMatch.replace( /\$BAR\$/g , '|' );
			
		// **************** RETURN *****************
		return entireMatch;
	};

	this.findHeader = function(name) {
		smoothScroll.animateScroll( null, '#'+name );
		// var headers = document.querySelectorAll('h1,h2,h3');
		// for (var i = 0; i < headers.length; i++) {
		// 	if (headers[i].innerHTML.trim()==name) {
		// 		var y = UIUtil.getPageOffset(headers[i]).y;
		// 		UIUtil.animate( document.body, 300, { scrollTop: y});
		// 		// document.body.scrollTop = y;
		// 		return;
		// 	}
		// }
	}
}

com.bertball.util.WikiUtil.$inject = ['config','WikiImage'];

angular.module('leviticus').service('WikiUtil',com.bertball.util.WikiUtil);


})();