/*** Global constants  ***/
const rootpath = '/Cross/default/';
const staticpath = '/Cross/static/';
const rootpathajax = rootpath + 'ajax_';
const _DEBUG_ = true;
//const _DEBUG_ = false;
const _dbgstr1 = ' : value';
const _mypre = '<pre class="mypre">%s</pre>';
const $clrp = 'panel-primary', $clrs = 'panel-success', $clri = 'panel-info', $clrw = 'panel-warning', $clrd = 'panel-danger';
const stages = ['cross','vertical','plint','pair'];

//======================================
/*** log Helper  ***/
function log(msg) {
    console.log(msg);}
//======================================
/*** String escape Helper  ***/
String.prototype.escapeHTML = function() { return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
/*** String format Helper  ***/
String.prototype.format = function() {
    var newStr = this, i = 0;
    while (/%s/.test(newStr)) newStr = newStr.replace("%s", arguments[i++]);
    return newStr;
}
// or use javascript embedded expression format:
// `string1${arg1}string2${arg2}string3`
//======================================
//---------- jQuery extension function ---------------
$.fn.settofirst = function() { $(':nth-child(1)', this).attr('selected', 'selected'); }

$.fn.settovalue = function(value) { $('[value='+value+']' , this).attr('selected', 'selected'); }

$.fn.enumoptions = function (start) {
    var e = $('option', this) // get options set of select
    start = parseInt(start);
    if (e.length) {  // if options exist, simply change text
	if (_DEBUG_) $.each(e, function (i) {this.text = i + start + _dbgstr1+String(i+1)});
	    else $.each(e, function (i) {this.text = i + start});
    } else {
        this.prop('disabled', false);   // if it was early cleared and disabled, append new options
        for (i= 1; i <= 10; i++) {
            if (_DEBUG_) this.append($('<option>').text(i+start-1 + _dbgstr1+String(i)).attr('value', i));
		else this.append($('<option>').text(i+start-1).attr('value', i));
        }
    }
}
//======================================
function raise404() { window.location.href = 'http404'; }
//======================================
function addFormKey(dest, src) {
    dest.push({name:'user', value:src.user});
    //$.each(['formname', 'formkey'], function(){dest.push({name:this, value:src[this]})});
    $.each(['formname', 'formkey'], function(){dest.push({name:String(this), value:src[this]})});
}
//======================================
/*** saveData - add formkey, ajax(POST) data toserver, flash status result; ***/
// arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
function saveData(data, formdata, event) {
    event.preventDefault();
    event.stopPropagation();
    if (formdata.formkey && formdata.user) {
	addFormKey(data, formdata); // destination, source
	//console.log(data)
	data = sLoad('update', [], {}, data, 'POST');
    } else {
	data.details = 'Security error!';
	data.status = false;
	data.location = '#';
    }
    web2pyflash(data.details, data.status ? 'success' : 'danger');
    if (data.location) window.location.href = data.location;
    else history.back();
    //return false;
    //location.reload();
}
//======================================
/*** Ajax sync Load  ***/
function sLoad(ajaxurl, args, vars, senddata, type) {
    args = typeof args !== 'undefined' ? args : [];
    vars = typeof vars !== 'undefined' ? vars : [];
    type = typeof type !== 'undefined' ? type : 'GET';
    var out;
    var url = '';
    for (var i in args) url += '/' + args[i];
    if (!$.isEmptyObject(vars)) url += '?' + $.param(vars);
    //console.log(ajaxurl+'.json'+url)

    $.ajax({
        url: rootpathajax + ajaxurl + ".json" + url,
        type: type,
        async: false,
        data: senddata,
        //headers: { 'myReferer': '/Cross/default/pindex' },
        success: function(data) {out = data;},
        error: function(jqXHR) {
            //console.log(window.document.referrer)
            //location.href='user/login';
            if (jqXHR.statusText == "UNAUTHORIZED") {
                //history.pushState({id: 'SOME ID'}, '', 'myurl.html');
                //window.document.referrer = 'mymymyref';
                //var path='user/login'
    //history.pushState({note: 'note', path:path}, '', path);
    //history.replaceState({note: 'note', path:path}, 'Log in');
                //window.location.replace('user/login?_next=/Cross/default/index'+escape(window.location.hash));
                //window.location.replace('user/login');
                window.location.href = 'user/login';
            }
        }
    });
    return out;
}
//======================================
/*** Ajax async Load  ***/
function aLoad(cache, callback, ajaxurl, args) {
    args = typeof args !== 'undefined' ? args : [];
    var url = '';
    for (var i in args) url = url + '/' + args[i];
    if (!cache[ajaxurl]) {
        cache[ajaxurl] = {};
        cache[ajaxurl].targets = [];
        $.ajax({
            url: rootpathajax + ajaxurl + ".json" + url,
            //async: false,
	    beforeSend: function(){
		ajaxstate.during = true;
		ajaxstate.count++;//console.warn(ajaxstate.count);
	    },
	    //error: function(){ console.error('error'); },
	    //complete: function(xhr, status){ },
            success: function(data) {
		ajaxstate.count--;
		//console.log(this.url);
                cache[ajaxurl].data = data.data;
                //$.each(cache[ajaxurl].targets, function() { this() });
                while (cache[ajaxurl].targets.length) cache[ajaxurl].targets.pop()();	// local callback stack
                delete cache[ajaxurl].targets;
		if (ajaxstate.count == 0) {
		    ajaxstate.during = false;
		    while (ajaxstate.callback.length) {
			ajaxstate.callback.pop()();	// global callback stack
		    }
		}
            }
	});
    }
    if (cache[ajaxurl].data) callback();
    else cache[ajaxurl].targets.push(callback);
}
//======================================
/*** web2py flash message Helper  ***/
(function(){
    var flash = $("div.flash");
    web2pyflash = function(msg, status, delay) {
        status = typeof status !== 'undefined' ? status : 'success';
        delay = typeof delay !== 'undefined' ? delay : 3000;
        flash.html('<button type="button" class="close" aria-hidden="true">&times;</button>' + msg);
        var color;
        switch (status) {
            case 'danger': color = '#fbb'; break;   // red
            case 'default': color = '#eee'; break;  // grey
            case 'success': color = '#bfb'; break;  // green
            default: color = '#bfb';	// grey
        }
        flash.css({'background-color':color});
        if (delay) flash.slideDown().delay(delay).slideUp();
            else flash.slideDown();
    }
    web2pynoflash = function() { flash.slideUp(); }
})();
//======================================
/*** Simple JavaScript Templating John Resig - http://ejohn.org/ - MIT Licensed ***/
(function(){
  var cache = {};
  this.tmpl = function tmpl(str, data){
    //log(cache);
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();
function render(route, context) {
    //console.log(route)
    if (route.targetEl) route.targetEl.innerHTML = tmpl(route.templateId, context);
}

//======================================
/*** Router ***/
(function(){
    var routes = {};    // A hash to store our routes:
    const targetDIV = 'crosshome';	// content div, default

    route = function (args) {	// The route registering function:
	path = args[0].toLowerCase();
	name = args[1] || args[0];
	routes[path] = {ajaxurl: path || 'index', templateId: name+'Tmpl', controller: window[name+'Ctrl'], targetId: args[2] || targetDIV};
    }

    router = function  () {  // version with regex, replace
	var params = {};
	params.vars = {};
	params.args = location.hash.split("/");    // [""] - for home, ["#", "part1", "part2", ...]

	if (params.args.length > 1) {
	    params.args.pop().replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		function($0, $1, $2, $3) {
		    if ($3 == undefined) params.args.push($1);
		    else params.vars[$1] = $3;
		    });
	    } else params.args.push("");
	var route = routes[params.args[1]];   // Get route by url
	if (route && route.controller) {
	    route.targetEl = document.getElementById(route.targetId); // Lazy load view element
	    if (route.targetEl) {
		params.args = params.args.slice(2);
		route.controller(params, route);
	    }
	}
    }
})();
//======================================

$(function() {	// execute on document load

    L = sLoad('lexicon');   // Global lexicon
    tbheaders = [L._CROSS_, L._VERTICAL_, L._PLINT_, L._PAIR_];
    /*** Global inline templates ***/
    btnOkCancel = tmpl("btnOkCancelTmpl", {});
    btnBack = tmpl("btnBackTmpl", {});

/***  Set routes. args: ( [ path(toLowerCase), [name=path, by default] ] )  ***/
/***  templateId = name+Tmpl, controller = name+Ctrl  ***/
    var rs = [ ['', 'Cross'], ['Vertical'], ['EditCross'], ['EditVertical'], ['EditPlint'], ['EditPair'], ['EditFound'] ];
    $.each(rs, function () { route(this); });
    window.addEventListener('hashchange', router);    // Listen on hash change
    router();	//************* START APPLICATION *********
});

var $scope, L, tbheaders, btnOkCancel, btnBack;
var ajaxstate = {during:false, callback:[], count:0, cache:[]};
var mastersearch = $("#master-search");

document.onkeydown = function(e) {
    if (e.keyCode == 27) { // escape key code
        history.back();
        return false;
    }
}

/*** Translate JS call('func', arg1, arg2,... var1=value, var2=value,...) to window.location ***/
edit = function() { // args is: 0 - controller name (some 'editpair' or 'editfound'), args1, args2...
    var url, arg, vars=[];
    // redirect to web2py auth dialog if UNAUTHORIZED
    if (!$scope.user) url = `user/login?_next=${rootpath}index${escape(window.location.hash)}`;	// MDN templating
    else {
        var url = '#/edit'+arguments[0], len = arguments.length;
        //for (idx in arguments) url += arguments[idx] + '/'; // assign url some /#editpair/arg1/arg2, version with args only
        if (len>1) {
            for(var i=1;i<len;i++) {
		arg = arguments[i];
		if (typeof arg == "string" && arg.indexOf('=') > 0) vars.push(arg);
		else url += '/'+arguments[i];
            }
	    // spike, for "Edit chain" in Vertical view, add new arg "/chain" if checked checkbox
	    if (arguments[0] == 'pair' && localStorage.editchain == 'true') url += '/chain';
	    // end spike
	    if (vars.length) url += '?' + vars.join('&');
	    //console.log(url);
	}
    }
    window.location.href = url;
}

/*** Calculate executing time ***/
    //t1=(new Date()).getTime();
    //..............
    //console.log('exec time: '+((new Date()).getTime()-t1));
/*** replace content of JS element ***/
    //var results = document.getElementById("results");
    //results.innerHTML = tmpl("item_tmpl1", context);
/*** append to JS element ***/
    //var html1 = tmpl("item_tmpl2", context);
    //results.insertAdjacentHTML('beforeend', html1);

// multiline string example
//var test =`
//string text line 1
//string text line 2
//`;

  //var cars = {
    //'chevrolet aveo':{name: 'aveo', vendor:'chevrolet'},
    //'renault logan':{name: 'logan', vendor:'renault'},
    //'hyundai accent':{name: 'accent', vendor:'hyundai'},
    //'zaz forza':{name:'forza', vendor:'zaz'}
  //}
  //console.log(cars);
  //console.table(cars);

  //var myVariable = 'test';
  //var myVariable1 = 20;
  //var myVariable2 = 1.5;
  //var myObject = {qwerty:1,asdfgh:2};
  //console.log(
    //'My string variable is: "%s";\nMy int variable is:"%i"\nMy Float Variable is: "%f"\nMy Object is: "%o"',
    //myVariable,
    //myVariable1,
    //myVariable2,
    //myObject
 //);

//console.log(cars);
//console.table(cars);
//console.info('info');
//console.warn('warning');
//console.error('error');

//console.time("assignments");
//for (var i=0; i<1000000; i++)
  //var a = 1;
//console.timeEnd("assignments");
