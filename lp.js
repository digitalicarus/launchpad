$(function() {
	var $builder      = $('#daBuilder'),
	    $scriptRes    = $('#scriptSrc'),
	    $script       = $('.scriptEntry'),
	    $addBut       = $('#addScript'),
	    $loadBut      = $('#loadScripts'),
	    $marklet      = $('#marklet'),
	    $batchMarklet = $('#batchMarklet'),
	    delButSel     = '.delButton',
	    entrySel      = '.scriptEntry',
	    markletSrc    = 'http://digitalicarus.github.com/launchpad/launcher.js',
	    tmpl          = {};

	function createMarklet(daScripts) {
		//-- load localStorage and cache bust the script load
		var daFunk = function() {
			var s  = localStorage,
				d  = document,
				h  = document.getElementsByTagName('head')[0];
			window.__lp = '__lp_data__';
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
				'__store__';
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
				.replace(/__src__/, markletSrc)
				.replace(/'__lp_data__'/, JSON.stringify(daScripts));

		batchMarklet = launchMarklet;
		batchMarklet = batchMarklet
				.replace(/'__notbatch__'/, "false")
				.replace(/'__batch__'/, goScriptsGo.join(";"));

		launchMarklet = launchMarklet
				.replace(/'__notbatch__'/, "true")
				//.replace(/'__store__'/, "s.setItem('launchpad', '"+JSON.stringify(daScripts)+"')")

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

	function buildStuff() {
		var daScripts = [];
		$(entrySel).each(function(i,ele) {
			daScripts.push({
				n: $(ele).find('.nameVal').val(),
				s: $(ele).find('.srcVal').val()
			});	
		});
		createMarklet(daScripts);
	}

	//-- compile templates
	$('[type*=doT]').each(function() {
		tmpl[this.id.replace(/Tmpl/, "")] = doT.compile(this.innerText);
	});

	//-- attach events
	$addBut.on('click', function(e) {
		$builder.append(tmpl.script({num: $builder.find('fieldset').length}));
	});

	$loadBut.on('click', function(e) {
		$(entrySel).remove();
		var data = JSON.parse(localStorage.getItem('launchpad'));
		for(var i in data) {
			var $curr = $(tmpl.script({num: $builder.find('fieldset').length})).appendTo($builder);
			$curr.find('.nameVal').val(data[i].n);
			$curr.find('.srcVal').val(data[i].s);
		}
		buildStuff();
	});

	$(delButSel).live('click', function(e) {
		var $this = $(this);
		$this.parent().remove();
		buildStuff();
	});


	$script.find('input').live('keyup', function(e) {
		buildStuff();
	});

});
