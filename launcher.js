(function() {
		var s  = localStorage,
			d  = document,
			h  = document.getElementsByTagName('head')[0];
		function l(s,cb) {
			var b  = (Math.random()*1e8>>0),
				j  = d.createElement('script'),
				i  = 'script_'+b;

			j	 = d.createElement('script'); j.id = i;
			j.src = s+'?'+'b='+b;
			h.appendChild(j);
			js.onload = js.onreadystatechange = function() {
				var r = this.readyState;
				if ((!r || r == "loaded" || r == "complete")) {
					// Handle memory leak in IE
					js.onload = js.onreadystatechange = null;
					head.removeChild( js );
					cb && typeof cb === 'function' && cb();
				}
			};
		}
		l('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
			console.log("jquery loaded");
		});

})(); // <-- woof!
