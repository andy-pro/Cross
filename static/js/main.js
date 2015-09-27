/*** Global constants  ***/
const rootpath = '/Cross/default/';
const staticpath = '/Cross/static/';
const rootpathajax = rootpath + 'ajax_';
//const _DEBUG_ = true;
const _DEBUG_ = false;
const _dbgstr1 = ' : value';
const _mypre = '<pre class="mypre">%s</pre>';
const $clrp = 'panel-primary', $clrs = 'panel-success', $clri = 'panel-info', $clrw = 'panel-warning', $clrd = 'panel-danger';
const stages = ['cross','vertical','plint','pair'];

//======================================
/*** log Helper  ***/
function log(msg) { console.log(msg); }
//======================================
/*** String escape Helper  ***/
String.prototype.escapeHTML = function() { return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
String.prototype.unescapeHTML = function() { return this.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'); }
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
        for(var i= 1; i <= 10; i++) {
            if (_DEBUG_) this.append($('<option>').text(i+start-1 + _dbgstr1+String(i)).attr('value', i));
		else this.append($('<option>').text(i+start-1).attr('value', i));
        }
    }
}
//======================================
function login_request(next) { return `user/login?_next=${rootpath}index${escape(next || '')}` }
// status: 401 - UNAUTHORIZED; 403 - FORBIDDEN; 404 - NOT FOUND
function raise_html(s) { window.location.href = (s==401) ? login_request() : 'error/'+s; }
//======================================
function addFormKey(dest, src) {
    dest.push({name:'user', value:userId});
    $.each(['formname', 'formkey'], function(){dest.push({name:String(this), value:src[this]})});
}
//======================================
/*** saveData - add formkey, ajax(POST) data toserver, flash status result; ***/
// arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
function saveData(data, formdata, event) {
    event.preventDefault();
    event.stopPropagation();
    if (formdata.formkey && userId) {
	addFormKey(data, formdata); // destination, source
	//console.log(data)
	data = sLoad('update', {data:data, type:'POST'});
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
function sLoad(ajaxurl, opts) {
    //args = typeof args !== 'undefined' ? args : [];
    //vars = typeof vars !== 'undefined' ? vars : [];
    //type = typeof type !== 'undefined' ? type : 'GET';

    opts = opts || {};
    opts.params = opts.params || {args:[], vars:{}};
    //opts.type = opts.type || 'GET';
    //opts.escape = opts.escape || false;
    //console.info(opts);
    var out, url = '';
    for(var i in opts.params.args) url += '/' + opts.params.args[i];
    if (!$.isEmptyObject(opts.params.vars)) url += '?' + $.param(opts.params.vars);

    $.ajax({
        url: rootpathajax + ajaxurl + ".json" + url,
        type: opts.type || 'GET',
        async: false,
        data: opts.data,
	dataFilter: opts.unescape ? undefined : function(data) { return data.escapeHTML(); },
        success: function(data, textStatus, jqXHR) { out=data; userId=parseInt(jqXHR.getResponseHeader('User-Id')); }, // userId = NaN or > 1
        error: function(jqXHR) { raise_html(jqXHR.status); }
    });
    return out;
}
//======================================
/*** Ajax async Load  ***/
function aLoad(cache, callback, ajaxurl, args) {
    args = typeof args !== 'undefined' ? args : [];
    var url = '';
    for(var i in args) url = url + '/' + args[i];
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
        delay = typeof delay !== 'undefined' ? delay : 5000;
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
    web2pynoflash = function() { flash.slideUp().html(''); }
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
function render(route, title, context) {
    document.title = title.unescapeHTML();
    if (route.targetEl) route.targetEl.innerHTML = tmpl(route.templateId, context);
}

//======================================
/*** Router ***/
(function(){
    var routes = {};    // A hash to store our routes:
    const targetDIV = 'crosshome';	// content div, default

    route = function (args) {	// The route registering function:
	var path = args[0].toLowerCase(),
	    name = args[1] || args[0];
	routes[path] = {ajaxurl: path || 'index', templateId: name+'Tmpl', controller: window[name+'Ctrl'], targetId: args[2] || targetDIV};
    }

    router = function  () {  // version with regex, replace
	var params = {}, route;
	params.vars = {};
	params.args = location.hash.split('?');
	if (params.args.length > 1) { $.each(params.args[1].split('&'), function(){ route=this.split('='); params.vars[route[0]]=route[1]}); } // variables exist
	params.args = params.args[0].split('/');    // [''] - for home, ['#', 'part1', 'part2', ...]
	if (params.args.length < 2) params.args.push('');
	//console.info(params);
	route = params.args[1];
	// redirect to web2py auth dialog if UNAUTHORIZED
	if (route.indexOf('edit')>=0 && !userId) location.href = login_request(currentURL);
	else {
		// spike, for "Edit chain" in Vertical view, add new arg "/chain" if checked checkbox
		if (route == 'editpair' && localStorage.editchain == 'true') {
		    params.args.push('chain');
		    //location.replace(location.href+'/chain');
		}
		// end spike
		route = routes[route];   // Get route by url
		if (route && route.controller) {
		    route.targetEl = document.getElementById(route.targetId); // Lazy load view element
		    if (route.targetEl) {
			params.args = params.args.slice(2);
			route.controller(params, route);
		    }
		}
	    }
	currentURL = location.hash; // this is allow return to current page after login
	//log(currentURL)
    }
})();
//======================================

$(function() {	// execute on document load

    L = sLoad('lexicon', {unescape:true});   // Global lexicon
    tbheaders = [L._CROSS_, L._VERTICAL_, L._PLINT_, L._PAIR_];
    /*** Global inline templates ***/
    btnOkCancel = tmpl("btnOkCancelTmpl", {});
    btnBack = tmpl("btnBackTmpl", {});

/***  Set routes. args: ( [ path(toLowerCase), [name=path, by default] ] )  ***/
/***  templateId = name+Tmpl, controller = name+Ctrl  ***/
    var rs = [ ['', 'Cross'], ['Vertical'], ['Chain'], ['EditCross'], ['EditVertical'], ['EditPlint'], ['EditPair'], ['EditFound'] ];
    $.each(rs, function () { route(this); });
    window.addEventListener('hashchange', router);    // Listen on hash change
    router();	//************* START APPLICATION *********
});

var $scope, userId, currentURL, L, tbheaders, btnOkCancel, btnBack;
var ajaxstate = {during:false, callback:[], count:0, cache:[]};
var mastersearch = $("#master-search");

document.onkeydown = function(e) {
    if (e.keyCode == 27) { // escape key code
        history.back();
        return false;
    }
}

//A_Cross = function(o) { return `<a href='#/editcross/${o.crossId}' title='${L._EDIT_CROSS_} ${o.cross}'>${o.cross.escapeHTML()}</a>` }
A_Cross = function(o) { return `<a href='#/editcross/${o.crossId}' title='${L._EDIT_CROSS_} ${o.cross}'>${o.cross}</a>` }

A_Vertical = function(o, _class) {
    _class = _class ? `class="${_class}"` : '';
    //return `<a ${_class} href='#/vertical/${o.verticalId}' title='${L._VIEW_VERT_} ${o.vertical}'>${(o.header || o.vertical).escapeHTML()}</a>`; }
    return `<a ${_class} href='#/vertical/${o.verticalId}' title='${L._VIEW_VERT_} ${o.vertical}'>${o.header || o.vertical}</a>`; }

A_Plint = function(o) {
    var start1 = o.pairId+o.start1-1;
    //return `<sup>${o.start1}</sup><a href="#/editplint/${o.plintId}" title="${L._EDIT_PLINT_} ${o.plint}">${o.plint.escapeHTML()}</a>`; }
    return `<sup>${o.start1}</sup><a href="#/editplint/${o.plintId}" title="${L._EDIT_PLINT_} ${o.plint}">${o.plint}</a>`; }

A_Pair = function(o) {
    var start1 = o.pairId+o.start1-1;
    return `<a href="#/editpair/${o.plintId}/${o.pairId}" title="${L._EDIT_PAIR_} ${start1}">${L._PAIR_} ${start1}</a>`; }

function pairRow(pair, depth, colv) {
    depth = typeof depth !== 'undefined' ? depth : 4;
    var cell, row = '', tds = [A_Cross, A_Vertical, A_Plint, A_Pair];
    for(var i=0; i<depth; i++) {
	cell = colv ? `<td class="colv${i}">` : '<td>';
	row += cell+tds[i](pair)+'</td>';
    }
    return row;
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
//for(var i=0; i<1000000; i++)
  //var a = 1;
//console.timeEnd("assignments");
