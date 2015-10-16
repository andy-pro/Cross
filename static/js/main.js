/*** Global constants  ***/
const mainpage = 'index';
const app = '/Cross/'
const rootpath = app + 'default/';
const startpath = rootpath + mainpage + '/';
const staticpath = app + 'static/';
const rootajax = app + 'ajax/';
//const _DEBUG_ = true, _dbgstr1 = ' : value';
const _DEBUG_ = false;
const _mypre = '<pre class="mypre">%s</pre>';
const $clrp = 'panel-primary', $clrs = 'panel-success', $clri = 'panel-info', $clrw = 'panel-warning', $clrd = 'panel-danger';
const stages = ['cross','vertical','plint','pair'];
const targetDIV = 'crosshome';	// content div, default

//======================================
/*** log Helper  ***/
function log(msg) { console.log(msg); }
//======================================
/*** String Helpers  ***/
String.prototype.escapeHTML = function() { return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\"/g,'&quot;'); }
String.prototype.unescapeHTML = function() { return this.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"'); }
String.prototype.clearSlashes = function() { return this.replace(/\/$/, '').replace(/^\//, ''); }
String.prototype.format = function() {
    var newStr = this, i = 0;
    while (/%s/.test(newStr)) newStr = newStr.replace("%s", arguments[i++]);
    return newStr;
}
// or use javascript embedded expression format: `string1${arg1}string2${arg2}string3`
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
	data = sLoad('update', {data:data, type:'POST'});
    } else {
	data.details = 'Security error!';
	data.status = false;
	data.location = startpath;
    }
    if (data) {
	web2pyflash(data.details, data.status ? 'success' : 'danger');
	if (data.location) Router.navigate(data.location, true);
	else history.back();
    }
}
//======================================
/*** Ajax sync Load  ***/
function sLoad(ajaxurl, opts) {
    opts = opts || {};
    opts.params = opts.params || {args:[], vars:{}};
    //console.info(opts);
    var out, url = '';
    for(var i in opts.params.args) url += '/' + opts.params.args[i];
    if (!$.isEmptyObject(opts.params.vars)) url += '?' + $.param(opts.params.vars);

    $.ajax({
        url: rootajax + ajaxurl + ".json" + url,
        type: opts.type || 'GET',
        async: false,
        data: opts.data,
	dataFilter: opts.unescape ? undefined : function(data) { return data.escapeHTML(); },
        success: function(data, textStatus, jqXHR) {
	    out=data;
	    //console.info(out);
	    userId=parseInt(jqXHR.getResponseHeader('User-Id'));  // userId = NaN or > 1
	    Admin=Boolean(jqXHR.getResponseHeader('Admin'));
	},
        error: function(jqXHR, txt, obj) {
	    console.warn(jqXHR); console.warn(txt); console.warn(obj);
	    raise_error(jqXHR.status, txt);
	}
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
            url: rootajax + ajaxurl + ".json" + url,
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
    targetEl.innerHTML = tmpl(route.templateId, context);
}
//======================================
//************* START APPLICATION *********
$(function() {	// execute on document load

    L = sLoad('lexicon', {unescape:true});   // Global lexicon
    tbheaders = [L._CROSS_, L._VERTICAL_, L._PLINT_, L._PAIR_];
    /*** Global inline templates ***/
    btnOkCancel = tmpl("btnOkCancelTmpl", {});
    //btnBack = tmpl("btnBackTmpl", {});
    btnBack = L._BTNBACK_;
    /***  Set routes. args: ( [ path(toLowerCase), [name=path, by default] ] )  ***/
    /***  templateId = name+Tmpl, controller = name+Ctrl  ***/
    //$.each([['','Cross'],['Vertical'],['Chain'],['EditCross'],['EditVertical'],['EditPlint'],['EditPair'],['EditFound']], function () { Router.add(this); });
    $.each([
	[startpath, 'Cross', {index:true, shortcuts:true}],
	[startpath, 'Vertical'],
	[startpath, 'Chain'],
	[startpath, 'EditCross', {login_req:true}],
	[startpath, 'EditVertical', {login_req:true}],
	[startpath, 'EditPlint', {login_req:true}],
	[startpath, 'EditPair', {login_req:true}],
	[startpath, 'EditFound', {login_req:true}],
	[rootpath, 'User', {login_path:true}]
	], function () { Router.add(this); });
    //console.info(Router);
    Router.navigate(get_url());	//************* START APPLICATION *********
    $('body').on('click', 'a[ajax]', {add:true}, ajax_nav);
    $('body').on('click', 'a[href*="default\/user"]', {}, ajax_nav);
    window.addEventListener("popstate", function(e) { e.data={url:get_url()}; ajax_nav(e) });
});

var $scope, userId, Admin, L, tbheaders, btnOkCancel, btnBack,
    targetEl = document.getElementById(targetDIV),
    ajaxstate = {during:false, callback:[], count:0, cache:[]},
    mastersearch = $("#master-search");

document.onkeydown = function(e) { if (e.keyCode == 27) { history.back(); return false; } } // escape key code
function ajax_nav(e) {
    //console.warn(e);
    e.preventDefault();
    Router.navigate(e.data.url || $(this).attr('href'), e.data.add);
}
function db_clear() { if (confirm("A you sure?")) location.href = rootpath + 'cleardb'; }
function get_url() { return decodeURI(location.pathname + location.search); }
function login_request(next) { return rootpath + 'user/login?_next=' + (next || startpath); }
// status: 401 - UNAUTHORIZED; 403 - FORBIDDEN; 404 - NOT FOUND
function raise_error(s, txt) { location.href = (s==401) ? login_request() : rootpath + 'error/%s/%s'.format(s, txt || ''); }
function wrapToggle(checked) { $('table.vertical td').css({'white-space': checked ? 'pre-line' : 'nowrap'}); localStorage.wraptext = checked; }
function editChain(checked) { localStorage.editchain = checked; }
function CB_editChain() { return userId ? `<label><input id="editchain" type="checkbox" onclick="editChain(this.checked)">${L._CHAIN_}</label>` : ''; }
function set_wraptext() { if (localStorage.wraptext == "true") { $("#wraptext").prop("checked", true); wrapToggle(true); } }
function set_editchain() { if (localStorage.editchain == "true") $("#editchain").prop("checked", true); }

function A_Cross(o) { return `<a href="${startpath}editcross/${o.crossId}" title="${L._EDIT_CROSS_} ${o.cross}" ajax="1">${o.cross}</a>` }

function A_Vertical(o, _class) {
    _class = _class ? `class="${_class}"` : '';
    return `<a ${_class} href="${startpath}vertical/${o.verticalId}" title="${L._VIEW_VERT_} ${o.vertical}" ajax="1">${o.header || o.vertical}</a>`; }

function A_Plint(o) {
    var start1 = o.pairId+o.start1-1;
    return `<sup>${o.start1}</sup><a href="${startpath}editplint/${o.plintId}" title="${L._EDIT_PLINT_} ${o.plint}" ajax="1">${o.plint}</a>`; }

function A_Pair(o) {
    var start1 = o.pairId+o.start1-1;
    return `<a href="${startpath}editpair/${o.plintId}/${o.pairId}" title="${L._EDIT_PAIR_} ${start1}" ajax="1">${L._PAIR_} ${start1}</a>`; }

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
