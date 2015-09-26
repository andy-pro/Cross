/*** Global constants  ***/
const rootpath = '/Cross/default/';
const staticpath = '/Cross/static/';
const rootpathajax = rootpath + 'ajax_get';
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
    var DEBUG = ' : value';
    var e = $('option', this) // get options set of select
    start = parseInt(start);
    if (e.length) {  // if options exist, simply change text
        $.each(e, function (i) {this.text = i + start + DEBUG+String(i+1)});
    } else {
        this.prop('disabled', false);   // if it was early cleared and disabled, append new options
        for (i= 1; i <= 10; i++) {
            this.append($('<option>').text(i+start-1 + DEBUG+String(i)).attr('value', i));
        }
    }
}
//======================================
function addFormKey(dest, src) {
    $.each(['formname', 'formkey'], function(){dest.push({name:this, value:src[this]})});
}
//======================================
/*** saveData - add formkey, ajax(POST) data toserver, flash status result; ***/
// arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
function saveData(data, formdata) {
    addFormKey(data, formdata); // destination, source
    data = sLoad('update', [], {}, data, 'POST');
    if (data.status) web2pyflash('Database update success!');
        else web2pyflash('Session expired!', 'danger');
    history.back();
    //location.reload();
}
//======================================
/*** Ajax sync Load  ***/
function sLoad(ajaxData, args, vars, senddata, type) {
    args = typeof args !== 'undefined' ? args : [];
    vars = typeof vars !== 'undefined' ? vars : [];
    type = typeof type !== 'undefined' ? type : 'GET';
    var out;
    var url = '';
    for (var i in args) url += '/' + args[i];
    if (!$.isEmptyObject(vars)) url += '?' + $.param(vars);
    //console.log(ajaxData+'.json'+url)

    $.ajax({
        url: rootpathajax + ajaxData + ".json" + url,
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
function aLoad(cache, callback, ajaxData, args) {
    args = typeof args !== 'undefined' ? args : [];
    var url = '';
    for (var i in args) url = url + '/' + args[i];
    if (!cache[ajaxData]) {
        cache[ajaxData] = {};
        cache[ajaxData].targets = [];
        $.ajax({
            url: rootpathajax + ajaxData + ".json" + url,
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
                cache[ajaxData].data = data.data;
                //$.each(cache[ajaxData].targets, function() { this() });
                while (cache[ajaxData].targets.length) cache[ajaxData].targets.pop()();	// local callback stack
                delete cache[ajaxData].targets;
		if (ajaxstate.count == 0) {
		    ajaxstate.during = false;
		    while (ajaxstate.callback.length) {
			ajaxstate.callback.pop()();	// global callback stack
		    }
		}
            }
	});
    }
    if (cache[ajaxData].data) callback();
    else cache[ajaxData].targets.push(callback);
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
            case 'danger': color = '#fbb'; break;
            case 'default': color = '#eee'; break;
            case 'success': color = '#bfb'; break;
            default: color = '#bfb';
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
route = function (path, targetId, templateId, ajaxData, controller) {
  routes[path] = {targetId: targetId, templateId: templateId, ajaxData: ajaxData, controller: controller};
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

document.onkeydown = function(e) {
    if (e.keyCode == 27) { // escape key code
        history.back();
        return false;}}

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
	    if (arguments[0] == 'pair' && localStorage.editchain == 'true') url += '/chain';
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
window.onload = function() {

/***  Set routes. args: (hashpath, targetDIV, templateId, ajaxpath, JScontroller)  ***/
    route('', 'crosshome', 'crossTmpl', 'indexdata', crossCtrl);
    route('vertical', 'crosshome', 'verticalTmpl', 'verticaldata', verticalCtrl);
    route('editvertical', 'crosshome', 'verticalEditTmpl', 'verticaldata', verticalEditCtrl);
    route('editpair', 'crosshome', 'chainEditTmpl', 'pairdata', chainCtrl);
    route('editfound', 'crosshome', 'foundEditTmpl', 'verticaldata', foundCtrl);

    window.addEventListener('hashchange', router);    // Listen on hash change
    //window.addEventListener('load', router);    // Listen on page load, ************* START APPLICATION *********
    router();
}

//sLoad('test1');
//sLoad('test1', []);
//sLoad('test1', [], {});
//sLoad('test1', ['arg1','arg2'], {});
//sLoad('test1', ['arg1','arg2'], {'var1':'abc', 'var2':'zxc'});
//sLoad('test1', [], {'var1':'abc', 'var2':'zxc'});

// multiline strinf example
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

 //console.time('c')
//var cars = [
    //{name: 'aveo', vendor:'chevrolet'},
    //{name: 'logan', vendor:'renault'},
    //{name: 'accent', vendor:'hyundai'},
    //{name:'forza', vendor:'zaz'}
//]
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
function crossCtrl(params, route) {
    $scope = sLoad(route.ajaxData);
    render(route, {crosses:$scope.crosses});
}

crossEdit = function(id) {
    console.log(id);
}
/* end cross controller */

//======================================
/*** Vertical Controller ***/
function verticalCtrl(params, route) {

    wrapToggle = function(checked) {
        $('table.vertical td').css({'white-space': (checked) ? 'pre-line' : 'nowrap'});
	localStorage.wraptext = checked;
    }

    editChain = function(checked) {
	localStorage.editchain = checked;
    }

    $scope = sLoad(route.ajaxData, params.args, params.vars);
    var href, header;
    if (params.args[0]) { href = `"vertical",${params.args[0]}`; header = $scope.header; }	// see Mozilla Developer Network
    else { href = `"found","search=${$scope.query}"`; header = `Edit results found for "${$scope.query}"`; }	// Multi-line template strings
    document.title = header;
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
/*** Vertical Edit Controller ***/
function verticalEditCtrl(params, route) {

    commondataHelp = function() {
        $.get(staticpath + "varhelp.html")
        .success(function(data) { web2pyflash(data, 'default', 0); });
    }

    verticalChange = function(El) {
	//var inputs = {verticaltitle : $("input[name=verticaltitle]").val(),
		      //plinttitle : $("input[name=plinttitle]").val(),
		      //count : $("input[name=count]").val(),
		      //start1 : $("input[name=start1]")[0].checked,
		      //comdata : $("input[name=comdata]").val(),
		      //comdatareplace : $("input[name=comdatareplace]")[0].checked
		      //}
	//log(El);
	var inputs = {}, plints = [];

	$("form.edit input, form.edit select").each(function(){
	    var El = $(this);	// if type="checkbox" get "checked", for other types get "value"
	    inputs[El.attr('name')] = (El.attr('type') == 'checkbox') ? Number(El[0].checked) : El.val();
	});

	//console.table(inputs);
	$('#changehead').html(inputs.verticaltitle);

	//var re = new RegExp("%(\d+)", "");
	var titles = chaindata[0].titles;   // shortcut
	var cd_rem = inputs.comdatareplace; // && inputs.cross_0 > 0);
	var re, res = /%(\d+)/.exec(inputs.plinttitle);
	if (res) re = Number(res[1]);

	var comdata = inputs.comdata;
	comdata = comdata.replace('%1', (titles.cross) ? titles.cross : '');
	comdata = comdata.replace('%2', (titles.vertical) ? titles.vertical : '');

        $("table#watchtable tr").remove(".refreshing");
	var cnt = inputs.count;
	if (isNaN(cnt) || cnt=='' || cnt>100 || cnt<0) $('div.numeric').addClass('has-error');
	else {
	    $('div.numeric').removeClass('has-error');


	    var si = titles.plintindex;

	    for (var i=0; i<cnt; i++) {
		var plint = {};
		var tr = $('<tr>', {class:"refreshing"});
		var ti = res ? inputs.plinttitle.replace(res[0], re+i) : inputs.plinttitle;
		var _class, st, idx = matchTitle($scope.plints, ti);
		var cd = comdata, start1 = inputs.start1;
		if (idx >= 0) {
		    _class="warning";
		    st = "~";
		    cd = cd.replace('%0', $scope.plints[idx].comdata);
		    start1 = (inputs.start1all) ? inputs.start1 : $scope.plints[idx].start1;
		    if (inputs.start1all) plint.start1 = inputs.start1;
		} else {
		    _class="new";
		    st = "+";
		    cd = cd.replace('%0', '');
		    plint.start1 = inputs.start1;
		}
		$('<td>', {class:_class}).html(`<sup>${start1}</sup>${ti}`).appendTo(tr);
		$('<td>').text(st).appendTo(tr);
		cd = cd.replace('%3', (titles.vertical && chaindata[0].plints[si+i]) ? chaindata[0].plints[si+i][1] : '');
		$('<td>').text(cd).appendTo(tr);
		tr.appendTo(watchtable);   // id of element, without declare variable!!!
		plint.title = ti;
		plint.comdata = cd;
		plints.push(plint);
		if (!res) break;    // if not %1, add only 1 plint
	    }
	}
    }

    matchTitle = function(arr, query) {
	for (var o in arr) if (arr[o].title && arr[o].title == query) return o;
	return -1;
    }

    verticalEditAccept = function(value) {
	log('accept')
    }

    if (!$scope || $scope.vertical != params.args[0]) $scope = sLoad(route.ajaxData, params.args, params.vars);
    render(route, {vertical:$scope});

//function Link(index, target, link, depth, cache) {
    var cache = {};     // use own data cache for ajax request
    var chaintableId = $("#chaintable");

    chaindata = [ new Link(0, chaintableId, emptyLink(), 3, cache, 'vertical') ];
    OnSelectChange = verticalChange;

    //$scope = sLoad(route.ajaxData, params.args, params.vars);
    //var href, header;
    //if (params.args[0]) { href = `"vertical",${params.args[0]}`; header = $scope.header; }	// see Mozilla Developer Network
    //else { href = `"found","search=${$scope.query}"`; header = `Edit results found for "${$scope.query}"`; }	// Multi-line template strings
    //document.title = header;
    //render(route, {_class:"default", plints:$scope.plints, users:$scope.users, href:href, header:header, query:$scope.query});

    //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
    //foundEdit();
    //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
}
/* end vertical edit controller */
