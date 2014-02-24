ajaxterm={};
ajaxterm.Terminal_ctor=function(id,width,height,logfile) {
	var ie=0;
	if(window.ActiveXObject)
		ie=1;
	var sid=""+Math.round(Math.random()*1000000000);
	var query0="s="+sid+"&w="+width+"&h="+height+"&logfile="+logfile;
	var query1=query0+"&c=1&k=";
	var buf="";
	var timeout;
	var error_timeout;
	var keybuf=[];
	var sending=0;
	var rmax=1;

	var div=document.getElementById(id);
	var dstat=document.createElement('pre');
	var sled=document.createElement('span');
	var opt_get=document.createElement('a');
	var opt_color=document.createElement('a');
	var opt_paste=document.createElement('a');
	var sdebug=document.createElement('span');
	var dterm=document.createElement('div');

	function debug(s) {
		sdebug.innerHTML=s;
	}
	function error() {
		sled.className='off';
		debug("Connection lost timeout ts:"+((new Date).getTime()));
	}
	function opt_add(opt,name) {
		opt.className='off';
		opt.innerHTML=' '+name+' ';
		dstat.appendChild(opt);
		dstat.appendChild(document.createTextNode(' '));
	}
	function do_get(event) {
		opt_get.className=(opt_get.className=='off')?'on':'off';
		debug('GET '+opt_get.className);
	}
	function do_color(event) {
		var o=opt_color.className=(opt_color.className=='off')?'on':'off';
		if(o=='on')
			query1=query0+"&c=1&k=";
		else
			query1=query0+"&k=";
		debug('Color '+opt_color.className);
	}
	function mozilla_clipboard() {
		 // mozilla sucks
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		} catch (err) {
			debug('Access denied, <a href="http://kb.mozillazine.org/Granting_JavaScript_access_to_the_clipboard" target="_blank">more info</a>');
			return undefined;
		}
		var clip = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
		var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
		if (!clip || !trans) {
			return undefined;
		}
		trans.addDataFlavor("text/unicode");
		clip.getData(trans,clip.kGlobalClipboard);
		var str=new Object();
		var strLength=new Object();
		try {
			trans.getTransferData("text/unicode",str,strLength);
		} catch(err) {
			return "";
		}
		if (str) {
			str=str.value.QueryInterface(Components.interfaces.nsISupportsString);
		}
		if (str) {
			return str.data.substring(0,strLength.value / 2);
		} else {
			return "";
		}
	}
	function do_paste(event) {
		var p=undefined;
		if (window.clipboardData) {
			p=window.clipboardData.getData("Text");
		} else if(window.netscape) {
			p=mozilla_clipboard();
		}
		if (p) {
			debug('Pasted');
			queue(encodeURIComponent(p));
		} else {
		}
	}
	function update() {
//		debug("ts: "+((new Date).getTime())+" rmax:"+rmax);
		if(sending==0) {
			sending=1;
			sled.className='on';
			var r=new XMLHttpRequest();
			var send="";
			while(keybuf.length>0) {
				send+=keybuf.pop();
			}
			var query=query1+send;
			if(opt_get.className=='on') {
				r.open("GET","u?"+query,true);
				if(ie) {
					r.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
				}
			} else {
				r.open("POST","u",true);
			}
			r.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			r.onreadystatechange = function () {
//				debug("xhr:"+((new Date).getTime())+" state:"+r.readyState+" status:"+r.status+" statusText:"+r.statusText);
				if (r.readyState==4) {
					if(r.status==200) {
						window.clearTimeout(error_timeout);
						de=r.responseXML.documentElement;
						if(de.tagName=="pre") {
							if(ie) {
								Sarissa.updateContentFromNode(de, dterm);
							} else {
								Sarissa.updateContentFromNode(de, dterm);
//								old=div.firstChild;
//								div.replaceChild(de,old);
							}
							rmax=100;
						} else {
							rmax*=2;
							if(rmax>2000)
								rmax=2000;
						}
						sending=0;
						sled.className='off';
						timeout=window.setTimeout(update,rmax);
					} else {
						debug("Connection error status:"+r.status);
					}
				}
			}
			error_timeout=window.setTimeout(error,5000);
			if(opt_get.className=='on') {
				r.send(null);
			} else {
				r.send(query);
			}
		}
	}
	function queue(s) {
		keybuf.unshift(s);
		if(sending==0) {
			window.clearTimeout(timeout);
			timeout=window.setTimeout(update,1);
		}
	}
	function init() {
		sled.appendChild(document.createTextNode('\xb7'));
		sled.className='off';
		dstat.appendChild(sled);
		dstat.appendChild(document.createTextNode(' '));
		opt_add(opt_color,'Colors');
		opt_color.className='on';
		opt_add(opt_get,'GET');
		opt_add(opt_paste,'Paste');
		dstat.appendChild(sdebug);
		dstat.className='stat';
		//div.appendChild(dstat);
		div.appendChild(dterm);
		if(opt_color.addEventListener) {
			opt_get.addEventListener('click',do_get,true);
			opt_color.addEventListener('click',do_color,true);
			opt_paste.addEventListener('click',do_paste,true);
		} else {
			opt_get.attachEvent("onclick", do_get);
			opt_color.attachEvent("onclick", do_color);
			opt_paste.attachEvent("onclick", do_paste);
		}
		//document.onkeypress=keypress;
		//document.onkeydown=keydown;
		timeout=window.setTimeout(update,100);
	}
	init();
}
ajaxterm.Terminal=function(id,width,height,logfile) {
	return new this.Terminal_ctor(id,width,height,logfile);
}

