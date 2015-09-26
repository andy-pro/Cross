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


/* start cross home page controller from here */

//testw2p = $("#testw2p");
//var title = $('<a>', {href:rootpath+'cross/1', text:'test', cid:'request.cid'});
//title.appendTo(testw2p);
document.onkeydown = function(e) {
  if (e.keyCode == 27) { // escape
    //eval(homefunc);
    var fn = window[exitfnname];    // convert string to a pointer
    //console.log(fn);
    if(typeof fn === 'function') {
        fn();
        //console.log('ok, exiting');
    }}}


/*** Cross Controller ***/
crossCtrl = function(init=false) {
    exitfnname = undefined;
    crosshome = $("#crosshome");
    crosshome.empty();

    if (init) jQuery.ajax({
        url: rootpathajax+"MainArray.json",
        async: false,
        success: function( data ) { mainarray = data.items; } });

    //var template = Handlebars.compile(template1);    // Compile that into an handlebars template
    //var placeHolder = $("#crosshome");      // Retrieve the placeHolder where the Posts will be displayed
    //var context = {"title": "First Post", "body": "You can't stop me now!"};  // Create a context to render the template
    //var html = template(context);      // Generate the HTML for the template
    //placeHolder.append(html);      // Render the posts into the page

  //{{#each pairs}}
    //<li>pairs</li>
//<ul>{{#each this}}<li>{{this.[0]}}</li>{{/each}}</ul>
  //{{/each}}

//var mypanelTmpl = '{{#each mainarray}}<div class="col-md-{{size}}"><div class="panel panel-{{class}}"><div class="panel-heading">{{title}}</div><div class="panel-body">{{body}}</div></div></div>{{/each}}';
    var template = Handlebars.compile(crosslistTmpl);
    crosshome.append(template({class:"default", size:4, mainarray:mainarray}));      // Render the posts into the page

    //$.each(mainarray, function(){
        //var crossid = this[0];
        //var head = $('<a>', {class:"mybtn-link", text:this[1], onclick:"crossEdit("+crossid+")"});
        //var content = [];
        //$.each(this[2], function(){
            //content.push($('<a>', {class:"mybtn-link", text:this[1], onclick:'verticalCtrl('+this[0]+')'})); });
        //crosshome.getPanel(head, content, {class:'default', close:false});
    //});



        //var attrs = {href:rootpath+'editpair/558/1', text:'editpair', 'data-w2p_target':"editdialog"};
        //$.extend(attrs, w2p_attrs);
        //$('<a>', attrs).appendTo(crosshome);
        //$('<a>', {class:"btn btn-link", text:"Vertical", onclick:"verticalCtrl(51)"}).appendTo(crosshome);

    //$.each(mainarray, function(){
        //var crossid = this[0];
        //var head = $('<a>', {class:"mybtn-link", text:this[1], onclick:"crossEdit("+crossid+")"});
        //var content = [];
        //$.each(this[2], function(){
            //content.push($('<a>', {class:"mybtn-link", text:this[1], onclick:'verticalCtrl('+this[0]+')'})); });
        //crosshome.getPanel(head, content, {class:'default', close:false});
    //});


//<button type="button" class="btn btn-link">Ссылка</button>

        //console.log(this[1]);
        //console.log(this[2]);

//lst = (A(vertical.title, _href=URL('vertical', args=vertical.id), cid=request.cid)+', ' for vertical in verticals)
 //       table.append(DIV(DIV(DIV(A(B(cross.title), _href=URL('cross', args=cross.id), cid=request.cid), _class='panel-heading'), DIV(*lst, _class='panel-body'), _class="panel panel-info"), _class='col-lg-4'))
}


crossEdit = function(id) {
console.log(id);
}
/* end cross home page controller */

/*** Vertical Controller ***/
verticalCtrl = function(id) {
    //crosshome = $("#crosshome");
    exitfnname = homefunc;
    getPairList(id);
    crosshome.empty();  //crosshome = $("#crosshome");
    var head = $('<a>', {class:"mybtn-link", text:windowtitle, onclick:"verticalEdit("+id+")"});
    var tb = $('<table>', {class:'cross'});
    //items: id, title, start1, comdata, modon, modby
    $.each(cachearray[id].items, function(i, plint){
        var tr = $('<tr>');
        var td = $('<td>', {class:"colv1"});
        _title = 'Plint: '+plint[1]+'\n'+plint[4]+'\n'+users[plint[5]]+'\nCommon data: '+plint[3];
        $('<a>', {class:"mybtn-link", text:plint[1], title:_title}).appendTo(td);
        td.appendTo(tr);
        var start = plint[2];
        $.each(pairarray[i], function(i, pair){
            t = pair[0];
            _title = (t) ? t+'\n'+pair[1]+'\n'+users[pair[2]] : ''  // pairtitle,when,who
            td = $('<td>').append($('<a>', {class:"mybtn-link", text:t, title:_title}).prepend($('<sup>', {text:i+start+'  '})));
            td.appendTo(tr);
        });
        tdcl = 'commondata';
        td = $('<td>', {class:tdcl, text:plint[3]}).css("border-left", "2px solid #ccc");
        td.appendTo(tr);
        tr.appendTo(tb);
    });
    crosshome.getPanel(head, tb, {class:'default', size:'full', width100:true});
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
    var attrs = {href:rootpath+'editpair/558/1', text:'editpair', 'data-w2p_target':"editdialog"};
    $.extend(attrs, w2p_attrs);
    $('<a>', attrs).appendTo(crosshome);
    $('<a>', {class:"btn btn-link", text:"Vertical", onclick:"verticalCtrl(51)"}).appendTo(crosshome);
    var content = [];
    var form = $('<form>', {class:"form-horizontal", role:"form"});
    var input = $('<input>', {class:"form-control"});
    var group = $('<div>', {class:"form-group"}).append($('<label>', {class:"col-md-2 control-label", text:T._TITLE_}));
    group.append($('<div>', {class:"col-md-8"}).append(input));
    group.appendTo(form);
    $('<button>', {class:'btn-sm btn-success pull-right',text:'+', title:'Add link to chain', onclick:"addLink()"}).appendTo(form);
    //        hddiv.append($('<button>', attcl).append($('<span>', {class:"glyphicon glyphicon-remove"})));
    var headers = [T._CROSS_, T._VERTICAL_, T._PLINT_, T._PAIR_];
    var tr = $('<tr>');
    $.each(headers, function(){
        var td = $('<td>', {text:this});
        td.appendTo(tr);
    });
    console.log(tr);
    $('<table>', {id:"chaintable",class:'table-dialog'}).append(tr).appendTo(form);
    head = 'title';
    crosshome.getPanel(head, form, {class:'primary', size:'6', close:false});


    //$("#editdialog").show();
    //$(".container-fluid").fadeTo('slow', 0.4);
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