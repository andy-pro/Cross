/*** Global constants  ***/
const rootpath = '/Cross/default/';
const staticpath = '/Cross/static/';
const rootpathajax = rootpath + 'ajax_';
const targetDIV = 'crosshome';
const _DEBUG_ = true;
//const _DEBUG_ = false;
const _dbgstr1 = ' : value';
const _mypre = '<pre class="mypre">%s</pre>';
const _inputstext = "form.edit input[type!=checkbox][name]";
const _inputscheckbox = "form.edit input:checkbox";
const _inputfirst = "form.edit input:text:visible:first";

//======================================
/*** log Helper  ***/
function log(msg) {
    console.log(msg);}
//======================================
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
var $cp = 'panel-primary', $cd = 'panel-danger';
$.fn.deleteCheck = function (del) {
    var cp = del ? $cp : $cd, cd = del ? $cd : $cp;
    this.removeClass(cp); this.addClass(cd);
    return del;
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
    web2pyflash(data.details, (data.status) ? 'success' : 'danger');
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
// The route registering function:
route = function (path, templateId, controller) {
    routes[path] = {targetId: targetDIV, templateId: templateId, ajaxurl: path ? path : 'index', controller: controller};
}
router = function  () {  // version with regex, replace
    var params = {};
    params.vars = {};
    params.args = location.hash.split("/");    // [""] - for home, ["#", "part1", "part2", ...]
//var currentState = history.state;

    //console.log(history);
    //console.log(location);
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
            //el.innerHTML = tmpl(route.templateId, new route.controller(params));
            route.controller(params, route);
        }
    }
}
//window.addEventListener('popstate', function(e){
//window.addEventListener('hashchange', router);    // Listen on hash change
//window.addEventListener('load', router);    // Listen on page load, ************* START APPLICATION *********
})();
//======================================

//w2p_attrs = {'data-w2p_method':"GET", 'data-w2p_disable_with':"default"};

var $scope;     // for interaction between controllers
var chaindata;	// storage for <select> chains
var tablewatchId;   // table for variable watch and debug
var ajaxstate = {during:false, callback:[], count:0, cache:[]};

var T = {_CROSS_:'Cross',
     _VERTICAL_:'Vertical',
     _PLINT_:'Plint',
     _PAIR_:'Pair',
     _TITLE_:'Title',
     _FIND_:'Find',
     _REPLACE_:'Replace',
     _FOLLOW_:'Follow'
     };

const stages = ['cross','vertical','plint','pair'];
var tbheaders = [T._CROSS_, T._VERTICAL_, T._PLINT_, T._PAIR_];
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

/*** Global inline templates ***/
var btnOkCancel = tmpl("btnOkCancelTmpl", {});
var btnBack = tmpl("btnBackTmpl", {});

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

//crosshome = $("#crosshome");
//crosshome.empty();

//window.onload = function() {
$(function() {
/***  Set routes. args: (path, templateId, controller)  ***/
    route('', 'CrossTmpl', CrossCtrl);
    route('vertical', 'VerticalTmpl', VerticalCtrl);
    route('editvertical', 'editVerticalTmpl', EditVerticalCtrl);
    route('editplint', 'editPlintTmpl', EditPlintCtrl);
    route('editpair', 'editPairTmpl', EditPairCtrl);
    route('editfound', 'editFoundTmpl', EditFoundCtrl);
    window.addEventListener('hashchange', router);    // Listen on hash change
    //window.addEventListener('load', router);    // Listen on page load, ************* START APPLICATION *********
    router();
});

//sLoad('test1');
//sLoad('test1', []);
//sLoad('test1', [], {});
//sLoad('test1', ['arg1','arg2'], {});
//sLoad('test1', ['arg1','arg2'], {'var1':'abc', 'var2':'zxc'});
//sLoad('test1', [], {'var1':'abc', 'var2':'zxc'});

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
//console.timeEnd('c')


//console.time("assignments");
//for (var i=0; i<1000000; i++)
  //var a = 1;
//console.timeEnd("assignments");


//======================================
/*** Cross Controller ***/
function CrossCtrl(params, route) {
    $scope = sLoad(route.ajaxurl);
    document.title = 'Cross';
    render(route, {crosses:$scope.crosses});
}

crossEdit = function(id) {
    console.log(id);
}
/* end cross controller */

//======================================
/*** Vertical Controller ***/
function VerticalCtrl(params, route) {

    wrapToggle = function(checked) {
        $('table.vertical td').css({'white-space': (checked) ? 'pre-line' : 'nowrap'});
	localStorage.wraptext = checked;
    }

    editChain = function(checked) { localStorage.editchain = checked; }

    $scope = sLoad(route.ajaxurl, params.args, params.vars);
    var href, header = $scope.header;
    document.title = header;
    href = (params.args[0]) ? `"vertical",${params.args[0]}` : `"found","search=${$scope.query}"`;
    mastersearch.val($scope.query || '');
    render(route, {plints:$scope.plints, users:$scope.users, href:href, header:header, query:$scope.query});

    if (localStorage.wraptext == "true") {
	$("#wraptext").prop("checked", true);
	wrapToggle(true);
    }
    if (localStorage.editchain == "true") {
	$("#editchain").prop("checked", true);
    }


    //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
    //foundEdit();
    //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
}
/* end vertical controller */

//======================================
/*** Edit Vertical Controller ***/
function EditVerticalCtrl(params, route) {

    commondataHelp = function() {
        $.get(staticpath + "varhelp.html")
        .success(function(data) { web2pyflash(data, 'default', 0); });
    }

    verticalChange = function() {
	//log(chaindata)
	$("table#watchtable tr").remove(".refreshing");
	vertical = [];
	inputs = {};
	inputstext.each(function() { inputs[this.name] = this.value; });
	inputscheckbox.each(function() { inputs[this.name] = Number(this.checked); });

	if (panel.deleteCheck(inputs.delete)) return;
	$('#changehead').text(inputs.title);

	var titles = chaindata.titles;   // shortcut
	var cd_rem = inputs.comdatareplace; // && inputs.cross_0 > 0);
	var re, res = /%(\d+)/.exec(inputs.plinttitle);
	if (res) re = Number(res[1]);

	var comdata = rcomdata = inputs.comdata;
	//comdata = comdata.replace('%1', (titles.cross) ? titles.cross : '');
	//comdata = comdata.replace('%2', (titles.vertical) ? titles.vertical : '');
	comdata = comdata.replace('%1', titles.cross||'');
	comdata = comdata.replace('%2', titles.vertical||'');
	rcomdata = rcomdata.replace('%1', $scope.cross);
	rcomdata = rcomdata.replace('%2', $scope.title);
	var cnt = inputs.count;
	if (isNaN(cnt) || cnt=='' || cnt>100 || cnt<0) $('div.numeric').addClass('has-error');
	else {
	    $('div.numeric').removeClass('has-error');

	    var si = titles.plintindex;

	    for (var i=0; i<cnt; i++) {
		var tr = $('<tr>', {class:"refreshing"});
		//var ti = res ? inputs.plinttitle.replace(res[0], re+i) : inputs.plinttitle;
		var ti;
		if (res) {
		    ti = String(re+i)
		    while (ti.length < res[1].length) ti = '0' + ti // for titles like '01', '001', ...
		    ti = inputs.plinttitle.replace(res[0], ti);
		} else ti = inputs.plinttitle;
		var _class, st, idx = matchTitle($scope.plints, ti);
		var cd = comdata, rcd, start1;
		if (idx >= 0) {
		    _class="warning";
		    st = "~";
		    rcd = 'Existing plint';
		    cd = cd.replace('%0', $scope.plints[idx].comdata);
		    start1 = (inputs.start1all) ? inputs.start1 : $scope.plints[idx].start1;
		} else {
		    _class="new";
		    st = "+";
		    rcd = 'New plint';
		    cd = cd.replace('%0', '');
		    start1 = inputs.start1;
		}
		if (idx < 0 || inputs.start1all) vertical.push({name:'start1_'+i, value:start1});
		$('<td>', {class:_class, title:rcd}).html(`<sup>${start1}</sup>${ti}`).appendTo(tr);
		$('<td>').text(st).appendTo(tr);
		rcd = rcomdata;
		if (titles.vertical && chaindata.plints[si+i]) {
		    st = chaindata.plints[si+i][1];
		    if (inputs.comdatareplace) {
			rcd = rcd.replace('%0', chaindata.plints[si+i][3]);
			rcd = rcd.replace('%3', ti);
			vertical.push({name:'rcomdata_'+i, value:$.trim(rcd)});
		    } else rcd = '';
		} else {
		    st = '';
		    rcd = '';
		}
		cd = cd.replace('%3', st);
		$('<td>').html(_mypre.format(cd)).appendTo(tr);
		$('<td>').html(_mypre.format(rcd)).appendTo(tr);
		tr.appendTo(watchtable);   // id of element, without declare variable!!!
		vertical.push({name:'title_'+i, value:ti});
		vertical.push({name:'comdata_'+i, value:$.trim(cd)});
		if (!res) break;    // if not %1, add only 1 plint
	    }
	}
    }

    matchTitle = function(arr, query) {
	for (var o in arr) if (arr[o].title && arr[o].title == query) return o;
	return -1;
    }

    $scope = sLoad(route.ajaxurl, params.args, params.vars);
    document.title = $scope.header;
    render(route, {vertical:$scope});
    $(_inputfirst).focus();

    var chaintableId = $("#chaintable");
    var cache = {};     // use own data cache for ajax request
    var vertical = [];
    var inputs = {};

    chaindata = new Link(0, chaintableId, emptyLink(), 3, cache, 'plintscd');   // Link(index, target, link, depth, cache, url)
    OnSelectChange = verticalChange;

    var panel = $('div.panel');
    var inputstext = $(_inputstext).on('input', verticalChange);
    var inputscheckbox = $(_inputscheckbox).on('change', verticalChange);
    verticalChange();

    //verticalEditAccept = function(value) {
    $('form.edit').submit(function(event) {
	vertical.push({name:'title', value:inputs.title});
	vertical.push({name:'count', value:inputs.count});
	vertical.push({name:'vertical', value:params.args[0]});
	vertical.push({name:'update_mode', value:'vertical'});
	if (inputs.comdatareplace) {
	    vertical.push({name:'from_vert', value:chaindata.link.verticalId});
	    vertical.push({name:'from_plint', value:chaindata.link.plintId});
	}
	if (inputs.delete) vertical.push({name:'delete', value:1});
	//console.log($scope);
	saveData(vertical, $scope, event);
    });
}
/* end edit vertical controller */

//======================================
/*** Edit Plint Controller ***/
function EditPlintCtrl(params, route) {

    plintChange = function() {
	inputs = {};
	inputstext.each(function() { inputs[this.name] = this.value; });
	inputscheckbox.each(function() { inputs[this.name] = Number(this.checked); });
	if (panel.deleteCheck(inputs.delete)) return;
	$('ol').attr('start', parseInt(inputs.start1));
    }

    $scope = sLoad(route.ajaxurl, params.args, params.vars);
    document.title = $scope.address;
    $scope.start1 = ($scope.start1) ? "checked" : "";
    render(route, {plint:$scope});
    $(_inputfirst).focus();

    var panel = $('div.panel');
    var inputstext = $(_inputstext).on('input', plintChange);
    var inputscheckbox = $(_inputscheckbox).on('change', plintChange);
    plintChange();

    $('form.edit').submit(function(event) {
	var plint = $(this).serializeArray();
	plint.push({name:'update_mode', value:'plint'});
	plint.push({name:'plint', value:params.args[0]});
	saveData(plint, $scope, event);
    });
}
/* end edit plint controller */

//======================================
/*** Edit Empty Controller ***/
function EditEmptyCtrl(params, route) {

    $scope = sLoad(route.ajaxurl, params.args, params.vars);
    document.title = $scope.header;
    render(route, {vertical:$scope});
    $(_inputfirst).focus();

    $('form.edit').submit(function(event) {

	//saveData(plints, $scope, event);
    });
}
/* end edit empty controller */

//======================================
/*** Ajax Live Search Controller ***/
(function(){

    var keypress = false;
    var searchvalue = oldvalue = '';
    var div = $("#ajaxlivesearch");
    var reqs = [];

    var hidelive = function() {
        div.hide();
	div.empty();
        while (reqs.length) reqs.pop().abort();	// abort all ajax requests
    }

    //div.on('click', 'a', function(){
	//mastersearch.val(this.text);
	//oldvalue = searchvalue=this.text;
	//hidelive();
	//mastersearch.focus();});

    var getPairTitles = function(event){    // input id="master-search" oninput event
        if (keypress) return;
        searchvalue = mastersearch.val();
        if(searchvalue.length > 2){
	//log(searchvalue)
            if (searchvalue != oldvalue) {
		oldvalue = searchvalue;
                $.ajax(rootpathajax + "livesearch.json", {
                    data: {search: searchvalue},
                    beforeSend: function(jqXHR){
                        while (reqs.length) reqs.pop().abort();
                        reqs.push(jqXHR);
                    },
                    success: function(data){
                        //oldvalue = searchvalue;
                        if (data.search.length) {
                            div.html(tmpl("liveSearchTmpl", data));

                            $("#ajaxlivesearch a").hover(
                                function() { searchvalue = this.text; },    // handlerIn on mouseenter
                                function() { searchvalue = mastersearch.val(); });   // handlerOut on mouseleave

			    div.show();

			    //$("#ajaxlivesearch a").click(function(){
				////mastersearch.val(this.text);
				////oldvalue = searchvalue=this.text;
				////hidelive();
				//mastersearch.focus();
			    //});

                        } else hidelive();
                    }
                });
            }
        } else {
            oldvalue = searchvalue;
            hidelive();
        }
    }

    mastersearch.on('keydown', function() { keypress = true; });
    mastersearch.on('keyup', function(event) { keypress = false; getPairTitles(event); });
    mastersearch.on('input', getPairTitles);

    //mastersearch.focusout(function(event){
    //div.focusout(function(event){
    mastersearch.blur(function(event){
	//log($("#ajaxlivesearch a").queue())
	//log(event);
	//var da = $("#ajaxlivesearch a");
	//log(da.queue())
	oldvalue = searchvalue;
	hidelive();
        if (mastersearch.val() != searchvalue) {
	    mastersearch.val(searchvalue);
	    setTimeout(function(){mastersearch.focus()}, 10);
	    //mastersearch.focus();
	    //$(document).queue(function(){mastersearch.focus();});
	    //$(document).dequeue();
	    //event.preventDefault;
	    //event.stopImmediatePropagation();
	    //return false;
	}
        //setTimeout(function(){hidelive()},500);
    });

    //" action="javascript:masterSearchAccept()">
    $('form.livesearch').submit(function() {
        var value = mastersearch.val();
	//event.prevenrDefault();
        if (value.length > 2) {
            hidelive();
            //log(decodeURIComponent(value))
            //log(encodeURIComponent(value))
            //log(encodeURI(value))
            //location.hash = '#/vertical?search=' + escape(value);
            //location.hash = '#/vertical?search=' + encodeURIComponent(value);
            //location.hash = '#/vertical?search=' + encodeURI(value);
            //location.hash = '#/vertical?' + $("form.search").serialize(); // escape?
            location.hash = '#/vertical?search=' + value;
        } else web2pyflash(value + ' : is too short query!', 'danger');
        return false;
    });

})();
/* end ajax live search controller */
