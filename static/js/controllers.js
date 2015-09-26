/*** Global vars  ***/
rootpath = '/Cross/default/';
rootpathajax = rootpath + 'ajax_get';
//======================================
/*** log Helper  ***/
function log(msg) {
    console.log(msg);}
//======================================
/*** web2py flash message Helper  ***/
(function(){
    var flash = $("div.flash");
    web2pyflash = function(msg, status) {
        status = typeof status !== 'undefined' ? status : 'success';
        flash.html(msg+'<button type="button" class="close">&times;</button>');
        var color;
        switch (status) {
            case 'danger': color = '#ffb0b0'; break;
            case 'default': color = '#e8e8e8'; break;
            case 'success': color = '#b0ffb0'; break;
            default: color = '#b0ffb0';
        }
        flash.css({'background-color':color});
        flash.slideDown().delay(3000).slideUp();
    }
    web2pynoflash = function() { flash.slideUp(); }
})();
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
                //var path='EditPair/555/333'
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
            success: function( data ) {
                cache[ajaxData].data = data.data;
                $.each(cache[ajaxData].targets, function() { this() });
                delete cache[ajaxData].targets;
            } });
        }
    if (cache[ajaxData].data) callback();
        else cache[ajaxData].targets.push(callback);
}

//======================================
/*** Ajax live search Controller ***/
(function(){
    //var oldvalue = '';
    //var searchvalue = '';
    //var div = $("#ajaxlivesearch");
    //var input = $("#master-search");
    //getPairTitles = function(value){    // input id="master-search" oninput event
      //searchvalue = value;
      //if(value.length > 2){
        //if(value != oldvalue) {
          //$.post(rootpathajax + "LiveSearch.json", {likestr: value}, function(data){
            //if (data.search.length) {
              //div.html(tmpl("liveSearchTmpl", data));
              //$("#ajaxlivesearch a").hover(
                //function() { searchvalue = this.text; },    // handlerIn on mouseenter
                //function() { searchvalue = input.val(); });   // handlerOut on mouseleave
              //div.show();
            //} else div.hide();
          //});
          //oldvalue = value; }
      //} else { div.hide(); oldvalue = value; }
    //}

    //input.focusout(function(){
        //input.val(searchvalue);
        //oldvalue = searchvalue;
        //div.hide();
    //});


    var searchvalue = '';
    var div = $("#ajaxlivesearch");
    var input = $("#master-search");

    getPairTitles = function(value){    // input id="master-search" oninput event
      searchvalue = value;
      if(value.length > 2){

            /***  async search  ***/
          //$.post(rootpathajax + "LiveSearch.json", {likestr: value}, function(data){
            //if (data.search.length) {
              //div.html(tmpl("liveSearchTmpl", data));
              //$("#ajaxlivesearch a").hover(
                //function() { searchvalue = this.text; },    // handlerIn on mouseenter
                //function() { searchvalue = input.val(); });   // handlerOut on mouseleave
              //div.show();
            //} else div.hide();
          //});

          /***  sync search  ***/
          var data = sLoad('LiveSearch', [], {}, {likestr: value}, 'POST');
          if (data.search.length) {
              div.html(tmpl("liveSearchTmpl", data));
              $("#ajaxlivesearch a").hover(
                  function() { searchvalue = this.text; },    // handlerIn on mouseenter
                  function() { searchvalue = input.val(); });   // handlerOut on mouseleave
               div.show();
          } else div.hide();




      } else { div.hide(); }
    }

    input.focusout(function(){
        input.val(searchvalue);
        div.hide();
    });

    //input.submit(function(){
        //div.hide();
    //});

    masterSearchAccept = function() {
        var value = input.val();
        if (value.length > 2) {
        //log(value)
        //log(decodeURIComponent(value))
        //log(encodeURIComponent(value))
        //log(encodeURI(value))
            //location.hash = '#/vertical?' + $("form.search").serialize(); // escape?
            //location.hash = '#/vertical?search=' + escape(value);
            //location.hash = '#/vertical?search=' + encodeURIComponent(value);
            //location.hash = '#/vertical?search=' + encodeURI(value);
            //location.hash = '#/vertical?' + $("form.search").serialize(); // escape?
            location.hash = '#/vertical?search=' + value;
            //log(location.hash)
            //log('nogo')
        }
        else web2pyflash(value + ' : is too short query!', 'danger');
    }
})();

//======================================
/*** Router ***/
(function(){
var routes = {};    // A hash to store our routes:
// The route registering function:
route = function (path, targetId, templateId, ajaxData, controller) {
  routes[path] = {targetId: targetId, templateId: templateId, ajaxData: ajaxData, controller: controller};
}
function router () {  // version with regex, replace
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
  //console.log(e);
//});
window.addEventListener('hashchange', router);    // Listen on hash change
window.addEventListener('load', router);    // Listen on page load, ************* START APPLICATION *********
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

//w2p_attrs = {'data-w2p_method':"GET", 'data-w2p_disable_with':"default"};
//users = {};
T = {_CROSS_:'Cross',
     _VERTICAL_:'Vertical',
     _PLINT_:'Plint',
     _PAIR_:'Pair',
     _TITLE_:'Title',
     _FIND_:'Find',
     _REPLACE_:'Replace'
     };

stages = ['cross','vertical','plint','pair'];
tbheaders = [T._CROSS_, T._VERTICAL_, T._PLINT_, T._PAIR_];

document.onkeydown = function(e) {
    if (e.keyCode == 27) { // escape key code
        history.back();
        return false;}}

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

/***  Set routes. args: (hashpath, targetDIV, templateId, ajaxpath, JScontroller)  ***/
route('', 'crosshome', 'crossTmpl', 'indexdata', crossCtrl);
route('vertical', 'crosshome', 'verticalTmpl', 'verticaldata', verticalCtrl);
route('pairEdit', 'crosshome', 'chainTmpl', 'pairdata', chainCtrl);


//sLoad('test1');
//sLoad('test1', []);
//sLoad('test1', [], {});
//sLoad('test1', ['arg1','arg2'], {});
//sLoad('test1', ['arg1','arg2'], {'var1':'abc', 'var2':'zxc'});
//sLoad('test1', [], {'var1':'abc', 'var2':'zxc'});

//======================================
/*** Cross Controller ***/
function crossCtrl(params, route) {
    var data = sLoad(route.ajaxData);
    render(route, {_class:"default", size:4, crosses:data});
}

crossEdit = function(id) {
    console.log(id);
}
/* end cross controller */

//======================================
/*** Vertical Controller ***/
function verticalCtrl(params, route) {
/*** controller functions ***/
{
    foundEdit = function() {
        context = {query:data.query};
        route.targetEl.innerHTML = tmpl("foundEditTmpl", context);
        //route.targetId.html('qukuqns-172');
    }

}
/*** end controller functions ***/

    //console.log(params)
    //var args = params.args;


    var data = sLoad(route.ajaxData, params.args, params.vars);
    var href;
    if (params.args[0]) href = '#/verticalEdit/' + params.args[0];
        else href = 'javascript:foundEdit()';
    render(route, {_class:"default", plints:data.plints, users:data.users, href:href, header:data.header, query:data.query});
}
/* end vertical controller */

//======================================
/*** Chain Controller ***/
function chainCtrl(params, route) {

/*** controller functions ***/
{

    refreshWatch = function() {
     //function refreshWatch() {
        $("table tr").remove(".refreshing");
        $.each(chaindata, function(i, link) {
            var tr = $('<tr>', {class:"refreshing"});
            $('<td>', {class:"warning"}).text(i).appendTo(tr);
            $.each(stages, function() { $('<td>').text(link[this+'Id']).appendTo(tr); });
            tr.appendTo(chaintablewatchId);   // id of element, without declare variable!!!
        });
    }

    addLink = function () {
        var index = chaindata.length;
        var link = {};
        var controls = {};
        var tr = $('<tr>');
        drawSelectors(tr, controls, index);
        $.each(stages, function() { link[this+'Id'] = 0; });
        //controls.crossEl.addCrossOptions();
        chainCross(controls, link);
        chaindata.push(link);
        chaincontrols.push(controls);
        tr.appendTo(chaintableId);

//~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
        refreshWatch();
//~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~

    }

    pairEditAccept = function () {
        var data = $('form.chain').serializeArray();
        data.push({name:'plint_this', value:plintid});
        data.push({name:'pair_this',  value:pairid});
        //var foo = ['formname', 'formkey']; for (bar in foo) data.push({name:foo[bar],  value:plintdata[foo[bar]]});
        $.each(['formname', 'formkey'], function(){data.push({name:this, value:plintdata[this]})});
        //console.log(data);

        data = sLoad('EditPair', [], {}, data, 'POST');

        if (data.status) web2pyflash('Database update success!');
            else web2pyflash('Session expired!', 'danger');
        history.back();
        //return false;
    }

    function chainCross(controls, link) {
        var El = controls.crossEl;  // cross selector
        if (!cache['crosses']) cache['crosses'] = sLoad('indexdata');
        El.append($('<option>').text('Not crossed').attr('value', 0));
        var idx = link.crossId;
        addOptFromObj(El, cache['crosses'], idx);
        if (idx)
            chainVertical(controls, link);
        }

    function chainVertical(controls, link) {
        var idx = link.crossId;
        if (idx > 0) {
            var data = cache.crosses[idx].verticals;
            if (!$.isEmptyObject(data)) {
                var El = controls.verticalEl;  // vertical selector
                idx = link.verticalId;
                addOptFromObj(El, data, idx);
                idx = El[0].value;
                link.verticalId = idx;
                if (idx)
                    chainPlint(controls, link);
                }
            }
        }

    function chainPlint(controls, link) {
        var idx = link.verticalId;
        if (idx > 0) {
            var data = cache.crosses[link.crossId].verticals[idx];
            //----------callback function---------------
                var callback = function(){
                    El = controls.plintEl;
                    var plintsdata = data['plints'].data;
                    //log(data);
                    if (plintsdata.length) {
                        //addOptFromArr(El, plintsdata);
                        $.each(plintsdata, function() {El.append($('<option>').text(this[1]+' : '+this[0]).attr('value', this[0]));});
                        El.prop('disabled', false);
                        var pair;
                        if (link.plintId) {
                            El.settovalue(link.plintId);
                            pair = link.pairId;
                        } else {             // false(default) - set to first
                            El.settofirst()    ;
                            link.plintId = El[0].value;
                            pair = 1;
                        }
                      si = El[0].selectedIndex;
                      El = controls.pairEl;
                      El.enumoptions(plintsdata[si][2]);
                      El.settovalue(pair);
                      link.pairId = pair;
                    }
//~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
refreshWatch();
//~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
                };
            //----------end callback function---------------
            aLoad(data, callback, 'plints', [link.verticalId]);
            }
        }

    function addOptFromObj(el, data, value) {
        $.each(data, function(key, item) {el.append($('<option>').text(item.title+' : '+key).attr('value', key));});
        el.prop('disabled', false);
        //value = typeof value !== 'undefined' ? value : 0;
        if (value) el.settovalue(value);
            else el.settofirst();
        }

    //function addOptFromArr(el, data) {
        //$.each(data, function() {el.append($('<option>').text(this[1]+' : '+this[0]).attr('value', this[0]));});
        //el.prop('disabled', false); }

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

    selectorChange = function(Eh) {
        //var index = Eh.attributes['data-index'].value;
        //var stage = Eh.attributes['data-stage'].value;
        var value = Eh.attributes['name'].value.split('_');
        var stage = value[0];
        var index = value[1];
        var link = chaindata[index];
        var controls = chaincontrols[index];
        var El = controls[stage+'El'];
        value = El[0].value;
        link[stage+'Id'] = value;
        //console.log('index:'+index+' stage:'+stage+' value:'+value);
        switch (stage) {
            case stages[0]: // cross
                //----vertical, plint, pair selectors disable---------
                controls.verticalEl.empty();
                controls.verticalEl.prop('disabled', true);
                link.verticalId = 0;
                plintDisable(controls, link);
                //--------------------------
                chainVertical(controls, link);
                break;
            case stages[1]: // vertical
                plintDisable(controls, link); //----- plint, pair selectors disable
                chainPlint(controls, link);
                break;
            case stages[2]: // plint
                var data = cache.crosses[link.crossId].verticals[link.verticalId].plints.data;
                controls.pairEl.enumoptions(data[El[0].selectedIndex][2]);
                break;
            case 'pair':
                //
        }
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
        refreshWatch();
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~

    }

    function drawSelectors(tr, controls, index) {
        $.each(stages, function() {
            var td = $('<td>');
            var sel = $('<select>', {class:"form-control",
                                     //"data-index":index,
                                     //"data-stage":this,
                                     name:this+"_"+index,
                                     //"size":"20",
                                     //onchange:this+"Change(this)"
                                     onchange:"selectorChange(this)"
                                     }).prop('disabled', true).appendTo(td);    // disabled controls
            td.appendTo(tr);
            controls[this+'El'] = sel;
        });}

    function plintDisable(controls, link) {
        controls.plintEl.empty();
        controls.plintEl.prop('disabled', true);
        link.plintId = 0;
        controls.pairEl.empty();
        controls.pairEl.prop('disabled', true);
        link.pairId = 0;
    }
}
/*** end controller functions ***/

    // start Chain Controller
    var cache = {};
    var chaincontrols = [];
    var chaindata = [];
    chaindata = [
        //{crossId:2, verticalId:39, plintId:558, pairId:1},  //Cross РШ 1Р, Vertical 0В, Plint БM4, Pair 0
        //{crossId:8, verticalId:64, plintId:845, pairId:2},  // Cross ЛАЗ, Vertical П15, Plint Р4, Pair 2
        //{crossId:8, verticalId:61, plintId:810, pairId:8},  // Cross ЛАЗ, Vertical 1В, Plint M5, Pair 8
        //{crossId:1, verticalId:37, plintId:541, pairId:4},
        //{crossId:4, verticalId:44, plintId:650, pairId:3},
        //{crossId:6, verticalId:47, plintId:0, pairId:0}   // empty vertical
    //#chain.append(dict(crossId=8, verticalId=63, plintId=839, pairId=6))
    //#chain.append(dict(crossId=8, verticalId=64, plintId=852, pairId=5))
    //#chain.append(dict(crossId=8, verticalId=63, plintId=840, pairId=4))
    //#chain.append(dict(crossId=8, verticalId=63, plintId=840, pairId=4))
    //#chain.append(dict(crossId=6, verticalId=47, plintId=840, pairId=4))    # empty vertical
    //#chain.append(dict(crossId=8, verticalId=67, plintId=840, pairId=4))
    //#chain.append(dict(crossId=8, verticalId=63, plintId=840, pairId=4))
    //#chain.append(dict(crossId=0, verticalId=0, plintId=0, pairId=0))
    //#chain.append(dict(crossId=22, verticalId=0, plintId=0, pairId=0))       # empty cross
    //#chain.append(dict(crossId=4, verticalId=44, plintId=650, pairId=3))
    ]

    var plintid = params.args[0];
    var pairid = params.args[1];
    var plintdata = sLoad(route.ajaxData, [plintid, pairid]);
    if (plintdata) {
        render(route, {_class:"primary", size:6, data:plintdata});
        var chaintableId = $("#chaintable");
        var chaintablewatchId = $("#chaintablewatch");
        $.each(chaindata, function(index, link){ // link is some {"crossId": 2, "verticalId": 39, "plintId": 558, "pairId": 1}
            var controls = {};
            var tr = $('<tr>');
            drawSelectors(tr, controls, index);
            chaincontrols.push(controls);
            tr.appendTo(chaintableId);
            chainCross(controls, link);
        });
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
        refreshWatch();
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
    }


}

