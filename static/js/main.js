/*** Global constants  ***/
const mainpage = 'index';
const app = '/Cross/'
const rootpath = app + 'default/';
const startpath = rootpath + mainpage + '/';
const staticpath = app + 'static/';
const rootajax = app + 'ajax/';
const _DEBUG_ = true, _dbgstr1 = ' : value';
//const _DEBUG_ = false;
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
String.prototype.splitOnce = function(dt) {
  var pos = this.indexOf(dt);
  return (pos >=0 ) ? [this.substr(0, pos), this.substr(pos+dt.length)] : [this];
}
String.prototype.replace_set = function(set) {	// replace by regex rules in string
    var newStr = this;
    for(var i in set) newStr = newStr.replace(set[i][0], set[i][1]);
    return newStr;
};

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
/*** postForm - add formkey, ajax(POST) formData to server, flash status result; ***/
function postForm(form) {
    //console.log(form);
    var reply = {};
    if ($scope.formkey && $userId) {	// if form security information exist and user is authorized
	var formData = new FormData(form);
	formData.append('user', $userId);
	formData.append('formname', $scope.formname);
	formData.append('formkey', $scope.formkey);
	if ($scope.formData) for(var fd in $scope.formData) formData.append(fd, $scope.formData[fd]);

        //var xhr = new XMLHttpRequest();
        //xhr.open('POST', get_ajax_url('update'), false);    // false - ajax operation is synchronous, we must be sure db is updated
	////xhr.onload = function() { reply = JSON.parse(xhr.responseText);	}
	//xhr.onload = function(event) { if(event.target.status == 200) reply = JSON.parse(xhr.responseText); }
	////xhr.onerror = function() { console.log('error');	}
	//xhr.send(formData);

	reply = sLoad('update', {data:formData, type:'POST'});

    } else {
    	reply.details = 'Security error!';
	reply.status = false;
	reply.location = startpath;
    }
    if (reply) {
	web2pyflash(reply.details, reply.status ? 'success' : 'danger');
	if (reply.location) Router.navigate(reply.location, {add:true});
	else history.back();
    }
    return false;
}
//======================================
function get_ajax_url(ajaxurl, params) {
    params = params || $request;
    var url = '';
    var json = params.json === false ? '' : '.json';
    for(var i in params.args) url += '/' + params.args[i];
    if (!$.isEmptyObject(params.vars)) url += '?' + $.param(params.vars);
    return rootajax + ajaxurl + json + url;
}
//======================================
/*** Ajax sync Load  ***/
function sLoad(ajaxurl, params) {
    params = params || {};
    $.extend(params, $request);
    var out;
    $.ajax({
        url: get_ajax_url(ajaxurl, params),
        type: params.type || 'GET',
        async: false,
        data: params.data,
	processData: false,
        contentType: false,
	dataFilter: params.unescape ? undefined : function(data) { return data.escapeHTML(); },
        success: function(data, textStatus, jqXHR) {
	    out=data;
	    //console.info(out);
	    $userId=parseInt(jqXHR.getResponseHeader('User-Id'));  // userId = NaN or > 1
	    $Admin=Boolean(jqXHR.getResponseHeader('Admin'));
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
function aLoad(cache, callback, ajaxurl, params) {
    if (!cache[ajaxurl]) {
        cache[ajaxurl] = {};
        cache[ajaxurl].targets = [];
        $.ajax({
            url: get_ajax_url(ajaxurl, params),
	    beforeSend: function(){
		ajaxstate.during = true;
		ajaxstate.count++;
	    },
            success: function(data) {
		ajaxstate.count--;
                cache[ajaxurl].data = data.data;
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
//===========================================================
var $route, $request, $scope, $userId, $Admin, L, tbheaders, btnOkCancel, btnBack,
    ajaxstate = {during:false, callback:[], count:0, cache:[]},
    mastersearch = $("#master-search");
//************* START APPLICATION *********
$(function() {	// execute on document load
    L = sLoad('lexicon', {unescape:true});   // Global lexicon
    tbheaders = [L._CROSS_, L._VERTICAL_, L._PLINT_, L._PAIR_];
    Resig.init(targetDIV);
    Resig.add_pack(sLoad('templates', {unescape:true, json:false}));
    /*** Global inline templates ***/
    btnOkCancel = Resig._render("btnOkCancelTmpl");
    btnBack = L._BTNBACK_;
    /***  Add routes, templateId = name+Tmpl, controller = name+Ctrl  ***/
    $.each([
	[startpath, 'Cross', {index:true, shortcuts:true}],
	[startpath, 'Vertical'],
	[startpath, 'Chain'],
	[rootpath,  'Restore', {login_req:true}],
	[startpath, 'EditCross', {login_req:true}],
	[startpath, 'EditVertical', {login_req:true}],
	[startpath, 'EditPlint', {login_req:true}],
	[startpath, 'EditPair', {login_req:true}],
	[startpath, 'EditFound', {login_req:true}],
	[rootpath,  'User', {login_path:true}],
	[rootpath,  'Error']
	], function () { Router.add(this); });
    //console.info(Router);
    Router.navigate(get_url());	//************* START APPLICATION *********
    $('body').on('click', 'a[ajax]', {add:true}, ajax_nav);
    $('body').on('click', 'a[href*="default\/user"]', function(e){
	e.data = {url:$(this).attr('href'), add:true, no_vars:true};
	if (e.data.url.indexOf('logout')==-1) ajax_nav(e);  // all user function performed via ajax, bot not 'logout'
    });
    window.addEventListener("popstate", function(e) { e.data={url:get_url()}; ajax_nav(e) });
});

document.onkeydown = function(e) { if (e.keyCode == 27) { history.back(); return false; } } // escape key code
function ajax_nav(e) { e.preventDefault(); Router.navigate(e.data.url || $(this).attr('href'), e.data); }
function db_clear() { if (confirm("A you sure?")) location.href = rootpath + 'cleardb'; }
function get_url() { return location.pathname + location.search; }
// status: 401 - UNAUTHORIZED; 403 - FORBIDDEN; 404 - NOT FOUND
//function raise_error(s, txt) { location.href = (s==401) ? Router.login_request() : rootpath + 'error/%s/%s'.format(s, txt || ''); }
function raise_error(s, txt) { Router.navigate((s==401) ? Router.login_request() : rootpath + 'error/%s/%s'.format(s, txt || '')); }
function wrapToggle(checked) { $('table.vertical td').css({'white-space': checked ? 'pre-line' : 'nowrap'}); localStorage.wraptext = checked; }
function editChain(checked) { localStorage.editchain = checked; }
function CB_editChain() { return $userId ? `<label><input id="editchain" type="checkbox" onclick="editChain(this.checked)">${L._CHAIN_}</label>` : ''; }
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
