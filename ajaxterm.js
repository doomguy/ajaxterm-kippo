
ajaxterm = {};

ajaxterm.Terminal_ctor = function (id, width, height, logfile) {
    var ie = 0,
        sid = "" + Math.round(Math.random() * 1000000000),
        query0 = "s=" + sid + "&w=" + width + "&h=" + height + "&logfile=" + logfile,
        query1 = query0 + "&c=1&k=",
        timeout,
        error_timeout,
        keybuf = [],
        sending = 0,
        rmax = 1,
        div = document.getElementById(id),
        dstat = document.createElement('pre'),
        sled = document.createElement('span'),
        opt_get = document.createElement('a'),
        opt_color = document.createElement('a'),
        opt_paste = document.createElement('a'),
        sdebug = document.createElement('span'),
        dterm = document.createElement('div');

    if (window.ActiveXObject) {
        ie = 1;
    }

    function debug(s) {
        sdebug.innerHTML = s;
    }

    function error() {
        sled.className = 'off';
        debug("Connection lost timeout ts:" + new Date.getTime());
    }

    function opt_add(opt, name) {
        opt.className = 'off';
        opt.innerHTML = ' ' + name + ' ';
        dstat.appendChild(opt);
        dstat.appendChild(document.createTextNode(' '));
    }

    function do_get(event) {
        opt_get.className = (opt_get.className === 'off') ? 'on' : 'off';
        debug('GET ' + opt_get.className);
    }

    function do_color(event) {
        var o = opt_color.className = (opt_color.className === 'off') ? 'on' : 'off';
        if (o === 'on') {
            query1 = query0 + "&c=1&k=";
        } else {
            query1 = query0 + "&k=";
        }
        debug('Color ' + opt_color.className);
    }

    function update() {
        //    debug("ts: "+((new Date).getTime())+" rmax:"+rmax);
        if (sending === 0) {
            sending = 1;
            sled.className = 'on';
            var r = new XMLHttpRequest(),
                send = "",
                query = query1 + send;

            while (keybuf.length > 0) {
                send += keybuf.pop();
            }

            if (opt_get.className === 'on') {
                r.open("GET", "u?" + query, true);
                if (ie) {
                    r.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
                }
            } else {
                r.open("POST", "u", true);
            }
            r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            r.onreadystatechange = function () {
                //        debug("xhr:"+((new Date).getTime())+" state:"+r.readyState+" status:"+r.status+" statusText:"+r.statusText);
                if (r.readyState === 4) {
                    if (r.status === 200) {
                        window.clearTimeout(error_timeout);
                        de = r.responseXML.documentElement;
                        if (de.tagName === "pre") {
                            var content;
 							if(window.XMLSerializer){
 								content = de.outerHTML?de.outerHTML:(de.xml || (new XMLSerializer()).serializeToString(de));
                            } else {
                                content = de.outerHTML?de.outerHTML:de.xml;
                                //                old=div.firstChild;
                                //                div.replaceChild(de,old);
                            }
                            $(dterm).html(content);
                            rmax = 100;
                        } else {
                            rmax *= 2;
                            if (rmax > 2000) {
                                rmax = 2000;
                            }
                        }
                        sending = 0;
                        sled.className = 'off';
                        timeout = window.setTimeout(update, rmax);
                    } else {
                        debug("Connection error status:" + r.status);
                    }
                }
            }
            error_timeout = window.setTimeout(error, 5000);
            if (opt_get.className === 'on') {
                r.send(null);
            } else {
                r.send(query);
            }
        }
    }

    function queue(s) {
        keybuf.unshift(s);
        if (sending === 0) {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(update, 1);
        }
    }

    function init() {
        sled.appendChild(document.createTextNode('\xb7'));
        sled.className = 'off';
        dstat.appendChild(sled);
        dstat.appendChild(document.createTextNode(' '));
        opt_add(opt_color, 'Colors');
        opt_color.className = 'on';
        opt_add(opt_get, 'GET');
        dstat.appendChild(sdebug);
        dstat.className = 'stat';
        //div.appendChild(dstat);
        div.appendChild(dterm);
        if (opt_color.addEventListener) {
            opt_get.addEventListener('click', do_get, true);
            opt_color.addEventListener('click', do_color, true);
        } else {
            opt_get.attachEvent("onclick", do_get);
            opt_color.attachEvent("onclick", do_color);
        }
        //document.onkeypress=keypress;
        //document.onkeydown=keydown;
        timeout = window.setTimeout(update, 100);
    }
    init();
}

ajaxterm.Terminal = function (id, width, height, logfile) {
    return new this.Terminal_ctor(id, width, height, logfile);
}

