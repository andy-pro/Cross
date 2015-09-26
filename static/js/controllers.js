function regexchange(){
    var reg1 = new RegExp($('#regex').val(), 'g');
    var output = $('#output');
    var input = $('#request');
    txt1=input.val();

    //output.text(txt1.match(reg1));

    //var uri = 'http://your.domain/product.aspx?category=4&product_id=2140&query=lcd+tv';
    var queryString = {};
    txt1.replace(reg1, function($0, $1, $2, $3) {
    console.log("$0="+$0);
    console.log("$1="+$1);
    console.log("$2="+$2);
    console.log("$3="+$3);
    console.log("==================");
    queryString[$1] = $3;
    });
    console.log(queryString);
    console.log(txt1);
    }



/*** Router ***/
//======================================
(function(){
var routes = {};    // A hash to store our routes:
// The route registering function:
route = function (path, targetId, templateId, controller) {
  routes[path] = {targetId: targetId, templateId: templateId, controller: controller};
}
function router () {  // version with regex, replace
    var params = {};
    params.vars = {};
    params.args = location.hash.split("/");    // [""] - for home, ["#", "part1", "part2", ...]
    if (params.args.length > 1) {
        params.args.pop().replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) {
                params.vars[$1] = $3;
                if ($3 == undefined) params.args.push($1);
                });
        } else params.args.push("");
    var route = routes[params.args[1]];   // Get route by url
    if (route && route.controller) {
        el = document.getElementById(route.targetId); // Lazy load view element
        el.innerHTML = tmpl(route.templateId, new route.controller(params));
    }
}
//======================================
window.addEventListener('hashchange', router);    // Listen on hash change
window.addEventListener('load', router);    // Listen on page load
})();

//======================================
function router1 (event) {  // version with 'for, indexOf, split'
    el = el || document.getElementById('view'); // Lazy load view element
    var params = {};
    var up = location.hash.split("/");    // Current route url parts (getting rid of '#' in hash as well):
    console.log(up)
    var urlparts = (up.length > 1) ? up.slice(1) : [''];  // [""] - for home, ["#", "part1", "part2", ...]
    var lp = urlparts[urlparts.length-1];   // last part of url, it maybe with variables, e.g. arg1?var1=value1
    params.vars = {};
    var posq = lp.indexOf("?");
    if (posq > -1) {   // request contains variables
        urlparts[urlparts.length-1] = lp.slice(0,posq);    // last argument without variables
        var vars = lp.slice(posq+1).split("&");     // array of string something as ['var1=value1', 'var2=value2', ...]
        for (var i in vars) {
            posq = vars[i].indexOf("=");
            params.vars[vars[i].slice(0,posq)] = vars[i].slice(posq+1);
        }
    }
    params.args = (urlparts.length>1) ? urlparts.slice(1) : [];
    var route = routes[urlparts[0]];   // Get route by url
    if (route && el && route.controller) {
        // Render route template with John Resig's template engine:
        el.innerHTML = tmpl(route.templateId, new route.controller(params));
    }
}
//======================================
function router2 () {  // version with regex, replace
    el = el || document.getElementById('view'); // Lazy load view element
    var params = {};
    params.vars = {};
    params.args = location.hash.split("/");    // [""] - for home, ["#", "part1", "part2", ...]
    if (params.args.length > 1) {
        params.args.pop().replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) {
                params.vars[$1] = $3;
                if ($3 == undefined) params.args.push($1);
                });
        } else params.args.push("");
    var route = routes[params.args[1]];   // Get route by url
    if (route && el && route.controller) {
        el.innerHTML = tmpl(route.templateId, new route.controller(params));
    }
}
//======================================


route('', 'view', 'home', function () {});
route('page1', 'view', 'template1', page1Ctrl);
route('page2', 'view', 'template2', page2Ctrl);

function page1Ctrl(params) {
    this.greeting = 'Hello, Andy!';
    this.moreText = 'Bacon ipsum...';
    //console.log(params);
}

function page2Ctrl(params) {
    //var q='vars='; for (var i in params.vars) q += i+':'+params.vars[i];
    //var a = 'args='; for (var i in params.args) a += params.args[i] + ', ';

    //this.heading = 'I\'m page two! and var1='+q;
    return {heading : 'I\'m page two!', args:params.args, vars:params.vars}
    //console.log(params);
}


// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};

  console.log (this);
  this.tmpl = function tmpl(str, data){
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


homefunc = 'crossCtrl';

exitfnname = undefined;

rootpath = '/Cross/default/';
rootpathajax = rootpath + 'ajax_get';
stages = ['cross','vertical','plint','pair'];
w2p_attrs = {'data-w2p_method':"GET", 'data-w2p_disable_with':"default"};
mainarray = [];
cachearray = [];
pairarray = [];
users = {};
windowtitle = 'Cross';
T = {_CROSS_:'Cross',
     _VERTICAL_:'Vertical',
     _PLINT_:'Plint',
     _PAIR_:'Pair',
     _TITLE_:'Title'};

jQuery.fn.getPanel = function(head, content, _opt) {
//default : grey; primary : deep blue; success : green; info : blue; warning : pink; danger : red
//<a href='#' class=><span class="glyphicon glyphicon-remove"></span></a>
    var opt = {class:"info", close:true, size:'4', link:homefunc, width100:false};
    $.extend(opt, _opt);
    var panel = $('<div>', {class:"panel panel-"+opt.class}); // addClass
    var hddiv = $('<div>', {class:'panel-heading'}).append(head);
    if (opt.close) {
        var attcl = {class:"btn btn-xs pull-right btn-"+opt.class, onclick:opt.link+'()'};
        hddiv.append($('<button>', attcl).append($('<span>', {class:"glyphicon glyphicon-remove"})));
    }
    hddiv.appendTo(panel);
    //width100=false;
    if (opt.width100) {panel.append(content);}
        else {
            var body = $('<div>', {class:'panel-body'});
            body.append(content);
            body.appendTo(panel);
        }
    $('<div>', {class:'col-md-'+opt.size}).append(panel).appendTo(this);
}

function getPairList(vert_id) {
//console.log('start')
    jQuery.ajax({
      url: rootpathajax+"PairList.json/"+vert_id,
      async: false,
      success: function( data ) {
        if (!cachearray[vert_id]) cachearray[vert_id] = {};
        windowtitle = data.title;
        cachearray[vert_id].items = data.items;
        pairarray = data.pairs;
        users = data.users;
        //console.log(users)
    } });
  }

document.onkeydown = function(e) {
  if (e.keyCode == 27) { // escape key code
    //eval(homefunc);
    var fn = window[exitfnname];    // convert string to a pointer
    if(typeof fn === 'function') fn(); }}

function render(tmpl_name, tmpl_data) {
    if ( !render.tmpl_cache ) {
        render.tmpl_cache = {};
    }
    if ( ! render.tmpl_cache[tmpl_name] ) {
        render.tmpl_cache[tmpl_name] = _.template($('#'+tmpl_name).html());   // in templates.html file
    }
    return render.tmpl_cache[tmpl_name](tmpl_data);
}

/*** Cross Controller ***/
crossCtrl = function(init=false) {

exitfnname = undefined;
crosshome = $("#crosshome");
crosshome.empty();


dataObject1 = {i:1, label:"Content", from_user:"Andy Pro", text:"Bold text", counter:10};
dataObject2 = {_class:1, label:"Maximum", from_user:"Max Pro", text:"Bold text 2", counter:10};
dataObject3 = {_class:1, label:"Andymum", from_user:"Andy Oksy Pro", text:"Some Amazing text", counter:4};

    var results = document.getElementById("results");
    results.innerHTML = tmpl("item_tmpl1", dataObject1);

    var now1 = new Date();
    t1=now1.getTime();
    var html1 = tmpl("item_tmpl2", dataObject2);
    results.insertAdjacentHTML('beforeend', html1);
    var now2 = new Date();
    t2=now2.getTime();
    console.log(t2-t1);

    var now1 = new Date();
    t1=now1.getTime();
    var html1 = tmpl("item_tmpl2", dataObject2);
    crosshome.append(html1);
    var now2 = new Date();
    t2=now2.getTime();
    console.log(t2-t1);

    var now1 = new Date();
    t1=now1.getTime();
    var pre_tmpl2 = tmpl("item_tmpl2");
    crosshome.append(pre_tmpl2(dataObject2));
    var now2 = new Date();
    t2=now2.getTime();
    console.log(t2-t1);

    var now1 = new Date();
    t1=now1.getTime();
    crosshome.append(pre_tmpl2(dataObject2));
    var now2 = new Date();
    t2=now2.getTime();
    console.log(t2-t1);



    //pre-compile the results for later use
    pre_tmpl = tmpl("item_tmpl2");
    //console.log(pre_tmpl);
    crosshome.append(pre_tmpl(dataObject2));
    crosshome.append(pre_tmpl(dataObject3));

    crosshome.append('Example');
    crosshome.append(tmpl("<label><%= name %></label>", {name:"John"}));

userbank = [
{name:"Andy", url:"url1"},
{name:"Oksy", url:"url2"},
{name:"Maxy", url:"url3"}
];

    var show_user = tmpl("item_tmpl0"), html = "";
    for ( var i = 0; i < userbank.length; i++ ) {
      html += show_user( userbank[i] );
    }
    crosshome.append("<div class='well'>"+html+"</div>");




    if (init) jQuery.ajax({
        url: rootpathajax+"MainArray.json",
        async: false,
        success: function( data ) { mainarray = data.items; } });

    var context = {_class:"default", size:4, mainarray:mainarray};

    t1=(new Date()).getTime();
    var dom = render('crosslistTmpl', context);
    crosshome.append(dom);
    t2=(new Date()).getTime();
    var t3 = t2-t1;
    console.log('cross1: '+t3);

    context = {_class:"info", size:4, mainarray:mainarray};

    t1=(new Date()).getTime();
    var pre_tmpl2 = tmpl("crosslistTmpl2");
    crosshome.append(pre_tmpl2(context));
    t2=(new Date()).getTime();
    var t3 = t2-t1;
    console.log('cross2: '+t3);

    var results4 = document.getElementById("results4");
    t1=(new Date()).getTime();
    var pre_tmpl3 = tmpl("crosslistTmpl3");
    for (var im in mainarray) {
    context = {_class:"warning", size:4, cross:mainarray[im]};
    //crosshome.append(pre_tmpl3(context));
    results4.insertAdjacentHTML('beforeend', pre_tmpl3(context));
    }
    t2=(new Date()).getTime();
    var t3 = t2-t1;
    console.log('cross3: '+t3);

    t1=(new Date()).getTime();
    var pre_tmpl4 = tmpl("crosslistTmpl4");
    context = {_class:"success", size:4, cross:mainarray};
    crosshome.append(pre_tmpl4(context));
    t2=(new Date()).getTime();
    var t3 = t2-t1;
    console.log('cross4: '+t3);

      console.log ('end');

}

crossEdit = function(id) {
console.log(id);
}
/* end cross home page controller */

/*** Vertical Controller ***/
verticalCtrl = function(id) {
    crosshome = $("#crosshome");
    exitfnname = homefunc;
    getPairList(id);
    crosshome.empty();  //crosshome = $("#crosshome");

    var context = {_class:"default", size:'full', mainarray:cachearray[id].items, pairarray:pairarray, users:users, id:id, windowtitle:windowtitle, link:homefunc};
   // var cmp = _.template($('#plintlistTmpl').html());   // in templates.html file
    var dom = render('plintlistTmpl', context);
    crosshome.append(dom);
}
/* vertical controller */

verticalDisable = function(link, controls) {
    controls.verticalEl.empty();
    controls.verticalEl.prop('disabled', true);
    link.verticalId = 0;
    plintDisable(link, controls);
  }

plintDisable = function(link, controls) {
      controls.plintEl.empty();
      controls.plintEl.prop('disabled', true);
      link.plintId = 0;
      controls.pairEl.empty();
      controls.pairEl.prop('disabled', true);
      link.pairId = 0;
   }

jQuery.fn.settofirst = function() {
  jQuery(':nth-child(1)', this).attr('selected', 'selected');
}

jQuery.fn.settovalue = function(value) {
  jQuery('[value='+value+']' , this).attr('selected', 'selected');
}

jQuery.fn.addoptions = function (data, add_none) {
  if (add_none) this.append(jQuery('<option>').text('Not crossed').attr('value', 0));
  var e = this;
  jQuery.each(data, function() {e.append(jQuery('<option>').text(this[1]).attr('value', this[0]));});
  this.prop('disabled', false);
}

jQuery.fn.enumoptions = function (start) {
    var e = jQuery('option', this) // get options set of select
    if (e.length) {  // if options exist, simply change text
        jQuery.each(e, function (i) {this.text = i + start});
    } else {
        this.prop('disabled', false);   // if it was early cleared and disabled, append new options
        for (i= 1; i <= 10; i++) {
            this.append(jQuery('<option>').text(i+start-1).attr('value', i));
        }
    }
}

function setPlintPair(controls, link, tovalue=false) {
  El = controls.plintEl;
  data = cachearray[link.verticalId].items;
  if (data.length) {
    El.addoptions(data);
    var pair;
    if (tovalue) {        // true - set index of <select> to preset from server
      El.settovalue(link.plintId);
      pair = link.pairId;
    } else {             // false(default) - set to first
        El.settofirst()    ;
        link.plintId = El[0].value;
        pair = 1;
      }
    si = El[0].selectedIndex;
    El = controls.pairEl;
    El.enumoptions(data[si][2]);
    El.settovalue(pair);
    link.pairId = pair;
  }
  refreshWatch();
}

function getPlintList(vert_id, callback) {
  if (!cachearray[vert_id]) {
    cachearray[vert_id] = {};
    cachearray[vert_id].targets = [];
    jQuery.ajax({
      url: rootpathajax+"PlintList.json/"+vert_id,
      //async: false,
      success: function( data ) {
        cachearray[vert_id].items = data.items;
        $.each(cachearray[vert_id].targets, function() {this()});
        delete cachearray[vert_id].targets;
    } });
  }
  if (cachearray[vert_id].items) callback();
    else cachearray[vert_id].targets.push(callback);
};

drawSelectors = function(tr, controls, index) {
    $.each(stages, function() {
        var td = $('<td>');
        var sel = $('<select>', {class:"form-control",
                                 "data-index":index,
                                 "data-stage":this,
                                 //"size":"20",
                                 //onchange:this+"Change(this)"
                                 onchange:"selectorChange(this)"
                                 }).prop('disabled', true).appendTo(td);    // disabled controls
        td.appendTo(tr);
        controls[this+'El'] = sel;
    });}

/*** Chain Controller ***/
chainCtrl = function() {

    crosshome = $("#crosshome");
    editdialog = $("#editdialog");
    //var context = {_class:"default", size:'full', mainarray:cachearray[id].items, pairarray:pairarray, users:users, id:id, windowtitle:windowtitle, link:homefunc};
    //var attrs = {href:rootpath+'editpair/558/1', text:'editpair', 'data-w2p_target':"editdialog"};
    var headers = [T._CROSS_, T._VERTICAL_, T._PLINT_, T._PAIR_];
    var context = {_class:"primary", size:6, link:homefunc, headers:headers};
    var dom = render('chainTmpl', context);
    editdialog.append(dom);

    $("#editdialog").show();
    $(".container-fluid").fadeTo('slow', 0.6);
    //console.log('show')
    chaintable = $("#chaintable");
    //chaintablewatch = $("#chaintablewatch");
    chaincontrols = [];
    chaindata = [];

    $.each(chaindata, function(index, link){ // link is some {"crossId": 2, "verticalId": 39, "plintId": 558, "pairId": 1}
        var controls = {};
        var tr = $('<tr>');
        drawSelectors(tr, controls, index);
        chaincontrols.push(controls);
        tr.appendTo(chaintable);
        var crs = controls.crossEl;  // cross selector
        var vls = controls.verticalEl;  // vertical selector
        crs.addoptions(mainarray, true);
        crs.settovalue(link.crossId);
        var crsi = crs[0].selectedIndex;
        if (crsi > 0) {
            crsi--;
            data = mainarray[crsi][2];
            if (data.length) {
                vls.addoptions(data);
                vls.settovalue(link.verticalId);
                var cb = function(){setPlintPair(controls, link, true)};    // true - set index of <select> to preset from server, false(default) set to first
                getPlintList(link.verticalId, cb);
            }
        }
        //refreshWatch();
    });
}

addLink = function () {
    var index = chaindata.length;
    var link = {};
    var controls = {};
    var tr = $('<tr>');
    drawSelectors(tr, controls, index);
    $.each(stages, function() { link[this+'Id'] = 0; });
    controls.crossEl.addoptions(mainarray, true);
    chaindata.push(link);
    chaincontrols.push(controls);
    tr.appendTo(chaintable);
}

selectorChange = function(Eh) {
    var index = Eh.attributes['data-index'].value;
    var stage = Eh.attributes['data-stage'].value;
    var link = chaindata[index];
    var controls = chaincontrols[index];
    var El = controls[stage+'El'];
    var value = El[0].value;
    link[stage+'Id'] = value;
    var si = El[0].selectedIndex;
    //console.log('index:'+index+' stage:'+stage+' value:'+value);
    var cb = function(){setPlintPair(controls, link)};
    switch (stage) {
        case 'cross':
            verticalDisable(link, controls);
            if (si > 0) {
                si--;
                var vls = controls.verticalEl;
                data = mainarray[si][2];
                if (data.length) {
                    vls.addoptions(data);
                    vls.settofirst();
                    link.verticalId = vls[0].value;
                    getPlintList(link.verticalId, cb);
                }
            }
            break;
        case 'vertical':
            plintDisable(link, controls);
            getPlintList(value, cb);
            break;
        case 'plint':
            var data = cachearray[link.verticalId].items;
            controls.pairEl.enumoptions(data[si][2]);
            break;
        case 'pair':
            //
    }
    //refreshWatch();
}

//refreshWatch = function() {
 function refreshWatch() {
    jQuery("table tr").remove(".refreshing");
    $.each(chaindata, function(i, link) {
        var tr = $('<tr>', {class:"refreshing"});
        $('<td>', {class:"warning"}).text(i).appendTo(tr);
        $.each(stages, function() { $('<td>').text(link[this+'Id']).appendTo(tr); });
        tr.appendTo(chaintablewatch);
    });
}