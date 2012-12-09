$(function() {
	var $builder      = $('#daBuilder'),
	    $scriptRes    = $('#scriptSrc'),
	    $script       = $('.scriptEntry'),
	    $addBut       = $('#addScript'),
	    $loadBut      = $('#loadScripts'),
	    $marklet      = $('#marklet'),
	    $batchMarklet = $('#batchMarklet'),
	    $limitTable   = $('#limitTableContainer'),
	    delButSel     = '.delButton',
	    entrySel      = '.scriptEntry',
	    //markletSrc    = 'http://digitalicarus.github.com/launchpad/launcher.js',
	    markletSrc    = 'http://localhost/~adhorton/lp/launcher.js',
	    nothinRegex   = new RegExp("^\s*$");
	    urlRegex      = new RegExp("((http|ftp|https|file):)?//([\w]*[\/\.]?)+");
	    tmpl          = {},
	    dangerZone    = 50,
	    googleReady   = false,
	    lengthLimits  = [
	    	{browser: "Netscape", limit: 2000},
	    	{browser: "Firefox", limit: 2000},
	    	{browser: "Opera", limit: 2000},
	    	{browser: "IE 4", limit: 2084},
	    	{browser: "IE 5", limit: 2084},
	    	{browser: "IE 6", limit: 508},
	    	{browser: "IE 6 SP2", limit: 488},
	    	{browser: "IE 7", limit: 2084},
	    	{browser: "IE 8", limit: 2200}
	    ],
	    //LZW Compression/Decompression for Strings
		LZW = {
			compress: function (uncompressed) {
				"use strict";
				// Build the dictionary.
				var i,
					dictionary = {},
					c,
					wc,
					w = "",
					result = [],
					dictSize = 256;
				for (i = 0; i < 256; i += 1) {
					dictionary[String.fromCharCode(i)] = i;
				}
		
				for (i = 0; i < uncompressed.length; i += 1) {
					c = uncompressed.charAt(i);
					wc = w + c;
					if (dictionary[wc]) {
						w = wc;
					} else {
						result.push(dictionary[w]);
						// Add wc to the dictionary.
						dictionary[wc] = dictSize++;
						w = String(c);
					}
				}
		
				// Output the code for w.
				if (w !== "") {
					result.push(dictionary[w]);
				}
				return result;
			},
		
		
			decompress: function (compressed) {
				"use strict";
				// Build the dictionary.
				var i,
					dictionary = [],
					w,
					result,
					k,
					entry = "",
					dictSize = 256;
				for (i = 0; i < 256; i += 1) {
					dictionary[i] = String.fromCharCode(i);
				}
		
				w = String.fromCharCode(compressed[0]);
				result = w;
				for (i = 1; i < compressed.length; i += 1) {
					k = compressed[i];
					if (dictionary[k]) {
						entry = dictionary[k];
					} else {
						if (k === dictSize) {
							entry = w + w.charAt(0);
						} else {
							return null;
						}
					}
		
					result += entry;
		
					// Add w+entry[0] to the dictionary.
					dictionary[dictSize++] = w + entry.charAt(0);
		
					w = entry;
				}
				return result;
			}
		}; // end LZW compress

	//-- TODO: compress everything except the script loader
	//http://stackoverflow.com/questions/294297/javascript-implementation-of-gzip
	function createMarklet(daScripts) {
		//-- load localStorage and cache bust the script load
		var daFunk = function() {
			var s  = localStorage,
				d  = document,
				h  = document.getElementsByTagName('head')[0];
			function l(s) {
				var b  = (Math.random()*1e8>>0),
				    j  = d.createElement('script'),
				    i  = 'script_'+b;
				
				j     = d.createElement('script'); j.id = i;
				j.src = s+'?'+'b='+b;
				h.appendChild(j);
			}
			'__batch__';
			if('__notbatch__') {
				window.__lp = '__lp_data__';
				l('__src__');
			}
		};

		var launchMarklet = "",
		    batchMarklet = "",
			goScriptsGo = [];

		$(daScripts).each(function(idx,item) {
			if(item.s && typeof item.s === "string" && item.s.length > 0) {
				goScriptsGo.push("l('"+item.s+"')");
			}
		});
		
		launchMarklet = daFunk
				.toString()
				.replace(/^\s*/mg, "")
				.replace(/\s*$/mg, "")
				.replace(/\s*=\s*/g,"=")
				.replace(/__src__/, markletSrc);

		batchMarklet = launchMarklet;
		batchMarklet = batchMarklet
				.replace(/'__notbatch__'/, "false")
				.replace(/'__batch__'/, goScriptsGo.join(";"));

		launchMarklet = launchMarklet
				.replace(/'__notbatch__'/, "true")
				//.replace(/'__lp_data__'/, '['+LZW.compress(JSON.stringify(daScripts))+']');
				.replace(/'__lp_data__'/, '"'+LZW.compress(JSON.stringify(daScripts)).map(function(item) { var s = item.toString(), l = s.length, ret = s; if(l===2) { s = "0"+s } return s; }).join("")+'"');
				//.replace(/'__lp_data__'/, JSON.stringify(daScripts));

		launchMarklet = "javascript: ("+launchMarklet.replace(/(\r\n|\n|\r)/gm, "")+")();";
		batchMarklet  = "javascript: ("+batchMarklet.replace(/(\r\n|\n|\r)/gm, "")+")();";

		console.log(launchMarklet);
		console.log(batchMarklet);

		$marklet.attr('href', launchMarklet);
		$batchMarklet.attr('href', batchMarklet);

		localStorage.setItem('launchpad', JSON.stringify(daScripts));
		window.foo = batchMarklet;
		/*																												
		js.onload = js.onreadystatechange = function() {                                                                     
			var r = this.readyState;
			if ((!r || r == "loaded" || r == "complete")) {          
				// Handle memory leak in IE                                                                                  
				js.onload = js.onreadystatechange = null;                                                                    
				head.removeChild( js );                                                                                    
			}                                                                                                                
		}; 
		*/ 
	}

	function validateStuff() {
		var n = null,
		    s = null,
		    nval = null,
		    sval = null;

		$(entrySel).each(function(i,ele) {
			$ele = $(ele);
			n = $ele.find('.nameVal');
			s = $ele.find('.srcVal');
			nval = n.val();
			sval = s.val();

			(!nval.match(nothinRegex)) ? n.removeClass('invalid') : n.addClass('invalid');
			(sval.match(urlRegex))     ? s.removeClass('invalid') : s.addClass('invalid');

			$ele.removeClass('invalid');
			$ele.has('.invalid').addClass('invalid');
			//$ele.filter(function() {return $(this).find('.invalid')}).addClass('invalid');
		});
	
	}

	function buildStuff() {
		var daScripts = [],
		    n = null,
		    s = null,
		    nval = null,
		    sval = null;

		$(entrySel).each(function(i,ele) {
			$ele = $(ele);
			n = $ele.find('.nameVal');
			s = $ele.find('.srcVal');
			nval = n.val();
			sval = s.val();
//
//			(!nval.match(nothinRegex)) ? n.removeClass('invalid') : n.addClass('invalid');
//			(sval.match(urlRegex))     ? s.removeClass('invalid') : s.addClass('invalid');
//
//			$ele.removeClass('invalid');
//			$ele.has('.invalid').addClass('invalid');
			//$ele.filter(function() {return $(this).find('.invalid')}).addClass('invalid');

			daScripts.push({
				n: nval,
				s: sval
			});	
		});
		createMarklet(daScripts);
	}

	function constructLengthLimitTable() {
		var limits = {},
		    curr   = $marklet.attr('href').length;

		limits.limits = [];
		//limits.limits = lengthLimits;
		limits.currentLength = curr;
		for(var i=0; i<lengthLimits.length; i++) {
			limits.limits[i] = $.extend({}, lengthLimits[i]);
			if(curr > limits.limits[i].limit) {
				limits.limits[i].over = true;
			} else if ((limits.limits[i].limit - curr) < dangerZone) {
				limits.limits[i].close = true;
			}
		}
		console.log(limits.limits);
		console.log(lengthLimits);
		//console.log(tmpl.limitTable(limits));
		$limitTable.html(tmpl.limitTable(limits));	
	}

	//-- compile templates
	$('[type*=doT]').each(function(i,v) {
		tmpl[v.id.replace(/Tmpl/, "")] = doT.compile(v.text);
	});
	constructLengthLimitTable();

	//-- attach events
	$addBut.on('click', function(e) {
		$builder.append(tmpl.script({num: $builder.find('fieldset').length}));
		validateStuff();
	});

	$loadBut.on('click', function(e) {
		$(entrySel).remove();
		var data = JSON.parse(localStorage.getItem('launchpad'));
		for(var i in data) {
			var $curr = $(tmpl.script({num: $builder.find('fieldset').length})).appendTo($builder);
			$curr.find('.nameVal').val(data[i].n);
			$curr.find('.srcVal').val(data[i].s);
		}
		validateStuff();
		buildStuff();
	});

	$(delButSel).live('click', function(e) {
		var $this = $(this);
		$this.parent().remove();
		buildStuff();
	});


	$script.find('input').live('keyup', function(e) {
		validateStuff();
		buildStuff();
		constructLengthLimitTable();
	});


	window.googleLoad = function(stuff) {
		console.log(stuff);
		//gapi.client.setApiKey('AIzaSyDCt03NAFkY5IH1ZObp338mR12M0Omcu9g');
        gapi.client.load('urlshortener', 'v1', function(){
			googleReady = true;
		});
	}

	//-- load google api
	$.getScript("https://apis.google.com/js/client.js?onload=googleLoad");
});
